/**
 * Python ML Service - HTTP client for communicating with Python backend
 */
import axios from "axios";
import { config } from "../config/index.js";

class PythonMLService {
  constructor() {
    this.baseURL = config.pythonServiceUrl;
    this.client = axios.create({
      baseURL: `${this.baseURL}/api`,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(
          `🐍 Python ML Service: ${config.method.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Python ML Service response: ${response.status}`);
        return response;
      },
      (error) => {
        console.error("❌ Python ML Service error:", error.message);
        return Promise.reject(error);
      }
    );
  }

  // Predict pollutant concentrations
  async predict(data) {
    try {
      const response = await this.client.post("/predict", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get forecast data
  async getForecast(data) {
    try {
      const response = await this.client.post("/forecast", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get model metrics
  async getMetrics(pollutantType) {
    try {
      const response = await this.client.get(`/metrics/${pollutantType}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload CSV for predictions
  async uploadCSV(formData) {
    try {
      const response = await this.client.post("/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minutes for large CSV files
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get dashboard data
  async getDashboardData() {
    try {
      const response = await this.client.get("/dashboard-data");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get available cities
  async getCities() {
    try {
      const response = await this.client.get("/cities");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get("/");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const err = new Error(
        error.response.data.detail || error.response.statusText
      );
      err.statusCode = error.response.status;
      return err;
    } else if (error.request) {
      // Request made but no response
      const err = new Error("Python ML service is not responding");
      err.statusCode = 503;
      return err;
    } else {
      // Something else went wrong
      return error;
    }
  }
}

export const pythonMLService = new PythonMLService();
