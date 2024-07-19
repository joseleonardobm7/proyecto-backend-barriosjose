import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";

class CartManager {
  constructor(path) {
    this.carts = [];
    this.path = path;
    // SE INICIALIZAN LOS CARRITOS DESDE EL ARCHIVO
    this.getCarts();
  }

  ////////////////// MANEJO DEL ARCHIVO Y DATOS //////////////////////////////////////////////////////
  async getCarts() {
    try {
      const data = await fs.readFile(this.path, "utf8");
      this.carts = JSON.parse(data);
    } catch (error) {
      console.error("Error al cargar los carritos desde el archivo", error);
      // SI NO EXISTE UN ARCHIVO LO CREA VACÍO (SIN CARRITOS)
      await this.updateCarts();
    }
  }
  async updateCarts() {
    await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
  }

  ////////////////// GESTIONAR CARRITO (CRUD) /////////////////////////////////////////////////////////
  async addCart() {
    const newCart = {
      id: uuidv4(),
      products: [],
    };
    this.carts.push(newCart);
    await this.updateCarts();
    return {
      status: 201,
      message: `Se ha creado el carrito con éxito.`,
      cart: newCart,
      totalCarts: this.carts.length,
    };
  }
  async getCartById(cartId) {
    try {
      const cart = this.carts.find((c) => c.id === cartId);
      if (!cart) return null;
      else return cart;
    } catch (e) {
      throw e;
    }
  }
  async updateCart(cartId, productId, quantity = 1) {
    const cart = await this.getCartById(cartId);
    if (!cart)
      return { status: 400, error: "No se encontró el carrito a modificar" };
    const existsProduct = await fetch(
      `http://localhost:8080/api/products/${productId}`
    );
    if (!existsProduct.ok) {
      throw new Error(
        `Ocurrió un error al consultar el producto que desea agregar al carrito`
      );
    }
    const product = await existsProduct.json();
    if (!product?.id) {
      return {
        status: 400,
        error:
          "El producto que quiere agregar al carrito no se encuentra creado.",
      };
    }
    const productInCart = cart.products.find((p) => p.id === productId);
    if (productInCart) productInCart.quantity += quantity;
    else cart.products.push({ id: productId, quantity });
    await this.updateCarts();
    return {
      status: 200,
      message: `Se ha actualizado el carrito correctamente.`,
      updatedCart: cart,
    };
  }
  async deleteCart(cartId) {
    try {
      const index = this.carts.findIndex((item) => item.id === cartId);
      if (index !== -1) {
        this.carts.splice(index, 1);
        await this.updateCarts();
        return {
          status: 200,
          message: `Carrito eliminado exitosamente - Quedaron ${this.carts.length} carritos registrados`,
        };
      } else {
        return {
          status: 400,
          error: "No se encontró el carrito a eliminar",
        };
      }
    } catch (e) {
      throw e;
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////
}

export default CartManager;
