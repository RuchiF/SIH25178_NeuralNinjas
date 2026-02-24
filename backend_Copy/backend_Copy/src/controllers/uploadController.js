/**
 * Upload Controller
 */
import { pythonMLService } from "../services/pythonMLService.js";
import multer from "multer";
import FormData from "form-data";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

export const uploadMiddleware = upload.single("file");

export const uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("No file uploaded");
      error.statusCode = 400;
      throw error;
    }

    // Create form data to send to Python service
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const result = await pythonMLService.uploadCSV(formData);

    res.json({
      success: true,
      message: result.message || "CSV processed successfully",
      predictions: result.predictions || [],
      summary: result.summary || {},
      rows_processed: result.rows_processed || 0,
      upload_id: result.upload_id,
    });
  } catch (error) {
    next(error);
  }
};
