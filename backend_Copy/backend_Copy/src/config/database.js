/**
 * MongoDB database configuration
 */
import mongoose from "mongoose";
import { config } from "./index.js";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodbUri, {
      dbName: config.dbName,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error);
  }
};
