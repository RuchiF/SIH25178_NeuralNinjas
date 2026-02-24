import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CoverageSection = ({ cities, pollutants }) => (
  <div className="bg-white/30 backdrop-blur-sm border-y border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2
            className="text-4xl font-bold text-gray-900 mb-6"
            data-testid="coverage-title"
          >
            Comprehensive Coverage
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Our advanced XGBoost models provide accurate forecasts for major
            Indian cities, tracking the two most critical air pollutants
            affecting public health.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Cities Covered
              </h3>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Badge
                    key={city}
                    variant="secondary"
                    className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
                    data-testid={`city-badge-${city}`}
                  >
                    {city}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Pollutants Monitored
              </h3>
              <div className="flex flex-wrap gap-2">
                {pollutants.map((pollutant) => (
                  <Badge
                    key={pollutant}
                    variant="secondary"
                    className="px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                    data-testid={`pollutant-badge-${pollutant}`}
                  >
                    {pollutant}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CoverageSection;
