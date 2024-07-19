import express from "express";
import CartManager from "../controllers/cart-manager.js";

const router = express.Router();
const cartManager = new CartManager("./src/models/carts.json");

// FUNCION PARA CREAR UN CARRITO
const addCart = async (req, res) => {
  try {
    const { status, message, error, cart, totalCarts } =
      await cartManager.addCart();
    res.status(status).json({
      message,
      error,
      cart,
      totalCarts,
    });
  } catch (e) {
    console.error("Error al crear un nuevo carrito", e);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
// FUNCION PARA OBTENER LOS PRODUCTOS DE UN CARRITO
const getProductsInCart = async (req, res) => {
  try {
    const id = req.params.cartId;
    const cart = await cartManager.getCartById(id);
    if (!cart) {
      return res.json({
        error: "No se encontró el carrito consultado",
      });
    } else {
      const products = [...cart.products];
      res.json(products);
    }
  } catch (e) {
    console.error("Error al obtener producto:", e);
    res.status(500).json({
      error: `Error interno del servidor`,
    });
  }
};
// FUNCION PARA AGREGAR PRODUCTOS A UN CARRITO
const setProductInCart = async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const productId = req.params.productId;
    const quantity = req.body.quantity || 1;

    const { status, error, message, updatedCart } =
      await cartManager.updateCart(cartId, productId, quantity);
    res.status(status).json({
      message,
      error,
      updatedCart,
    });
  } catch (e) {
    console.error("Error al actualizar carrito:", e);
    res.status(500).json({
      error: `Error interno del servidor`,
    });
  }
};
// FUNCION PARA ELIMINAR UN CARRITO
const deleteCart = async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const { status, error, message } = await cartManager.deleteCart(cartId);
    res.status(status).json({
      message,
      error,
    });
  } catch (e) {
    console.error("Error al eliminar carrito:", e);
    res.status(500).json({
      error: `Error interno del servidor`,
    });
  }
};

// PETICIONES DISPONIBLES
router.post("/", addCart);
router.get("/:cartId", getProductsInCart);
router.post("/:cartId/product/:productId", setProductInCart);
router.delete("/:cartId", deleteCart);

export default router;
