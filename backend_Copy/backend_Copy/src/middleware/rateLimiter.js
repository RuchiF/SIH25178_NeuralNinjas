/**
 * Rate limiting middleware
 */
import rateLimit from "express-rate-limit";
import { config } from "../config/index.js";

export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10,
  message: "Too many requests, please slow down.",
});
