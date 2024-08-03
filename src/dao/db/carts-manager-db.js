import CartsModel from "../models/carts.model.js";
import ProductsModel from "../models/products.model.js";
import mongoose from "mongoose";

class CartManager {
  ////////////////// OBTENER TODOS LOS CARRITOS (CON LIMITE Y PAGINACIÓN) ////////////////////////////
  async getCarts(reqQuery = {}) {
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
      const sortOptions = {};
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

      const carts = await CartsModel.find(queryOptions)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("products.product");
      const totalCarts = await CartsModel.countDocuments(queryOptions);

      // FUNCION PARA OBTENER LINKS TO GO
      const baseLink = (pageToGo) => {
        return `/api/carts?limit=${limit}&page=${pageToGo}&sort=${sort}&query=${query}`;
      };

      const totalPages = Math.ceil(totalCarts / limit);
      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;
      const prevPage = hasPrevPage ? page - 1 : null;
      const nextPage = hasNextPage ? page + 1 : null;
      const prevLink = hasPrevPage ? baseLink(page - 1) : null;
      const nextLink = hasNextPage ? baseLink(page + 1) : null;
      data = {
        docs: carts,
        totalCarts,
        totalPages,
        prevPage,
        nextPage,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink,
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

  ////////////////// GESTIONAR CARRITO (CRUD) /////////////////////////////////////////////////////////
  async addCart(cardData) {
    const statusOK = 201;
    let message = "";
    let inError = false;
    let data;
    try {
      const products = cardData?.products || [];
      const newCart = new CartsModel({ products });
      await newCart.save();
      const carts = await this.getCarts();
      data = {
        createdCart: newCart,
        totalCarts: carts?.data?.totalCarts || 0,
      };
      message = "Created Cart";
    } catch (error) {
      inError = true;
      message = `Cart Creation Failed - Error: ${error}`;
    }
    return {
      status: inError ? 500 : statusOK,
      message: inError ? undefined : message,
      error: inError ? message : undefined,
      data,
    };
  }
  async getCartById(cartId) {
    const statusOK = 200;
    let statusError = 500;
    let message = "";
    let inError = false;
    let data;
    try {
      console.log("ID", cartId);
      const cart = await CartsModel.findById(cartId);
      if (!cart) {
        statusError = 400;
        throw "Cart not Found";
      }
      data = {
        cart,
      };
      message = "Cart Data Obtained";
    } catch (error) {
      inError = true;
      message = `Failed to check cart - Error: ${error}`;
    }
    return {
      status: inError ? statusError : statusOK,
      message: inError ? undefined : message,
      error: inError ? message : undefined,
      data,
    };
  }
  async updateCart(cartId, productId, quantity = 1) {
    const statusOK = 201;
    let statusError = 500;
    let message = "";
    let inError = false;
    let data;
    try {
      const cart = await this.getCartById(cartId);
      const product = await ProductsModel.findById(productId);

      // VALIDACIONES INICIALES
      if (!cart) {
        statusError = 400;
        throw "No se encontró el carrito a modificar";
      }
      if (!product) {
        statusError = 400;
        throw "El producto a agregar no existe";
      }
      ///////////////////////////////////////////////////////////////////

      // AGREGAR PRODUCTO O SUMAR CANTIDAD AL CARRITO
      const productInCart = cart.products.find((p) => p.id === productId);
      if (productInCart) productInCart.quantity += quantity;
      else cart.products.push({ id: productId, quantity });

      // ACTUALIZAR Y MARCAR PROPIEDAD PRODUCTOS COMO MODIFICADA
      cart.markModified("products");
      await cart.save();

      data = {
        updatedCart: cart,
      };
      message = "Cart has been updated";
    } catch (error) {
      inError = true;
      message = `Failed to check cart - Error: ${error}`;
    }
    return {
      status: inError ? 500 : statusOK,
      message: inError ? undefined : message,
      error: inError ? message : undefined,
      data,
    };
  }
  async deleteCart(cartId) {
    const statusOK = 204;
    let message = "";
    let inError = false;
    let data;
    try {
      const deletedCart = await CartsModel.findByIdAndDelete(cartId);
      const totalCarts = (await this.getCarts().docs?.length) || 0;

      if (!deletedCart) throw "The cart does not exist";
      message = `Cart successfully deleted - ${totalCarts} carts left registered`;
      data = {
        deletedCart,
      };
    } catch (error) {
      inError = true;
      message = `Failed to check cart - Error: ${error}`;
    }
    return {
      status: inError ? 500 : statusOK,
      message: inError ? undefined : message,
      error: inError ? message : undefined,
      data,
    };
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////
}

export default CartManager;
