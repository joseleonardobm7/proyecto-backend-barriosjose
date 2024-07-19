import { Router } from "express";
import ProductManager from "../controllers/product-manager.js";

const router = Router();

// VISTA HOME
const productManager = new ProductManager("./src/models/products.json");
router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
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
