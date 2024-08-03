import { Router } from "express";
import ProductManager from "../dao/db/products-manager-db.js";

const router = Router();

// VISTA HOME
const productManager = new ProductManager();
router.get("/", async (req, res) => {
  try {
    const productsResponse = await productManager.getProducts();
    const { status, message, data } = productsResponse;
    const { docs: products } = data;
    res.render("home", { products });
  } catch (e) {
    res.status(500).send("Error interno del servidor");
    console.error(e);
  }
});

// VISTA REAL TIME PRODUCTS
router.get("/realtimeproducts", async (req, res) => {
  res.render("realtimeproducts");
});

export default router;
