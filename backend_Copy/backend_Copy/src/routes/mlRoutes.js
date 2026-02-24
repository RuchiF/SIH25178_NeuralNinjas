/**
 * ML Routes - Predictions and Forecasts
 */
import express from "express";
import {
  predictPollutant,
  getForecast,
  getModelMetrics,
} from "../controllers/mlController.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// POST /api/predict - Predict pollutant concentrations
router.post("/predict", strictLimiter, predictPollutant);

// POST /api/forecast - Get forecast data
router.post("/forecast", getForecast);

// GET /api/metrics/:pollutantType - Get model metrics
router.get("/metrics/:pollutantType", getModelMetrics);

export default router;
