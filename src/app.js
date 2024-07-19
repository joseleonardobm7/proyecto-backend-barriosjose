import express from "express";
import multer from "multer";
import exphbs from "express-handlebars";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import ProductManager from "./controllers/product-manager.js";

// INICIALIZANDO EXPRESS Y DEFINIENDO PUERTO A UTILIZAR
const app = express();
const port = 8080;

// MIDLEWARE PARA MANEJAR MATERIAL ESTATICO
app.use(express.static("./src/public"));

// MIDLEWARE DE TERCERO MULTER (MANEJO DE ARCHIVOS)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/images/products");
  },
  filename: function (req, file, cb) {
    // ASEGURAMOS UN NOMBRE UNICO
    cb(null, uuidv4() + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage });
app.post("/upload", upload.single("image"), (req, res) => {
  const filePath = "/images/products/" + req.file.filename;
  res.send(filePath);
});

// ESTABLECIENDO LOS MIDDLEWARES
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ESTABLECIENDO RUTAS
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// MIDDLEWARE PARA MANEJAR RUTAS NO DEFINIDAS
app.use((req, res, next) => {
  res.status(404).json({
    error: "No se ha encontrado nada con los parámetros ingresados :/ ",
    suggestion: "Modifique los parámetros de su petición",
  });
});

// EXPRESS-HANDLEBARS
const hbs = exphbs.create({
  helpers: {
    or: function (v1, v2) {
      return v1 || v2;
    },
  },
});
//app.engine("handlebars", exphbs.engine());
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// COLOCAR AL SERVIDOR A ESCUCHAR EN EL PUERTO DEFINIDO
const httpServer = app.listen(port, () => {
  console.log(`El servidor esta atento al puerto ${port}`);
});

// SERVIDOR SOCKET IO
const productManager = new ProductManager("./src/models/products.json");
const io = new Server(httpServer);
io.on("connection", async (socket) => {
  // FUNCION PARA CARGAR LOS PRODUCTOS EN CLIENTE
  const productsLoad = async () => {
    const products = await productManager.getProducts();
    socket.emit("products", products);
  };

  productsLoad();

  // CARGAR PRODUCTOS DESDE CLIENTE
  socket.on("productsLoad", async () => {
    productsLoad();
  });

  // ELIMINAR PRODUCTO DESDE CLIENTE
  socket.on("productDelete", async (id) => {
    await productManager.deleteProduct(id);
  });

  // CREAR PRODUCTO DESDE CLIENTE
  socket.on("productCreate", async (productData, callback) => {
    const res = await productManager.addProduct(productData);
    callback({ ...res });
  });
});
