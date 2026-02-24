/**
 * Request logging middleware
 */
import morgan from "morgan";

export const logger = morgan("combined");

export const requestLogger = (req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
};
