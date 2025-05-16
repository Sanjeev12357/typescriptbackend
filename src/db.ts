// db.ts
import mongoose from "mongoose";






const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://Sanjeev:Sanjeev123@cluster0.ybrdh6e.mongodb.net/brainly");
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the process if connection fails
  }
};

export default connectDB;
