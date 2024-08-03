import mongoose from "mongoose";

// SCHEMA
const transactionsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
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

// POBLAR DATOS DE PRODUCTOS
transactionsSchema.pre("findOne", function (next) {
  this.populate("products.product", "_id title price");
  next();
});

// POBLAR DATOS DE USUARIO
transactionsSchema.pre("findOne", function (next) {
  this.populate("userId", "_id fullname email");
  next();
});

// MODELO
const transactionsModel = mongoose.model("users", transactionsSchema);

export default transactionsModel;
