import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// SCHEMA
const productsSchema = new mongoose.Schema({
  sku: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  rating: {
    rate: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
});

// PAGINACIÓN
productsSchema.plugin(mongoosePaginate);

// MODELO
const ProductsModel = mongoose.model("products", productsSchema);

export default ProductsModel;
