import mongoose from "mongoose";

// SCHEMA
const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Por favor ingresa un correo electrónico válido"], // VALIDAR CORREO
  },
});

// MODELO
const usersModel = mongoose.model("users", usersSchema);

export default usersModel;
