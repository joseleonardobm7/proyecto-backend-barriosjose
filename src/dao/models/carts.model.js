import mongoose from "mongoose";

// SCHEMA
const cartsSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

// POBLAR DATOS DE PRODUCTO
cartsSchema.pre("findOne", function (next) {
  this.populate("products.product", "_id title price");
  next();
});

// MODELO
const CartsModel = mongoose.model("carts", cartsSchema);

export default CartsModel;
