import express from "express";
import CartManager from "../dao/db/carts-manager-db.js";

const router = express.Router();
const cartManager = new CartManager("./src/models/carts.json");

// FUNCION PARA CREAR UN CARRITO
const addCart = async (req, res) => {
  try {
    const cardData = req.body || {};
    const { status, message, error, data } = await cartManager.addCart(
      cardData
    );
    const { createdCart, totalCarts } = data;
    return res.json({
      status,
      message,
      error,
      createdCart,
      totalCarts,
    });
  } catch (error) {
    console.error("Cart Creation Failed", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// FUNCION PARA OBTENER LOS PRODUCTOS DE UN CARRITO
const getProductsInCart = async (req, res) => {
  try {
    const id = req.params.cartId;
    const { status, message, error, data } = await cartManager.getCartById(id);
    const { cart } = data;
    return res.json({
      status,
      message,
      error,
      products: cart?.products || [],
    });
  } catch (error) {
    console.error(`Failed to check cart`, error);
    res.status(500).json({
      error: `Internal Server Error`,
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
      error: `Internal Server Error`,
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
      error: `Internal Server Error`,
    });
  }
};

// PETICIONES DISPONIBLES
router.post("/", addCart);
router.get("/:cartId", getProductsInCart);
router.post("/:cartId/product/:productId", setProductInCart);
router.delete("/:cartId", deleteCart);

export default router;
