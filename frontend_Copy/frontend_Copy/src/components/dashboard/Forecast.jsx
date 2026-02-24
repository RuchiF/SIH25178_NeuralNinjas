import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CalendarIcon,
  TrendingUpIcon,
  CloudIcon,
  DownloadIcon,
  MapPinIcon,
  UploadIcon,
} from "lucide-react";
import { format, addHours } from "date-fns";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// HardCoded
// ✅ Generate random AQI category
const getRandomCategory = () => {
  const categories = ["Good", "Satisfactory", "Moderate", "Poor", "Severe"];
  return categories[Math.floor(Math.random() * categories.length)];
};

//HardCoded
// ✅ Generate random forecast data
const generateRandomData = (hours = 24) => {
  const now = new Date();
  const data = [];

  for (let i = 0; i < hours; i++) {
    const concentration = parseFloat((Math.random() * 150 + 10).toFixed(1)); // 10–160 μg/m³
    data.push({
      hour: i + 1,
      timestamp: format(addHours(now, i), "HH:mm"),
      concentration,
      aqi_category: getRandomCategory(),
      predicted: true,
      actual: i < 2 ? concentration - Math.random() * 5 : null,
    });
  }
  return data;
};

const Forecast = () => {
  const [selectedCity, setSelectedCity] = useState("Site 1");
  const [selectedPollutant, setSelectedPollutant] = useState("NO2");
  const [forecastHours, setForecastHours] = useState(24);
  const [forecastData, setForecastData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [forecastMonth, setForecastMonth] = useState("January");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [predictionResults, setPredictionResults] = useState(null);

  const cities = [
    "Site 1",
    "Site 2",
    "Site 3",
    "Site 4",
    "Site 5",
    "Site 6",
    "Site 7",
  ];
  const pollutants = [
    { value: "NO2", label: "NO₂ (Nitrogen Dioxide)" },
    { value: "O3", label: "O₃ (Ozone)" },
  ];
  const hourOptions = [
    { value: 24, label: "24 Hours" },
    { value: 48, label: "48 Hours" },
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  useEffect(() => {
    generateForecast();
  }, [selectedCity, selectedPollutant, forecastHours]);

  const generateForecast = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/forecast`, {
        city: selectedCity,
        pollutant_type: selectedPollutant,
        hours: forecastHours,
      });

      // Transform API response to match chart format
      const formattedData = response.data.data.map((item) => ({
        hour: item.hour,
        timestamp: format(new Date(item.timestamp), "HH:mm"),
        concentration: item.concentration,
        aqi_category: item.aqi_category,
        predicted: item.predicted,
        actual: item.actual,
      }));

      setForecastData(formattedData);
    } catch (error) {
      console.error("Failed to fetch forecast:", error);
      // Fallback to mock data if API fails
      console.log("Going for fallback");
      const randomData = generateRandomData(forecastHours);
      setForecastData(randomData);
    } finally {
      setIsLoading(false);
    }
  };

  const getAQIColor = (category) => {
    const colors = {
      Good: "#10b981",
      Satisfactory: "#f59e0b",
      Moderate: "#f97316",
      Poor: "#ef4444",
      Severe: "#7c2d12",
    };
    return colors[category] || "#6b7280";
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setUploadedFile(file);
    } else {
      alert("Please upload a valid CSV file");
    }
  };

  const processUploadedFile = async () => {
    if (!uploadedFile) {
      alert("Please select a file first");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await axios.post(
        `${BACKEND_URL}/api/upload-csv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 300000, // 5 minutes
        }
      );

      if (response.data && response.data.predictions) {
        // Show only first 20 predictions
        const limitedPredictions = response.data.predictions.slice(0, 20);
        setPredictionResults(limitedPredictions);
        alert(
          `File "${uploadedFile.name}" uploaded successfully! Showing first 20 of ${response.data.predictions.length} predictions.`
        );
      }

      setUploadedFile(null);
    } catch (error) {
      console.error("Failed to upload file:", error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Failed to upload file. Please try again.";
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadForecast = () => {
    if (!forecastData) return;

    const csvContent = [
      [
        "Timestamp",
        "Hour",
        "Concentration (μg/m³)",
        "AQI Category",
        "Predicted",
        "Actual",
      ],
      ...forecastData.map((item) => [
        item.timestamp,
        item.hour,
        item.concentration,
        item.aqi_category,
        item.predicted ? "Yes" : "No",
        item.actual || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forecast_${selectedCity}_${selectedPollutant}_${forecastHours}h.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const maxConcentration = Math.max(
    ...(forecastData.map((d) => d.concentration) || [0])
  );
  const avgConcentration =
    forecastData.length > 0
      ? forecastData.reduce((sum, d) => sum + d.concentration, 0) /
        forecastData.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{city}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pollutant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pollutant
          </label>
          <Select
            value={selectedPollutant}
            onValueChange={setSelectedPollutant}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pollutants.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Forecast Range
          </label>
          <Select
            value={forecastHours.toString()}
            onValueChange={(v) => setForecastHours(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Picker
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Current Level */}
        <Card>
          <CardHeader>
            <CardTitle>Current Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {forecastData[0]?.concentration?.toFixed(1) || "N/A"}
            </div>
            <Badge
              className="mt-2 border"
              style={{
                backgroundColor:
                  getAQIColor(forecastData[0]?.aqi_category) + "20",
                color: getAQIColor(forecastData[0]?.aqi_category),
                borderColor: getAQIColor(forecastData[0]?.aqi_category),
              }}
            >
              {forecastData[0]?.aqi_category || "Unknown"}
            </Badge>
          </CardContent>
        </Card>

        {/* Peak */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {maxConcentration.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        {/* Average */}
        <Card>
          <CardHeader>
            <CardTitle>Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {avgConcentration.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={generateForecast} disabled={isLoading}>
              {isLoading ? "Generating..." : "Regenerate"}
            </Button>
            <Button variant="outline" onClick={downloadForecast}>
              <DownloadIcon className="h-4 w-4 mr-2" /> Download CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedPollutant} Forecast - {selectedCity}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="timestamp" />
                <YAxis
                  label={{
                    value: `${selectedPollutant} (μg/m³)`,
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="concentration"
                  stroke="#3b82f6"
                  fill="url(#colorC)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Hourly Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Hour</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Concentration</th>
                  <th className="px-4 py-2 text-left">AQI Category</th>
                  <th className="px-4 py-2 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2 font-medium">+{item.hour}h</td>
                    <td className="px-4 py-2">{item.timestamp}</td>
                    <td className="px-4 py-2">
                      {item.concentration.toFixed(1)} μg/m³
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        className="text-xs border"
                        style={{
                          backgroundColor:
                            getAQIColor(item.aqi_category) + "20",
                          color: getAQIColor(item.aqi_category),
                          borderColor: getAQIColor(item.aqi_category),
                        }}
                      >
                        {item.aqi_category}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={item.predicted ? "default" : "secondary"}>
                        {item.predicted ? "Predicted" : "Actual"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* CSV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UploadIcon className="h-5 w-5" />
            <span>Upload Historical Data (CSV)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
            </div>

            {uploadedFile && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{uploadedFile.name}</Badge>
                  <span className="text-sm text-gray-600">
                    ({(uploadedFile.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <Button
                  onClick={processUploadedFile}
                  disabled={isUploading}
                  className="flex items-center space-x-2"
                >
                  <UploadIcon className="h-4 w-4" />
                  <span>{isUploading ? "Processing..." : "Process File"}</span>
                </Button>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Upload a CSV file containing historical forecast data. The first
              20 predictions will be displayed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Results Display */}
      {predictionResults && predictionResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction Results (First 20)</CardTitle>
            <p className="text-sm text-gray-600">
              Showing 20 of the uploaded predictions
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Row #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NO2 Prediction (μg/m³)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      O3 Prediction (μg/m³)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NO2 AQI Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      O3 AQI Category
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictionResults.map((prediction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prediction.NO2_prediction?.toFixed(2) || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prediction.O3_prediction?.toFixed(2) || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            prediction.NO2_aqi_category === "Good"
                              ? "default"
                              : prediction.NO2_aqi_category === "Moderate"
                              ? "secondary"
                              : prediction.NO2_aqi_category ===
                                "Unhealthy for Sensitive Groups"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {prediction.NO2_aqi_category || "N/A"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            prediction.O3_aqi_category === "Good"
                              ? "default"
                              : prediction.O3_aqi_category === "Moderate"
                              ? "secondary"
                              : prediction.O3_aqi_category ===
                                "Unhealthy for Sensitive Groups"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {prediction.O3_aqi_category || "N/A"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-600">Avg NO2</div>
                  <div className="text-2xl font-bold">
                    {(
                      predictionResults.reduce(
                        (sum, p) => sum + (p.NO2_prediction || 0),
                        0
                      ) / predictionResults.length
                    ).toFixed(2)}{" "}
                    μg/m³
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-600">Avg O3</div>
                  <div className="text-2xl font-bold">
                    {(
                      predictionResults.reduce(
                        (sum, p) => sum + (p.O3_prediction || 0),
                        0
                      ) / predictionResults.length
                    ).toFixed(2)}{" "}
                    μg/m³
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-600">Max NO2</div>
                  <div className="text-2xl font-bold">
                    {Math.max(
                      ...predictionResults.map((p) => p.NO2_prediction || 0)
                    ).toFixed(2)}{" "}
                    μg/m³
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-600">Max O3</div>
                  <div className="text-2xl font-bold">
                    {Math.max(
                      ...predictionResults.map((p) => p.O3_prediction || 0)
                    ).toFixed(2)}{" "}
                    μg/m³
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Forecast;
