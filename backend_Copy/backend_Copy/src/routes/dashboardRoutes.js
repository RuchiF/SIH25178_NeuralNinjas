/**
 * Dashboard Routes
 */
import express from "express";
import {
  getDashboardData,
  getCities,
} from "../controllers/dashboardController.js";

const router = express.Router();

// GET /api/dashboard-data - Get comprehensive dashboard data
router.get("/dashboard-data", getDashboardData);

// GET /api/cities - Get available cities/sites
router.get("/cities", getCities);

export default router;
