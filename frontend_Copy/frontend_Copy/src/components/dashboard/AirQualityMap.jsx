import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { MapPinIcon, CalendarIcon } from "lucide-react";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AirQualityMap = () => {
  console.log("AirQualityMap component rendering");

  const [selectedPollutant, setSelectedPollutant] = useState("NO2");
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  const pollutants = [
    { value: "NO2", label: "NO₂", color: "#3b82f6" },
    { value: "O3", label: "O₃", color: "#8b5cf6" },
  ];
  const [siteConcentrations, setSiteConcentrations] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sites = [
    { id: "site1", name: "Site 1", lat: 28.69536, lng: 77.18168 },
    { id: "site2", name: "Site 2", lat: 28.5718, lng: 77.07125 },
    { id: "site3", name: "Site 3", lat: 28.58278, lng: 77.23441 },
    { id: "site4", name: "Site 4", lat: 28.82286, lng: 77.10197 },
    { id: "site5", name: "Site 5", lat: 28.53077, lng: 77.27123 },
    { id: "site6", name: "Site 6", lat: 28.72954, lng: 77.09601 },
    { id: "site7", name: "Site 7", lat: 28.71052, lng: 77.24951 },
  ];

  // Delhi boundaries (from actual GeoJSON data)
  const delhiBounds = {
    north: 28.883497,
    south: 28.404243,
    east: 77.347476,
    west: 76.838776,
  };

  // State for GeoJSON boundary
  const [delhiGeoJSON, setDelhiGeoJSON] = useState(null);

  useEffect(() => {
    loadAllSitesData();
    loadDelhiGeoJSON();
  }, [selectedPollutant]);

  const loadDelhiGeoJSON = async () => {
    try {
      const response = await fetch("/delhi-ac.geojson");
      if (response.ok) {
        const geojson = await response.text();
        setDelhiGeoJSON(JSON.parse(geojson));
        console.log("Delhi GeoJSON loaded");
      }
    } catch (error) {
      console.error("Error loading GeoJSON:", error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      calculateSiteMeanConcentrations();
    }
  }, [selectedDate]);

  const loadAllSitesData = async () => {
    console.log("Loading site data...");
    const allDates = new Set();

    for (const site of sites) {
      try {
        const response = await fetch(
          `/predictions/${selectedPollutant}_${site.id}_prediction_vs_actual_comparison.csv`
        );
        console.log(
          `Fetching ${selectedPollutant} ${site.id}:`,
          response.status
        );
        if (response.ok) {
          const csvText = await response.text();
          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              results.data.forEach((row) => {
                if (row.DATETIME) {
                  const dateStr = row.DATETIME.split(" ")[0];
                  allDates.add(dateStr);
                }
              });
            },
          });
        }
      } catch (error) {
        console.error(`Error loading ${site.id}:`, error);
        setError(`Failed to load data for ${site.id}`);
      }
    }

    const dates = Array.from(allDates)
      .map((dateStr) => new Date(dateStr))
      .filter((date) => !isNaN(date.getTime()))
      .sort((a, b) => a - b);

    console.log("Available dates:", dates.length);
    setAvailableDates(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  };

  const calculateSiteMeanConcentrations = async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    const concentrations = {};

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const fullDate = `${year}-${month}-${day}`;

    for (const site of sites) {
      try {
        const response = await fetch(
          `/predictions/${selectedPollutant}_${site.id}_prediction_vs_actual_comparison.csv`
        );
        if (response.ok) {
          const csvText = await response.text();

          await new Promise((resolve) => {
            Papa.parse(csvText, {
              header: true,
              complete: (results) => {
                const dayData = results.data
                  .filter(
                    (row) => row.DATETIME && row.DATETIME.startsWith(fullDate)
                  )
                  .map(
                    (row) => parseFloat(row[`${selectedPollutant} TARGET`]) || 0
                  );

                if (dayData.length > 0) {
                  const mean =
                    dayData.reduce((sum, val) => sum + val, 0) / dayData.length;
                  concentrations[site.id] = mean;
                } else {
                  concentrations[site.id] = null;
                }
                resolve();
              },
            });
          });
        }
      } catch (error) {
        console.error(`Error calculating for ${site.id}:`, error);
        concentrations[site.id] = null;
      }
    }

    setSiteConcentrations(concentrations);
    setIsLoading(false);
  };

  const getColorForConcentration = (concentration) => {
    if (concentration === null) return "#9ca3af"; // Gray for no data
    if (concentration <= 40) return "#10b981"; // Green - Good
    if (concentration <= 80) return "#fbbf24"; // Yellow - Moderate
    if (concentration <= 180) return "#f97316"; // Orange - Unhealthy for sensitive
    if (concentration <= 280) return "#ef4444"; // Red - Unhealthy
    return "#7c2d12"; // Dark red - Very unhealthy
  };

  const getAQICategory = (concentration) => {
    if (concentration === null) return "No Data";
    if (concentration <= 40) return "Good";
    if (concentration <= 80) return "Moderate";
    if (concentration <= 180) return "Unhealthy for Sensitive";
    if (concentration <= 280) return "Unhealthy";
    return "Very Unhealthy";
  };

  // Convert lat/lng to SVG coordinates
  const latLngToSvg = (lat, lng) => {
    const x =
      ((lng - delhiBounds.west) / (delhiBounds.east - delhiBounds.west)) * 800;
    const y =
      ((delhiBounds.north - lat) / (delhiBounds.north - delhiBounds.south)) *
      600;
    return { x, y };
  };

  const renderDelhiBoundary = () => {
    if (!delhiGeoJSON) return null;

    return delhiGeoJSON.features.map((feature, idx) => {
      if (feature.geometry.type === "Polygon") {
        const coordinates = feature.geometry.coordinates[0];
        // Simplify by taking every 10th point for performance
        const simplified = coordinates.filter((_, i) => i % 10 === 0);
        const pathData =
          simplified
            .map((coord, i) => {
              const { x, y } = latLngToSvg(coord[1], coord[0]);
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ") + " Z";

        return (
          <path
            key={idx}
            d={pathData}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            opacity="0.6"
          />
        );
      }
      return null;
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Date Selectors */}
      <Card>
        <CardHeader>
          <CardTitle>
            Delhi Air Quality Map - Site Mean {selectedPollutant} Concentration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
                disabled={false}
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
              {selectedDate &&
                Object.keys(siteConcentrations).length === 0 &&
                !isLoading && (
                  <p className="text-sm text-red-600 mt-1">
                    ⚠️ No data available for selected date
                  </p>
                )}
            </div>
          </div>

          {/* Map */}
          <div className="bg-gray-50 rounded-lg p-4">
            <svg
              width="100%"
              height="600"
              viewBox="0 0 800 600"
              className="bg-white rounded"
            >
              {/* Background */}
              <rect x="0" y="0" width="800" height="600" fill="#e0f2fe" />

              {/* Delhi boundary from GeoJSON */}
              {renderDelhiBoundary()}

              {/* Grid lines overlay */}
              {[...Array(10)].map((_, i) => (
                <React.Fragment key={i}>
                  <line
                    x1={i * 80}
                    y1="0"
                    x2={i * 80}
                    y2="600"
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                  <line
                    x1="0"
                    y1={i * 60}
                    x2="800"
                    y2={i * 60}
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                </React.Fragment>
              ))}

              {/* Sites */}
              {sites.map((site) => {
                const { x, y } = latLngToSvg(site.lat, site.lng);
                const concentration = siteConcentrations[site.id];
                const color = getColorForConcentration(concentration);

                return (
                  <g key={site.id}>
                    {/* Site marker */}
                    <circle
                      cx={x}
                      cy={y}
                      r="20"
                      fill={color}
                      stroke="white"
                      strokeWidth="3"
                      opacity="0.9"
                      style={{ cursor: "pointer" }}
                    />
                    {/* Site label */}
                    <text
                      x={x}
                      y={y + 35}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#1f2937"
                    >
                      {site.name}
                    </text>
                    {/* Concentration value */}
                    {concentration !== null && concentration !== undefined && (
                      <text
                        x={x}
                        y={y + 50}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6b7280"
                      >
                        {concentration.toFixed(1)} μg/m³
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Delhi label */}
              <text
                x="400"
                y="30"
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                fill="#1f2937"
              >
                Delhi NCR
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              AQI Categories (NO2)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 flex-shrink-0 rounded"
                  style={{ backgroundColor: "#10b981" }}
                ></div>
                <span className="text-xs sm:text-sm">Good (0-40)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: "#fbbf24" }}
                ></div>
                <span className="text-sm">Moderate (41-80)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: "#f97316" }}
                ></div>
                <span className="text-sm">Unhealthy (81-180)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: "#ef4444" }}
                ></div>
                <span className="text-sm">Very Unhealthy (181-280)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: "#7c2d12" }}
                ></div>
                <span className="text-sm">Hazardous (280+)</span>
              </div>
            </div>
          </div>

          {/* Site Details Table */}
          {selectedDate && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Site Details for {selectedDate.toLocaleDateString("en-CA")}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Site
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mean {selectedPollutant} (μg/m³)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        AQI Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sites.map((site) => {
                      const concentration = siteConcentrations[site.id];
                      return (
                        <tr key={site.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {site.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {concentration !== null &&
                            concentration !== undefined
                              ? concentration.toFixed(2)
                              : "No Data"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              style={{
                                backgroundColor:
                                  getColorForConcentration(concentration),
                                color: "white",
                              }}
                            >
                              {getAQICategory(concentration)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {site.lat.toFixed(4)}°N, {site.lng.toFixed(4)}°E
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AirQualityMap;
