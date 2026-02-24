import React, { useState, useEffect } from "react";
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
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import {
  TrendingUpIcon,
  TargetIcon,
  ActivityIcon,
  CalendarIcon,
} from "lucide-react";
import axios from "axios";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const API = `${BACKEND_URL}/api`;

const ModelMetrics = () => {
  const [selectedPollutant, setSelectedPollutant] = useState("NO2");
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState("site4");
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [siteMetrics, setSiteMetrics] = useState({});

  const pollutants = [
    { value: "NO2", label: "NO₂ (Nitrogen Dioxide)", color: "#3b82f6" },
    { value: "O3", label: "O₃ (Ozone)", color: "#8b5cf6" },
  ];

  const sites = ["site1", "site2", "site3", "site4", "site5", "site6", "site7"];

  useEffect(() => {
    loadSiteMetrics();
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [selectedPollutant, selectedSite, siteMetrics]);

  useEffect(() => {
    loadCSVData();
  }, [selectedSite, selectedPollutant]);

  useEffect(() => {
    if (csvData.length > 0) {
      extractAvailableDates();
    }
  }, [csvData]);

  useEffect(() => {
    if (selectedDate && csvData.length > 0) {
      filterDataByDay();
    }
  }, [selectedDate, csvData]);

  const loadSiteMetrics = async () => {
    try {
      const response = await fetch("/siteMetrix.csv");
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const metricsData = {};
          results.data.forEach((row) => {
            const pollutant = row.pollutant;
            const site = row.site;

            if (!metricsData[pollutant]) {
              metricsData[pollutant] = {};
            }

            metricsData[pollutant][site] = {
              rmse: parseFloat(row.rmse),
              r2: parseFloat(row.r2),
              ria: parseFloat(row.ria),
            };
          });
          setSiteMetrics(metricsData);
        },
        error: (error) => {
          console.error("Error parsing siteMetrix.csv:", error);
        },
      });
    } catch (error) {
      console.error("Error loading siteMetrix.csv:", error);
    }
  };

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      // Check if we have metrics from CSV for this combination
      if (siteMetrics[selectedPollutant]?.[selectedSite]) {
        const metrics = siteMetrics[selectedPollutant][selectedSite];
        setMetrics({
          rmse: metrics.rmse,
          r2: metrics.r2,
          ria: metrics.ria,
          mae: 0,
          bias: 0,
        });
        setIsLoading(false);
        return;
      }

      // Fallback to API
      const response = await axios.get(
        `${API}/metrics/${selectedPollutant}?site=${selectedSite}`
      );
      console.log(response.data);
      setMetrics(response.data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      // Set default metrics if fetch fails
      setMetrics({ rmse: 0, r2: 0, ria: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCSVData = async () => {
    try {
      console.log(`Loading CSV for ${selectedPollutant} ${selectedSite}...`);
      // Load CSV file from public folder or predictions folder
      const response = await fetch(
        `/predictions/${selectedPollutant}_${selectedSite}_prediction_vs_actual_comparison.csv`
      );

      if (!response.ok) {
        console.error(`CSV file not found for ${selectedSite}`);
        setCsvData([]);
        return;
      }

      const csvText = await response.text();
      console.log(`CSV loaded, length: ${csvText.length}`);

      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          console.log(`Parsed ${results.data.length} rows`);
          setCsvData(results.data);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setCsvData([]);
        },
      });
    } catch (error) {
      console.error("Error loading CSV:", error);
      setCsvData([]);
    }
  };

  const extractAvailableDates = () => {
    // Extract unique dates from CSV data
    const uniqueDatesSet = new Set(
      csvData
        .filter((row) => row.DATETIME)
        .map((row) => row.DATETIME.split(" ")[0])
        .filter(Boolean)
    );

    const dates = Array.from(uniqueDatesSet)
      .map((dateStr) => new Date(dateStr))
      .filter((date) => !isNaN(date.getTime()))
      .sort((a, b) => a - b);

    console.log("Found unique dates:", dates.length);
    setAvailableDates(dates);

    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  };

  const filterDataByDay = () => {
    if (!selectedDate) return;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const fullDate = `${year}-${month}-${day}`;

    console.log(`Filtering data for date: ${fullDate}`);
    const filteredData = csvData
      .filter((row) => row.DATETIME && row.DATETIME.startsWith(fullDate))
      .slice(0, 24) // Get first 24 hours
      .map((row, index) => {
        const datetime = row.DATETIME ? row.DATETIME.trim() : "";
        const timePart = datetime.includes(" ") ? datetime.split(" ")[1] : "";

        return {
          hour: index,
          time: timePart.substring(0, 5), // Get HH:MM format
          datetime: datetime,
          predicted: parseFloat(row[`${selectedPollutant} PREDICTED`]) || 0,
          actual: parseFloat(row[`${selectedPollutant} TARGET`]) || 0,
        };
      });

    console.log(
      `Filtered ${filteredData.length} rows for chart`,
      filteredData.slice(0, 3)
    );
    setChartData(filteredData);
  };

  const getPerformanceColor = (value, metric) => {
    if (metric === "rmse") {
      if (value <= 10) return "text-green-600";
      if (value <= 20) return "text-yellow-600";
      return "text-red-600";
    } else {
      // For R2 and RIA
      if (value >= 0.8) return "text-green-600";
      if (value >= 0.6) return "text-yellow-600";
      return "text-red-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner mr-3"></div>
        <span className="text-gray-600 dark:text-gray-400">
          Loading model metrics...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pollutant Selector */}
      <div className="flex items-center space-x-4">
        <Select value={selectedPollutant} onValueChange={setSelectedPollutant}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pollutants.map((pollutant) => (
              <SelectItem key={pollutant.value} value={pollutant.value}>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: pollutant.color }}
                  ></div>
                  <span>{pollutant.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Top 3 Metrics: RMSE, R2, RIA */}
      {metrics && (
        <>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Model Performance - {selectedSite.toUpperCase()} (
              {selectedPollutant})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* RMSE */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                  <span>RMSE</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-4xl font-bold ${getPerformanceColor(
                    metrics.rmse,
                    "rmse"
                  )}`}
                >
                  {metrics.rmse.toFixed(3)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Root Mean Square Error
                </p>
              </CardContent>
            </Card>

            {/* R2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TargetIcon className="h-5 w-5 text-green-600" />
                  <span>R²</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-4xl font-bold ${getPerformanceColor(
                    metrics.r2,
                    "r2"
                  )}`}
                >
                  {metrics.r2.toFixed(3)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Coefficient of Determination
                </p>
              </CardContent>
            </Card>

            {/* RIA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ActivityIcon className="h-5 w-5 text-purple-600" />
                  <span>RIA</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-4xl font-bold ${getPerformanceColor(
                    metrics.ria,
                    "ria"
                  )}`}
                >
                  {metrics.ria.toFixed(3)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Relative Index of Agreement
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Site and Day Selectors */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Predictions - 24 Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Pollutant
              </label>
              <Select
                value={selectedPollutant}
                onValueChange={setSelectedPollutant}
              >
                <SelectTrigger>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Site
              </label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site} value={site}>
                      {site.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Select Date
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select a date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                disabled={!csvData || csvData.length === 0}
                dayClassName={(date) => {
                  // Normalize both dates to YYYY-MM-DD format for comparison
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  const dateStr = `${year}-${month}-${day}`;

                  const hasData = availableDates.some((availDate) => {
                    const aYear = availDate.getFullYear();
                    const aMonth = String(availDate.getMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const aDay = String(availDate.getDate()).padStart(2, "0");
                    const availDateStr = `${aYear}-${aMonth}-${aDay}`;
                    return availDateStr === dateStr;
                  });

                  return hasData ? undefined : "react-datepicker__day--faded";
                }}
              />
              {selectedDate && chartData.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ No data available for selected date
                </p>
              )}
            </div>
          </div>

          {/* Charts: Line Chart and Scatter Plot */}
          {chartData.length > 0 ? (
            <div className="space-y-6">
              {/* Line Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Time Series - Actual vs Predicted
                </h3>
                <div className="h-64 sm:h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="time"
                        label={{
                          value: "Time (24 hrs)",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        label={{
                          value: `${selectedPollutant} Concentration (μg/m³)`,
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Actual"
                        dot={{ fill: "#10b981", r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Predicted"
                        dot={{ fill: "#3b82f6", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Scatter Plot */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Scatter Plot - Predicted vs Actual
                </h3>
                <div className="h-64 sm:h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        dataKey="actual"
                        name="Actual"
                        label={{
                          value: "Actual NO2 (μg/m³)",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="predicted"
                        name="Predicted"
                        label={{
                          value: "Predicted NO2 (μg/m³)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <ZAxis range={[60, 60]} />
                      <RechartsTooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Legend />
                      <Scatter
                        name="Predicted vs Actual"
                        data={chartData}
                        fill="#3b82f6"
                      />
                      {/* Perfect prediction line (y=x) */}
                      <Line
                        type="monotone"
                        dataKey="actual"
                        data={[
                          { actual: 0, predicted: 0 },
                          {
                            actual: Math.max(
                              ...chartData.map((d) =>
                                Math.max(d.actual, d.predicted)
                              )
                            ),
                            predicted: Math.max(
                              ...chartData.map((d) =>
                                Math.max(d.actual, d.predicted)
                              )
                            ),
                          },
                        ]}
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Perfect Prediction"
                        dot={false}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              {selectedDate ? (
                <div>
                  <p className="text-lg font-medium text-red-600">
                    ⚠️ No data available
                  </p>
                  <p className="text-sm mt-2">
                    No data found for {selectedDate.toLocaleDateString("en-CA")}
                    . Please select a different date.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium">Select a date</p>
                  <p className="text-sm mt-2">
                    {availableDates.length === 0
                      ? `CSV file not found for ${selectedPollutant} ${selectedSite}`
                      : "Please select a date to view model metrics"}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelMetrics;
