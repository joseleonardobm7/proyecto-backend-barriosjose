import express from "express";
import ProductManager from "../controllers/product-manager.js";

const router = express.Router();
const productManager = new ProductManager("./src/models/products.json");

// FUNCION PARA OBTENER TODOS LOS PRODUCTOS
// OPCIONALMENTE PUEDE USAR LOS QUERY PARAMS LIMIT Y PAGE PARA PAGINAR LA BUSQUEDA
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 0);
    const start = page === 1 ? 0 : limit * (page - 1);
    const allProducts = await productManager.getProducts();
    const limitProducts = allProducts.slice(start, start + limit);
    const responseProducts = limit ? limitProducts : allProducts;
    if (responseProducts.length) {
      if (limit)
        console.log(
          `Listando los productos ${start + 1}-${Math.min(
            start + limit,
            allProducts.length
          )}/${allProducts.length}`
        );
      else console.log(`Listando ${responseProducts.length} Productos`);
      res.json(responseProducts);
    } else {
      console.log("No se encontro ningun producto registrado");
      res.json({
        message: "No se encontró ningún producto",
      });
    }
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
