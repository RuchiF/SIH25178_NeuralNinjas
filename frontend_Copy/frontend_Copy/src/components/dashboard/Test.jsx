import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { UploadIcon, BarChart3Icon } from "lucide-react";
import Papa from "papaparse";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Test = () => {
  const [xFile, setXFile] = useState(null);
  const [yFile, setYFile] = useState(null);
  const [xData, setXData] = useState([]);
  const [yData, setYData] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (file, axis) => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const values = results.data
          .map((row) => {
            // Get the second column (index 1) which contains the numeric values
            const rowValues = Object.values(row);
            const value = parseFloat(rowValues[1]);
            return isNaN(value) ? null : value;
          })
          .filter((v) => v !== null);

        if (axis === "x") {
          setXFile(file);
          setXData(values);
        } else {
          setYFile(file);
          setYData(values);
        }
        setError(null);
      },
      error: (err) => {
        setError(`Error parsing ${axis.toUpperCase()} file: ${err.message}`);
      },
    });
  };

  const sortAndAlignData = () => {
    if (xData.length === 0 || yData.length === 0) {
      setError("Please upload both X and Y CSV files");
      return;
    }

    if (xData.length !== yData.length) {
      setError(
        `Data length mismatch: X has ${xData.length} values, Y has ${yData.length} values`
      );
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create pairs and sort by X values
      const pairs = xData.map((x, i) => ({ x, y: yData[i] }));
      pairs.sort((a, b) => a.x - b.x);

      const sortedX = pairs.map((p) => p.x);
      const sortedY = pairs.map((p) => p.y);

      // Create scatter plot data
      const chartData = pairs.map((p, i) => ({
        x: p.x,
        y: p.y,
        index: i,
      }));

      setScatterData(chartData);

      // Calculate metrics
      const calculatedMetrics = calculateMetrics(sortedX, sortedY);
      setMetrics(calculatedMetrics);
    } catch (err) {
      setError(`Error processing data: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateMetrics = (xValues, yValues) => {
    const n = xValues.length;

    // Calculate means
    const xMean = xValues.reduce((a, b) => a + b, 0) / n;
    const yMean = yValues.reduce((a, b) => a + b, 0) / n;

    // Calculate RMSE (treating y as actual, x as predicted)
    const squaredErrors = xValues.map((x, i) => Math.pow(yValues[i] - x, 2));
    const mse = squaredErrors.reduce((a, b) => a + b, 0) / n;
    const rmse = Math.sqrt(mse);

    // Calculate R² (coefficient of determination)
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = xValues.reduce(
      (sum, x, i) => sum + Math.pow(yValues[i] - x, 2),
      0
    );
    const r2 = 1 - ssResidual / ssTotal;

    // Calculate Pearson correlation coefficient
    const numerator = xValues.reduce(
      (sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean),
      0
    );
    const xDenom = Math.sqrt(
      xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0)
    );
    const yDenom = Math.sqrt(
      yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0)
    );
    const correlation = numerator / (xDenom * yDenom);

    return {
      rmse,
      r2,
      correlation,
      count: n,
      xMean,
      yMean,
    };
  };

  const handleReset = () => {
    setXFile(null);
    setYFile(null);
    setXData([]);
    setYData([]);
    setScatterData([]);
    setMetrics(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="w-5 h-5" />
            CSV Data Analysis & Scatter Plot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* X-axis file upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X-axis Data (CSV Predicted)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e.target.files[0], "x")}
                  className="hidden"
                  id="x-file-upload"
                />
                <label htmlFor="x-file-upload" className="cursor-pointer">
                  <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {xFile ? xFile.name : "Click to upload X-axis CSV"}
                  </p>
                  {xData.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ {xData.length} values loaded
                    </p>
                  )}
                </label>
              </div>
            </div>

            {/* Y-axis file upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Y-axis Data (CSV Actual)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e.target.files[0], "y")}
                  className="hidden"
                  id="y-file-upload"
                />
                <label htmlFor="y-file-upload" className="cursor-pointer">
                  <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {yFile ? yFile.name : "Click to upload Y-axis CSV"}
                  </p>
                  {yData.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ {yData.length} values loaded
                    </p>
                  )}
                </label>
              </div>
            </div>
          </div>

          {error && (
            <Alert className="mt-4 border-red-500 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 mt-6">
            <Button
              onClick={sortAndAlignData}
              disabled={
                xData.length === 0 || yData.length === 0 || isProcessing
              }
              className="flex-1"
            >
              {isProcessing ? "Processing..." : "Process & Plot"}
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Display */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Statistical Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">RMSE</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.rmse.toFixed(4)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">R² Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.r2.toFixed(4)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Correlation</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.correlation.toFixed(4)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Data Points</p>
                <p className="text-2xl font-bold text-gray-600">
                  {metrics.count}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scatter Plot */}
      {scatterData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scatter Plot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="X"
                    label={{
                      value: "X-axis Values",
                      position: "insideBottom",
                      offset: -10,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Y"
                    label={{
                      value: "Y-axis Values",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    formatter={(value) => value.toFixed(3)}
                  />
                  <Legend />
                  <Scatter
                    name="Data Points"
                    data={scatterData}
                    fill="#3b82f6"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Test;
