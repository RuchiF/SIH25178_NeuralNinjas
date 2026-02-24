/**
 * Configuration settings
 */
import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  pythonServiceUrl: process.env.PYTHON_SERVICE_URL || "http://localhost:8000",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/air_quality",
  dbName: process.env.DB_NAME || "air_quality",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
};
