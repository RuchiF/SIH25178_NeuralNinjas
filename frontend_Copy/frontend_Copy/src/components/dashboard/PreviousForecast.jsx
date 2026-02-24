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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CalendarIcon, TrendingUpIcon, MapPinIcon } from "lucide-react";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PreviousForecast = () => {
  const [selectedSite, setSelectedSite] = useState("site1");
  const [selectedPollutant, setSelectedPollutant] = useState("NO2");
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sites = ["site1", "site2", "site3", "site4", "site5", "site6", "site7"];
  const pollutants = [
    { value: "NO2", label: "NO₂ (Nitrogen Dioxide)", color: "#3b82f6" },
    { value: "O3", label: "O₃ (Ozone)", color: "#8b5cf6" },
  ];

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
      generate3DayForecast();
    }
  }, [selectedDate, csvData]);

  const loadCSVData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/predictions/${selectedPollutant}_${selectedSite}_prediction_vs_actual_comparison.csv`
      );

      if (!response.ok) {
        console.error(`CSV file not found for ${selectedSite}`);
        setCsvData([]);
        return;
      }

      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const extractAvailableDates = () => {
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

    setAvailableDates(dates);

    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  };

  const generate3DayForecast = () => {
    if (!selectedDate) return;

    const startYear = selectedDate.getFullYear();
    const startMonth = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const startDay = String(selectedDate.getDate()).padStart(2, "0");
    const startDateStr = `${startYear}-${startMonth}-${startDay}`;

    // Get next 3 days (72 hours) of data starting from selected date
    const forecast = [];
    let currentDate = new Date(selectedDate);

    for (let day = 0; day < 3; day++) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const dayNum = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${dayNum}`;

      const dayData = csvData
        .filter((row) => row.DATETIME && row.DATETIME.startsWith(dateStr))
        .slice(0, 24) // Get 24 hours for this day
        .map((row, hourIndex) => {
          const datetime = row.DATETIME ? row.DATETIME.trim() : "";
          const timePart = datetime.includes(" ") ? datetime.split(" ")[1] : "";
          const predicted =
            parseFloat(row[`${selectedPollutant} PREDICTED`]) || 0;

          // Calculate hour number from start (0-71 for 3 days)
          const hourFromStart = day * 24 + hourIndex;

          return {
            datetime: datetime,
            date: dateStr,
            time: timePart.substring(0, 5),
            day: day + 1,
            dayLabel: `Day ${day + 1}`,
            hourFromStart: hourFromStart,
            displayLabel: `D${day + 1} ${timePart.substring(0, 5)}`,
            concentration: predicted,
          };
        });

      forecast.push(...dayData);

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Generated 3-day forecast: ${forecast.length} data points`);
    setForecastData(forecast);
  };

  const maxConcentration =
    forecastData.length > 0
      ? Math.max(...forecastData.map((d) => d.concentration))
      : 0;

  const avgConcentration =
    forecastData.length > 0
      ? forecastData.reduce((sum, d) => sum + d.concentration, 0) /
        forecastData.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {forecastData.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Average Concentration
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {avgConcentration.toFixed(2)} μg/m³
                  </p>
                </div>
                <TrendingUpIcon className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Peak Concentration
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {maxConcentration.toFixed(2)} μg/m³
                  </p>
                </div>
                <TrendingUpIcon className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Forecast Duration
                  </p>
                  <p className="text-2xl font-bold text-green-600">3 Days</p>
                </div>
                <CalendarIcon className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>3-Day Forecast Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{site.toUpperCase()}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  {pollutants.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Start Date
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select start date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                disabled={!csvData || csvData.length === 0}
                dayClassName={(date) => {
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
              {selectedDate && forecastData.length === 0 && !isLoading && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ No data available for selected date
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3-Day Forecast Chart */}
      {forecastData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              3-Day Forecast - {selectedPollutant} at{" "}
              {selectedSite.toUpperCase()}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Predicted concentrations for the next 72 hours
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="hourFromStart"
                    label={{
                      value: "Time (Hours from start)",
                      position: "insideBottom",
                      offset: -5,
                    }}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(hour) => {
                      const day = Math.floor(hour / 24) + 1;
                      const hourOfDay = hour % 24;
                      return `D${day}-${String(hourOfDay).padStart(2, "0")}:00`;
                    }}
                    interval={3}
                  />
                  <YAxis
                    label={{
                      value: `${selectedPollutant} Concentration (μg/m³)`,
                      angle: -90,
                      position: "insideLeft",
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${value.toFixed(2)} μg/m³`,
                      "Predicted",
                    ]}
                    labelFormatter={(hour) => {
                      const day = Math.floor(hour / 24) + 1;
                      const hourOfDay = hour % 24;
                      return `Day ${day} - ${String(hourOfDay).padStart(
                        2,
                        "0"
                      )}:00`;
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="concentration"
                    stroke={selectedPollutant === "NO2" ? "#3b82f6" : "#8b5cf6"}
                    strokeWidth={2}
                    name={`${selectedPollutant} Predicted`}
                    dot={{
                      fill: selectedPollutant === "NO2" ? "#3b82f6" : "#8b5cf6",
                      r: 3,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Note:</strong> The forecast shows predicted{" "}
                {selectedPollutant} concentrations for 3 consecutive days
                starting from {selectedDate?.toLocaleDateString()}. Data is
                sourced from historical predictions.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              {selectedDate ? (
                <div className="text-center">
                  <p className="text-lg font-medium text-red-600">
                    ⚠️ No forecast data available
                  </p>
                  <p className="text-sm mt-2">
                    No data found for the selected date. Please select a
                    different date or site.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-medium">Select a start date</p>
                  <p className="text-sm mt-2">
                    {availableDates.length === 0
                      ? `CSV file not found for ${selectedPollutant} ${selectedSite}`
                      : "Please select a start date to view 3-day forecast"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default PreviousForecast;
