import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import {
  UploadIcon,
  FileIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  DownloadIcon,
  TrendingUpIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const API = `${BACKEND_URL}/api`;

const UploadData = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [predictionResults, setPredictionResults] = useState(null);
  const [selectedPollutant, setSelectedPollutant] = useState("NO2");
  const [dragOver, setDragOver] = useState(false);
  const [chartData, setChartData] = useState(null);

  const pollutants = [
    { value: "NO2", label: "NO₂ (Nitrogen Dioxide)" },
    { value: "O3", label: "O₃ (Ozone)" },
  ];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file) => {
    console.log("File selection:", file.name, file.type, file.size);

    // Check if it's a CSV file by extension or MIME type
    const isCSV =
      file.type === "text/csv" ||
      file.type === "application/csv" ||
      file.name.toLowerCase().endsWith(".csv");

    if (file && isCSV) {
      setUploadedFile(file);
      setUploadStatus(null);
      setPredictionResults(null);
      console.log("File accepted:", file.name);
    } else {
      console.log("File rejected:", file.name, file.type);
      setUploadStatus({
        type: "error",
        message: "Please select a valid CSV file.",
      });
    }
  };

  const handleFileInputChange = (e) => {
    console.log("File input changed:", e.target.files);
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file.name, file.type, file.size);
      handleFileSelection(file);
    } else {
      console.log("No file selected");
    }
  };

  const uploadFile = async () => {
    if (!uploadedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await axios.post(`${API}/upload-csv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadStatus({
        type: "success",
        message: `Successfully processed ${response.data.rows_processed} rows with XGBoost predictions.`,
        data: response.data,
      });

      // Set prediction results from the response
      if (response.data.predictions) {
        setPredictionResults({
          predictions: response.data.predictions,
          summary: response.data.summary,
          upload_id: response.data.upload_id,
        });

        // Prepare chart data for visualizations
        const chartData = response.data.predictions.map((pred, index) => ({
          index: index + 1,
          timestamp: pred.timestamp,
          hour: new Date(pred.timestamp).getHours(),
          no2_prediction: pred.no2_prediction,
          o3_prediction: pred.o3_prediction,
          no2_actual: pred.no2_actual || null,
          o3_actual: pred.o3_actual || null,
        }));
        setChartData(chartData);
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message:
          error.response?.data?.detail || "Upload failed. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const generatePredictions = async (data) => {
    try {
      const response = await axios.post(`${API}/predict`, {
        pollutant_type: selectedPollutant,
        data: data,
      });

      setPredictionResults({
        pollutant_type: response.data.pollutant_type,
        predictions: response.data.predictions,
        input_data: data,
      });
    } catch (error) {
      console.error("Prediction error:", error);
      setUploadStatus({
        type: "error",
        message:
          "Failed to generate predictions. Please check your data format.",
      });
    }
  };

  const downloadPredictions = () => {
    if (!predictionResults) return;

    const csvContent = [
      ["Row", "Predicted Concentration (μg/m³)", "Pollutant Type"],
      ...predictionResults.predictions.map((pred, index) => [
        index + 1,
        pred.toFixed(2),
        predictionResults.pollutant_type,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `predictions_${predictionResults.pollutant_type.toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      [
        "year",
        "month",
        "day",
        "hour",
        "O3_forecast",
        "NO2_forecast",
        "T_forecast",
        "q_forecast",
        "u_forecast",
        "v_forecast",
        "w_forecast",
        "NO2_satellite",
        "HCHO_satellite",
        "ratio_satellite",
      ],
      [
        "2019",
        "11",
        "5",
        "0",
        "4.22",
        "89.01",
        "17.21",
        "8.76",
        "2.23",
        "0.15",
        "-0.12",
        "",
        "",
        "",
      ],
      [
        "2019",
        "11",
        "5",
        "1",
        "11.65",
        "78.45",
        "17.04",
        "8.83",
        "2.28",
        "-0.25",
        "-0.14",
        "",
        "",
        "",
      ],
      [
        "2019",
        "11",
        "5",
        "2",
        "19.08",
        "67.89",
        "18.1",
        "8.9",
        "2.32",
        "-0.65",
        "-0.15",
        "",
        "",
        "",
      ],
      [
        "2019",
        "11",
        "5",
        "3",
        "26.51",
        "57.33",
        "18.03",
        "8.97",
        "2.36",
        "-1.06",
        "-0.16",
        "",
        "",
        "",
      ],
      [
        "2019",
        "11",
        "5",
        "4",
        "17.67",
        "86.12",
        "18.68",
        "8.26",
        "2.39",
        "-1.03",
        "-0.14",
        "",
        "",
        "",
      ],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([sampleData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_air_quality_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-blue-50/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">
            Upload Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-800">
            <p>
              • Upload a CSV file with input features for NO2 and O3 predictions
            </p>
            <p>
              • Required columns: year, month, day, hour, O3_forecast,
              NO2_forecast, T_forecast, q_forecast, u_forecast, v_forecast,
              w_forecast, NO2_satellite, HCHO_satellite, ratio_satellite
            </p>
            <p>
              • Optional columns: O3_target, NO2_target (only for
              validation/comparison)
            </p>
            <p>
              • XGBoost models will predict O3_target and NO2_target values for
              each row
            </p>
            <p>• Maximum file size: 10MB</p>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={downloadSampleCSV}
              className="flex items-center space-x-2 text-blue-700 border-blue-300 hover:bg-blue-100"
              data-testid="download-sample-btn"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Download Sample CSV</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Configuration */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Prediction Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Pollutant Type for Predictions
              </label>
              <Select
                value={selectedPollutant}
                onValueChange={setSelectedPollutant}
                data-testid="pollutant-type-select"
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pollutants.map((pollutant) => (
                    <SelectItem key={pollutant.value} value={pollutant.value}>
                      {pollutant.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`upload-area ${dragOver ? "dragover" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-testid="file-upload-area"
          >
            <div className="text-center space-y-4">
              <UploadIcon className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drag and drop your CSV file here
                </p>
                <p className="text-gray-500">or</p>
              </div>
              <div>
                <input
                  type="file"
                  id="file-input"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                  data-testid="file-input"
                />
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    console.log("Button clicked");
                    document.getElementById("file-input").click();
                  }}
                >
                  Choose File
                </Button>
              </div>
            </div>
          </div>

          {/* File Info */}
          {uploadedFile && (
            <div
              className="mt-6 p-4 bg-gray-50 rounded-lg"
              data-testid="file-info"
            >
              <div className="flex items-center space-x-3">
                <FileIcon className="h-6 w-6 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  onClick={uploadFile}
                  disabled={isUploading}
                  className="flex items-center space-x-2"
                  data-testid="upload-btn"
                >
                  {isUploading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-4 w-4" />
                      <span>Upload & Predict</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus && (
            <div className="mt-6" data-testid="upload-status">
              <Alert
                className={
                  uploadStatus.type === "success"
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }
              >
                <div className="flex items-center space-x-2">
                  {uploadStatus.type === "success" ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                  <AlertDescription
                    className={
                      uploadStatus.type === "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }
                  >
                    {uploadStatus.message}
                  </AlertDescription>
                </div>
              </Alert>

              {uploadStatus.type === "success" && uploadStatus.data && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Upload Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Rows processed:</span>
                      <span className="ml-2 font-medium">
                        {uploadStatus.data.rows_processed}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Columns detected:</span>
                      <span className="ml-2 font-medium">
                        {uploadStatus.data.columns?.length || 0}
                      </span>
                    </div>
                  </div>
                  {uploadStatus.data.columns && (
                    <div className="mt-3">
                      <span className="text-gray-500 text-sm">Columns:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {uploadStatus.data.columns.map((col, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {col}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {predictionResults && (
        <div className="space-y-6">
          {/* Summary Statistics */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <span>XGBoost Model Predictions</span>
                <Badge
                  variant="outline"
                  className="text-xs bg-green-100 text-green-700 border-green-200"
                >
                  AI Predicted
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {predictionResults.summary?.total_rows || 0}
                  </div>
                  <div className="text-blue-700 text-sm">Total Predictions</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {predictionResults.summary?.avg_no2 || 0}
                  </div>
                  <div className="text-green-700 text-sm">Avg NO₂ (μg/m³)</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900">
                    {predictionResults.summary?.avg_o3 || 0}
                  </div>
                  <div className="text-orange-700 text-sm">Avg O₃ (μg/m³)</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {predictionResults.summary?.max_no2 || 0}
                  </div>
                  <div className="text-purple-700 text-sm">Max NO₂ (μg/m³)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visualizations */}
          {chartData && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* NO2 Predictions Chart */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                    <span>NO₂ Predictions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="hour"
                          tick={{ fontSize: 12 }}
                          label={{
                            value: "Hour",
                            position: "insideBottom",
                            offset: -5,
                          }}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          label={{
                            value: "NO₂ (μg/m³)",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip
                          formatter={(value, name) => [value.toFixed(2), name]}
                          labelFormatter={(label) => `Hour: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="no2_prediction"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                          name="Predicted NO₂"
                        />
                        {chartData.some((d) => d.no2_actual !== null) && (
                          <Line
                            type="monotone"
                            dataKey="no2_actual"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                            name="Actual NO₂"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* O3 Predictions Chart */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUpIcon className="h-5 w-5 text-orange-600" />
                    <span>O₃ Predictions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="hour"
                          tick={{ fontSize: 12 }}
                          label={{
                            value: "Hour",
                            position: "insideBottom",
                            offset: -5,
                          }}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          label={{
                            value: "O₃ (μg/m³)",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip
                          formatter={(value, name) => [value.toFixed(2), name]}
                          labelFormatter={(label) => `Hour: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="o3_prediction"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                          name="Predicted O₃"
                        />
                        {chartData.some((d) => d.o3_actual !== null) && (
                          <Line
                            type="monotone"
                            dataKey="o3_actual"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                            name="Actual O₃"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Results Table */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Detailed Predictions</span>
                <Button
                  variant="outline"
                  onClick={downloadPredictions}
                  className="flex items-center space-x-2"
                >
                  <DownloadIcon className="h-4 w-4" />
                  <span>Download Results</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Row</th>
                      <th className="px-4 py-2 text-left">Timestamp</th>
                      <th className="px-4 py-2 text-left">NO₂ Predicted</th>
                      <th className="px-4 py-2 text-left">O₃ Predicted</th>
                      <th className="px-4 py-2 text-left">NO₂ AQI</th>
                      <th className="px-4 py-2 text-left">O₃ AQI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionResults.predictions &&
                      predictionResults.predictions
                        .slice(0, 10)
                        .map((prediction, index) => {
                          const getAQIColor = (category) => {
                            const colors = {
                              Good: "bg-green-100 text-green-700 border-green-200",
                              Satisfactory:
                                "bg-yellow-100 text-yellow-700 border-yellow-200",
                              Moderate:
                                "bg-orange-100 text-orange-700 border-orange-200",
                              Poor: "bg-red-100 text-red-700 border-red-200",
                              Severe:
                                "bg-purple-100 text-purple-700 border-purple-200",
                            };
                            return (
                              colors[category] ||
                              "bg-gray-100 text-gray-700 border-gray-200"
                            );
                          };

                          return (
                            <tr
                              key={index}
                              className="border-t border-gray-200"
                            >
                              <td className="px-4 py-2 font-medium">
                                {prediction.row_index + 1}
                              </td>
                              <td className="px-4 py-2 text-xs">
                                {prediction.timestamp}
                              </td>
                              <td className="px-4 py-2">
                                {prediction.no2_prediction} μg/m³
                              </td>
                              <td className="px-4 py-2">
                                {prediction.o3_prediction} μg/m³
                              </td>
                              <td className="px-4 py-2">
                                <Badge
                                  className={`${getAQIColor(
                                    prediction.no2_aqi
                                  )} border text-xs`}
                                >
                                  {prediction.no2_aqi}
                                </Badge>
                              </td>
                              <td className="px-4 py-2">
                                <Badge
                                  className={`${getAQIColor(
                                    prediction.o3_aqi
                                  )} border text-xs`}
                                >
                                  {prediction.o3_aqi}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
                {predictionResults.predictions &&
                  predictionResults.predictions.length > 10 && (
                    <div className="text-center py-2 text-gray-500 text-sm">
                      Showing first 10 of {predictionResults.predictions.length}{" "}
                      results
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UploadData;
