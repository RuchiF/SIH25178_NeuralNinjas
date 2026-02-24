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
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  CloudIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  MapPinIcon,
} from "lucide-react";
import Papa from "papaparse";

const Overview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedCity, setSelectedCity] = useState("Site 1");
  const [selectedYear, setSelectedYear] = useState("2023");
  const [selectedPollutant, setSelectedPollutant] = useState("NO2");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [csvDataCache, setCsvDataCache] = useState({});

  const cities = [
    { name: "Site 1", coordinates: [28.69536, 77.18168] },
    { name: "Site 2", coordinates: [28.5718, 77.07125] },
    { name: "Site 3", coordinates: [28.58278, 77.23441] },
    { name: "Site 4", coordinates: [28.82286, 77.10197] },
    { name: "Site 5", coordinates: [28.53077, 77.27123] },
    { name: "Site 6", coordinates: [28.72954, 77.09601] },
    { name: "Site 7", coordinates: [28.71052, 77.24951] },
  ];

  const years = ["2023", "2024"];
  const pollutants = [
    { value: "NO2", label: "NO₂ (Nitrogen Dioxide)" },
    { value: "O3", label: "O₃ (Ozone)" },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedCity, selectedPollutant]);

  // Generate year-wise trend data from CSV
  const generateYearTrendData = async (year, pollutant, site) => {
    const siteNum = site.split(" ")[1];
    const siteId = `site${siteNum}`;

    const csvData = await loadCSVData(pollutant, siteId);

    if (csvData.length === 0) {
      return [];
    }

    // Filter data by year and aggregate by month
    const monthlyData = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    csvData.forEach((row) => {
      if (!row.DATETIME) return;

      const date = new Date(row.DATETIME);
      const rowYear = date.getFullYear();

      if (rowYear.toString() === year) {
        const month = months[date.getMonth()];
        const concentration = parseFloat(row[`${pollutant} PREDICTED`]);

        if (!isNaN(concentration)) {
          if (!monthlyData[month]) {
            monthlyData[month] = { sum: 0, count: 0 };
          }
          monthlyData[month].sum += concentration;
          monthlyData[month].count += 1;
        }
      }
    });

    // Calculate averages
    return months.map((month) => ({
      month,
      concentration: monthlyData[month]
        ? Math.round((monthlyData[month].sum / monthlyData[month].count) * 10) /
          10
        : 0,
      year: parseInt(year),
    }));
  };

  const [yearTrendData, setYearTrendData] = useState([]);

  useEffect(() => {
    const loadTrendData = async () => {
      const data = await generateYearTrendData(
        selectedYear,
        selectedPollutant,
        selectedCity
      );
      setYearTrendData(data);
    };

    loadTrendData();
  }, [selectedYear, selectedPollutant, selectedCity, csvDataCache]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load data from CSV files for all sites
      const sitesData = await Promise.all(
        cities.map(async (city) => {
          const siteNum = city.name.split(" ")[1];
          const siteId = `site${siteNum}`;

          // Load both NO2 and O3 data for this site
          const no2Data = await loadCSVData("NO2", siteId);
          const o3Data = await loadCSVData("O3", siteId);

          // Get latest values (last row)
          const latestNO2 =
            no2Data.length > 0
              ? parseFloat(no2Data[no2Data.length - 1]["NO2 PREDICTED"])
              : 0;
          const latestO3 =
            o3Data.length > 0
              ? parseFloat(o3Data[o3Data.length - 1]["O3 PREDICTED"])
              : 0;

          return {
            city: city.name,
            no2_concentration: latestNO2,
            o3_concentration: latestO3,
            predicted_by_model: true,
            overall_aqi: Math.max(latestNO2, latestO3),
          };
        })
      );

      setDashboardData({
        current_readings: sitesData,
        models_status: {
          no2_model: "active",
          o3_model: "active",
        },
      });

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("❌ Error loading CSV data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCSVData = async (pollutant, siteId) => {
    const cacheKey = `${pollutant}_${siteId}`;

    // Return cached data if available
    if (csvDataCache[cacheKey]) {
      return csvDataCache[cacheKey];
    }

    try {
      const response = await fetch(
        `/predictions/${pollutant}_${siteId}_prediction_vs_actual_comparison.csv`
      );

      if (!response.ok) {
        console.error(`CSV file not found for ${pollutant} ${siteId}`);
        return [];
      }

      const csvText = await response.text();

      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Cache the data
            setCsvDataCache((prev) => ({ ...prev, [cacheKey]: results.data }));
            resolve(results.data);
          },
          error: () => {
            resolve([]);
          },
        });
      });
    } catch (error) {
      console.error(`Error loading ${pollutant} ${siteId}:`, error);
      return [];
    }
  };

  const getAQIColor = (category) => {
    const colors = {
      Good: "bg-green-100 text-green-700 border-green-200",
      Satisfactory: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Moderate: "bg-orange-100 text-orange-700 border-orange-200",
      Poor: "bg-red-100 text-red-700 border-red-200",
      Severe: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getAQICategory = (concentration, pollutant) => {
    if (pollutant === "NO2") {
      if (concentration <= 40) return "Good";
      if (concentration <= 80) return "Satisfactory";
      if (concentration <= 180) return "Moderate";
      if (concentration <= 280) return "Poor";
      return "Severe";
    } else {
      // O3
      if (concentration <= 50) return "Good";
      if (concentration <= 100) return "Satisfactory";
      if (concentration <= 168) return "Moderate";
      if (concentration <= 208) return "Poor";
      return "Severe";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner mr-3"></div>
        <span className="text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  const currentCityData =
    dashboardData?.current_readings?.find(
      (city) => city.city === selectedCity
    ) || {};
  const historicalData = dashboardData?.historical_data || [];

  console.log("🏙️ Selected city:", selectedCity);
  console.log("📊 Full dashboard data:", dashboardData);
  console.log("🏙️ Current city data:", currentCityData);
  console.log("📈 NO2 value:", currentCityData.no2_concentration);
  console.log("📈 O3 value:", currentCityData.o3_concentration);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Select
            value={selectedCity}
            onValueChange={setSelectedCity}
            data-testid="city-select"
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.name} value={city.name}>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{city.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
            data-testid="year-select"
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedPollutant}
            onValueChange={setSelectedPollutant}
            data-testid="pollutant-select"
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select pollutant" />
            </SelectTrigger>
            <SelectContent>
              {pollutants.map((pollutant) => (
                <SelectItem key={pollutant.value} value={pollutant.value}>
                  {pollutant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 w-full sm:w-auto"
            data-testid="refresh-data-btn"
          >
            <RefreshCwIcon className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {lastUpdated && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Last updated: {lastUpdated}
          </Badge>
        )}
      </div>

      {/* Current Air Quality Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* NO2 Concentration */}
        <Card
          className="bg-white/70 backdrop-blur-sm border-0 shadow-lg"
          data-testid="no2-card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <CloudIcon className="h-5 w-5 text-blue-600" />
              <span>NO₂ Level</span>
              {currentCityData.predicted_by_model && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-100 text-green-700 border-green-200"
                >
                  AI Predicted
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-gray-900">
                {currentCityData.no2_concentration?.toFixed(1) || "N/A"}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  μg/m³
                </span>
              </div>
              <Badge
                className={`${getAQIColor(
                  getAQICategory(currentCityData.no2_concentration, "NO2")
                )} border`}
              >
                {getAQICategory(currentCityData.no2_concentration, "NO2")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* O3 Concentration */}
        <Card
          className="bg-white/70 backdrop-blur-sm border-0 shadow-lg"
          data-testid="o3-card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <CloudIcon className="h-5 w-5 text-purple-600" />
              <span>O₃ Level</span>
              {currentCityData.predicted_by_model && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-100 text-green-700 border-green-200"
                >
                  AI Predicted
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-gray-900">
                {currentCityData.o3_concentration?.toFixed(1) || "N/A"}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  μg/m³
                </span>
              </div>
              <Badge
                className={`${getAQIColor(
                  getAQICategory(currentCityData.o3_concentration, "O3")
                )} border`}
              >
                {getAQICategory(currentCityData.o3_concentration, "O3")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Overall AQI */}
        <Card
          className="bg-white/70 backdrop-blur-sm border-0 shadow-lg"
          data-testid="aqi-card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
              <span>Overall AQI</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-gray-900">
                {Math.round(currentCityData.overall_aqi || 0)}
              </div>
              <Badge
                className={`${getAQIColor(
                  getAQICategory(
                    Math.max(
                      currentCityData.no2_concentration || 0,
                      currentCityData.o3_concentration || 0
                    ),
                    "NO2"
                  )
                )} border`}
              >
                Air Quality Index
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card
          className="bg-white/70 backdrop-blur-sm border-0 shadow-lg"
          data-testid="status-card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangleIcon className="h-5 w-5 text-orange-600" />
              <span>Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-lg font-semibold text-gray-900">
                {dashboardData?.models_status?.no2_model === "active" &&
                dashboardData?.models_status?.o3_model === "active"
                  ? "Active"
                  : "Inactive"}
              </div>
              <Badge className="bg-green-100 text-green-700 border border-green-200">
                Models Running
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year-wise Trend Chart */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center space-x-2">
            <span>Year-wise Trend Analysis</span>
            <Badge
              variant="outline"
              className="text-xs bg-blue-100 text-blue-700 border-blue-200"
            >
              {selectedYear} - {selectedPollutant}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Monthly concentration trends for {selectedCity} in {selectedYear}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  label={{
                    value: "Concentration (μg/m³)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  labelFormatter={(value) => `Month: ${value}`}
                  formatter={(value) => [
                    `${value.toFixed(2)} μg/m³`,
                    selectedPollutant === "NO2" ? "NO₂" : "O₃",
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="concentration"
                  stroke={selectedPollutant === "NO2" ? "#3b82f6" : "#8b5cf6"}
                  strokeWidth={3}
                  name={selectedPollutant === "NO2" ? "NO₂" : "O₃"}
                  dot={{
                    r: 4,
                    fill: selectedPollutant === "NO2" ? "#3b82f6" : "#8b5cf6",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* City Comparison */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">City Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.current_readings || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="city" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  label={{
                    value: "Concentration (μg/m³)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value.toFixed(2)} μg/m³`,
                    name === "no2_concentration" ? "NO₂" : "O₃",
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="no2_concentration"
                  fill="#3b82f6"
                  name="NO₂"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="o3_concentration"
                  fill="#8b5cf6"
                  name="O₃"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
