/**
 * Main Express server - Node.js Middleware/API Gateway
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config/index.js";
import { connectDatabase } from "./config/database.js";
import { logger, requestLogger } from "./middleware/logger.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { pythonMLService } from "./services/pythonMLService.js";

// Import routes
import mlRoutes from "./routes/mlRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv === "development") {
  app.use(logger);
}
app.use(requestLogger);

// Rate limiting
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const pythonHealth = await pythonMLService.healthCheck();
    res.json({
      success: true,
      message: "Node.js middleware is healthy",
      services: {
        node: "healthy",
        python: pythonHealth ? "healthy" : "unhealthy",
        database: "connected",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Service partially unhealthy",
      services: {
        node: "healthy",
        python: "unhealthy",
        database: "connected",
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Air Quality Forecasting Portal - Node.js Middleware",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  });
});

// API Routes
app.use("/api", mlRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", uploadRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Check Python ML service health
    try {
      await pythonMLService.healthCheck();
      console.log("✅ Python ML service is reachable");
    } catch (error) {
      console.warn("⚠️  Warning: Python ML service is not reachable");
      console.warn(
        "   Make sure Python backend is running on",
        config.pythonServiceUrl
      );
    }

    // Start Express server
    app.listen(config.port, () => {
      console.log("");
      console.log("🚀 ============================================");
      console.log("   Air Quality Forecasting Portal");
      console.log("   Node.js Middleware/API Gateway");
      console.log("============================================");
      console.log(`📡 Server running on: http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🐍 Python ML Service: ${config.pythonServiceUrl}`);
      console.log("============================================");
      console.log("");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Closing server gracefully...");
  process.exit(0);
});

// Start the server
startServer();
