import ProductsModel from "../models/products.model.js";

class ProductManager {
  ////////////////// OBTENER TODOS LOS PRODUCTOS (CON LIMITE Y PAGINACIÓN) ////////////////////////////
  async getProducts(reqQuery = {}) {
    const statusOK = 200;
    let message = "";
    let inError = false;
    let data;
    try {
      // PARÁMETROS DE CONSULTA
      const { queryField, queryValue, sortField, sortValue } = reqQuery;
      const query =
        queryField && queryValue ? { [queryField]: queryValue } : {};
      const sort = sortField && sortValue ? { [sortField]: sortValue } : {};
      const limit = parseInt(reqQuery?.limit || 10);
      const page = parseInt(reqQuery?.page || 1);

      // QUERY
      const queryOptions = { ...query };

      // SORT
      const sortFields = Object.keys(sort);
      const sortOptions = sortFields.length ? {} : { sku: 1 };
      sortFields.forEach((field) => {
        const orders = {
          1: 1,
          asc: 1,
          "-1": -1,
          desc: -1,
        };
        const orderField = sort[field]?.toString();
        const sortOrder = orders[orderField];
        if (sortOrder) sortOptions[field] = sortOrder;
      });

      // SKIP
      const skip = (page - 1) * limit;

      // AGREGATE PARA PAGINAR Y AGRUPAR
      const productsAggregation = await ProductsModel.aggregate([
        { $match: queryOptions },
        {
          $facet: {
            paginated: [
              { $sort: sortOptions },
              { $skip: skip },
              { $limit: limit },
            ],
            grouped: [
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  skuList: { $push: "$sku" },
                  idList: { $push: "$_id" },
                },
              },
            ],
          },
        },
      ]);

      const products = productsAggregation[0]?.paginated || [];
      const totalProducts = productsAggregation[0]?.grouped[0]?.count || 0;
      const skuList = productsAggregation[0]?.grouped[0]?.skuList || [];
      const idList = productsAggregation[0]?.grouped[0]?.idList || [];

      // FUNCION PARA OBTENER LINKS TO GO
      const baseLink = (pageToGo) => {
        const queryString =
          queryField && queryValue
            ? `&queryField=${queryField}&queryValue=${queryValue}`
            : "";
        const sortString =
          sortField && sortValue
            ? `&sortField=${sortField}&sortValue=${sortValue}`
            : "";
        return `/api/products??limit=${limit}&page=${pageToGo}${queryString}${sortString}`;
      };

      const totalPages = Math.ceil(totalProducts / limit);
      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;
      const prevPage = hasPrevPage ? page - 1 : null;
      const nextPage = hasNextPage ? page + 1 : null;
      const prevLink = hasPrevPage ? baseLink(page - 1) : null;
      const nextLink = hasNextPage ? baseLink(page + 1) : null;

      data = {
        docs: products,
        totalProducts,
        totalPages,
        prevPage,
        nextPage,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink,
        skuList,
        idList,
      };
      message = "Successful Query";
    } catch (error) {
      inError = true;
      message = `Failed Query - Error: ${error}`;
    }
    return {
      status: inError ? 500 : statusOK,
      message: inError ? undefined : message,
      error: inError ? message : undefined,
      data,
    };
  }
  ////////////////// GESTIONAR PRODUCTO (CRUD) ///////////////////////////////////////////
  async addProduct({
    sku,
    title,
    price,
    description,
    category,
    image, // OPCIONAL
    rate, // OPCIONAL
    count, // OPCIONAL
    active, // OPCIONAL
    stock, // OPCIONAL
  }) {
    const statusOK = 201;
    let statusError = 500;
    let message = "";
    let inError = false;
    let data;
    try {
      const allProducts = (await this.getProducts()?.data?.skuList) || [];
      // VALIDACIONES INICIALES
      if (!sku || !title || !price || !description || !category) {
        statusError = 400;
        throw "Campos obligatorios (Sku, Título, Precio, Descripción, Categoria)";
      }
      if (typeof sku != "number") {
        statusError = 400;
        throw "El SKU debe ser un número";
      }
      if (allProducts.some((productSku) => productSku === sku)) {
        statusError = 400;
        throw "El SKU debe ser único";
      }

      // DATOS DE PRODUCTO
      const productData = {
        sku,
        title,
        price,
        description,
        category,
        image: image || null,
        rating: {
          rate: rate && count ? rate : 0,
          count: rate && count ? count : 0,
        },
        active: active || true,
        stock: stock || 0,
      };

      // CREAR PRODUCTO
      const createdProduct = new ProductsModel(productData);
      await createdProduct.save();

      data = {
        createdProduct,
      };
      message = "Created Product";
    } catch (error) {
      inError = true;
      message = `Product Creation Failed - Error: ${error}`;
    }
    return {
      status: inError ? statusError : statusOK,
      message: inError ? undefined : message,
      error: inError ? message : undefined,
      data,
    };
  }
  async getProductById(productId) {
    const statusOK = 200;
    let message = "";
    let inError = false;
    let data;
    try {
      const product = await ProductsModel.findById(productId);
      data = {
        product,
      };
      message = "Product Data Obtained";
    } catch (error) {
      inError = true;
      message = `Failed Query - Error: ${error}`;
    }
    return {
      status: inError ? 500 : statusOK,
      message: inError ? undefined : message,
      error: inError ? message : undefined,
      data,
    };
  }
  async updateProduct(productId, dataToUpdate) {
    const statusOK = 200;
    let statusError = 500;
    let message = "";
    let inError = false;
    let data;
    try {
      const product = await this.getProductById(productId);
      const props = Object.keys(dataToUpdate || {});

      ///////////////////// VALIDACIONES
      if (!product) {
        statusError = 400;
        throw "No se encontró el producto a modificar";
      }
      if (!props.length) {
        statusError = 400;
        throw "Debe ingresar al menos un dato para modificar";
      }
      if (props.includes("sku")) {
        statusError = 400;
        throw "No puede modificar el sku";
      }
      if (props.includes("id")) {
        statusError = 400;
        throw "No puede modificar el id";
      }
      ////////////////////////////////////////////////////

      // ACTUALIZAR PRODUCTO
      props.forEach((prop) => {
        product[prop] = dataToUpdate[prop];
      });
      await product.save();

      data = {
        updatedProduct: product,
      };
      message = "Product has been updated";
    } catch (error) {
      inError = true;
      message = `Failed Query - Error: ${error}`;
    }
    return {
      status: inError ? 500 : statusOK,
      message: inError ? undefined : message,
      error: inError ? message : undefined,
      data,
    };
  }
  async deleteProduct(productId) {
    const statusOK = 204;
    let statusError = 500;
    let message = "";
    let inError = false;
    let data;
    try {
      const deletedProduct = await ProductsModel.findByIdAndDelete(productId);
      const totalProducts = (await this.getProducts().docs?.length) || 0;
      if (!deletedProduct) {
        statusError = 400;
        throw "No se encontró el producto a eliminar";
      }
      data = {
        deletedProduct,
      };
    } catch (error) {
      inError = true;
      message = `Failed Query - Error: ${error}`;
    }
    return {
      status: inError ? statusError : statusOK,
      message: inError ? undefined : message,
      error: inError ? message : undefined,
      data,
    };
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////
}

export default ProductManager;
