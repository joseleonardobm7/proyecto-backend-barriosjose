import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// EVITAR ADVERTECIA EN CONSOLA SOBRE STRICTQUERY
mongoose.set("strictQuery", false);

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database successfully");
  } catch (error) {
    console.error("Database connection error", error);
  }
};

connectToDatabase();
