/**
 * Dashboard Controller
 */
import { pythonMLService } from "../services/pythonMLService.js";

export const getDashboardData = async (req, res, next) => {
  try {
    const result = await pythonMLService.getDashboardData();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCities = async (req, res, next) => {
  try {
    const result = await pythonMLService.getCities();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
