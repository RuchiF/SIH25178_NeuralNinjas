/**
 * ML Predictions Controller
 */
import { pythonMLService } from "../services/pythonMLService.js";

export const predictPollutant = async (req, res, next) => {
  try {
    const result = await pythonMLService.predict(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getForecast = async (req, res, next) => {
  try {
    const result = await pythonMLService.getForecast(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getModelMetrics = async (req, res, next) => {
  try {
    const { pollutantType } = req.params;
    const result = await pythonMLService.getMetrics(pollutantType);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
