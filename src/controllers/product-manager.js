import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";

class ProductManager {
  constructor(path) {
    this.products = [];
    this.path = path;
  }

  ////////////////// MANEJO DEL ARCHIVO Y DATOS //////////////////////////////////////////////////////
  async readFile() {
    try {
      const response = await fs.readFile(this.path, "utf-8");
      return JSON.parse(response || []);
    } catch (e) {
      throw e;
    }
  }
  async writeFile(allProducts) {
    try {
      await fs.writeFile(this.path, JSON.stringify(allProducts, null, 2));
    } catch (e) {
      throw e;
    }
  }
  ////////////////// OBTENER DATOS DE PRODUCTOS ///////////////////////////////////////////
  async getProducts() {
    try {
      return await this.readFile();
    } catch (e) {
      throw e;
    }
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
    stock, // OPCIONAL
  }) {
    try {
      const allProducts = await this.readFile();

      // VALIDACIONES INICIALES
      if (!sku || !title || !price || !description || !category) {
        return {
          status: 400,
          error:
            "Campos obligatorios (Sku, Título, Precio, Descripción, Categoria)",
        };
      }
      if (typeof sku != "number") {
        return { status: 400, error: "El SKU debe ser un número" };
      }
      if (allProducts.some((item) => item.sku === sku)) {
        return { status: 400, error: "El SKU debe ser único" };
      }

      const createdProduct = {
        id: uuidv4(),
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
        stock: stock || 0,
        active: true,
      };

      allProducts.push(createdProduct);
      await this.writeFile(allProducts);
      return {
        status: 201,
        message: `Se ha creado el producto con el SKU ${createdProduct.sku}`,
      };
    } catch (e) {
      throw e;
    }
  }
  async getProductById(productId) {
    try {
      const allProducts = await this.readFile();
      const product = allProducts.find((item) => item.id === productId);
      if (!product) return null;
      else return product;
    } catch (e) {
      throw e;
    }
  }
  async updateProduct(productId, dataToUpdate) {
    try {
      const allProducts = await this.readFile();
      const product = allProducts.find((item) => item.id === productId);
      const props = Object.keys(dataToUpdate || {});
      if (!props.length)
        return {
          status: 400,
          error: "Debe ingresar al menos un dato para modificar",
        };
      if (!product)
        return { status: 400, error: "No se encontró el producto a modificar" };
      if (props.includes("sku"))
        return { status: 400, error: "No puede modificar el sku" };
      if (props.includes("id"))
        return { status: 400, error: "No puede modificar el id" };
      props.forEach((prop) => {
        product[prop] = dataToUpdate[prop];
      });
      await this.writeFile(allProducts);
      return {
        status: 200,
        message: `Se ha actualizado el producto correctamente`,
        updatedProduct: product,
      };
    } catch (e) {
      throw e;
    }
  }
  async deleteProduct(productId) {
    try {
      const allProducts = await this.readFile();
      const index = allProducts.findIndex((item) => item.id === productId);

      if (index !== -1) {
        allProducts.splice(index, 1);
        await this.writeFile(allProducts);
        return {
          status: 200,
          message: `Producto eliminado exitosamente - Quedaron ${allProducts.length} productos registrados`,
        };
      } else {
        return {
          status: 400,
          error: "No se encontró el producto a eliminar",
        };
      }
    } catch (e) {
      throw e;
    }
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////
}

export default ProductManager;
