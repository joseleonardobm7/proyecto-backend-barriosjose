import express from "express";
import ProductManager from "../dao/db/products-manager-db.js";
const router = express.Router();
const productManager = new ProductManager();

// OBTENER PRODUCTOS PAGINANDO
const getProducts = async (req, res) => {
  try {
    const response = await productManager.getProducts({ reqQuery: req.query });
    res.json(response);
  } catch (e) {
    console.error("No se pudieron obtener los productos:", e);
    res.status(500).json({
      error: `Error interno del servidor`,
    });
  }
};
// FUNCION PARA OBTENER ALGUN PRODUCTO ESPECÍFICO USANDO COMO PARAMETRO PRODUCTO ID
const getProductById = async (req, res) => {
  try {
    const id = req.params.productId;
    const product = await productManager.getProductById(id);
    if (!product) {
      return res.json({
        error: "No se encontró el producto consultado",
      });
    } else {
      res.json(product);
    }
  } catch (e) {
    console.error("Error al obtener producto:", e);
    res.status(500).json({
      error: `Error interno del servidor`,
    });
  }
};
// FUNCION PARA AGREGAR UN NUEVO PRODUCTO
const addProduct = async (req, res) => {
  try {
    const newProductData = req.body;
    const { status, error, message } = await productManager.addProduct(
      newProductData
    );
    res.status(status).json({
      message,
      error,
    });
  } catch (e) {
    console.error("No se pudo agregar el producto:", e);
    res.status(500).json({
      error: `Error interno del servidor`,
    });
  }
};
// FUNCION PARA ACTUALIZAR UN PRODUCTO
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const dataToUpdate = req.body;
    const { status, error, message, updatedProduct } =
      await productManager.updateProduct(productId, dataToUpdate);
    res.status(status).json({
      message,
      error,
      updatedProduct,
    });
  } catch (e) {
    console.error("Error al actualizar producto:", e);
    res.status(500).json({
      error: `Error interno del servidor`,
    });
  }
};
// FUNCION PARA ELIMINAR UN PRODUCTO
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { status, error, message } = await productManager.deleteProduct(
      productId
    );
    res.status(status).json({
      message,
      error,
    });
  } catch (e) {
    console.error("Error al eliminar producto:", e);
    res.status(500).json({
      error: `Error interno del servidor`,
    });
  }
};

// PETICIONES DISPONIBLES
router.get("/", getProducts);
router.get("/:productId", getProductById);
router.post("/", addProduct);
router.put("/:productId", updateProduct);
router.delete("/:productId", deleteProduct);

export default router;
