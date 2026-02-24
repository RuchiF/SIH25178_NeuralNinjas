/**
 * Upload Routes
 */
import express from "express";
import {
  uploadMiddleware,
  uploadCSV,
} from "../controllers/uploadController.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// POST /api/upload-csv - Upload CSV file for predictions
router.post("/upload-csv", strictLimiter, uploadMiddleware, uploadCSV);

export default router;
