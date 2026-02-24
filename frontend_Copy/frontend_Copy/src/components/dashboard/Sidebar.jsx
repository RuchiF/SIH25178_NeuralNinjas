import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HomeIcon,
  TrendingUpIcon,
  UploadIcon,
  BarChart3Icon,
  MapPinIcon,
} from "lucide-react";

// Navigation configuration
const navigationItems = [
  {
    id: "overview",
    label: "Overview",
    icon: <HomeIcon className="h-5 w-5" />,
    path: "/dashboard/overview",
    description: "Real-time air quality dashboard",
  },
  // {
  //   id: "forecast",
  //   label: "Forecast",
  //   icon: <TrendingUpIcon className="h-5 w-5" />,
  //   path: "/dashboard/forecast",
  //   description: "24-48h pollutant predictions",
  // },
  // {
  //   id: "upload",
  //   label: "Upload Data",
  //   icon: <UploadIcon className="h-5 w-5" />,
  //   path: "/dashboard/upload",
  //   description: "Upload CSV for predictions",
  // },

  {
    id: "previous_forecast",
    label: "Forecast",
    icon: <TrendingUpIcon className="h-5 w-5" />,
    path: "/dashboard/previous_forecast",
    description: "see previous forecasts",
  },
  {
    id: "air_quality_map",
    label: "Air Quality Map",
    icon: <MapPinIcon className="h-5 w-5" />,
    path: "/dashboard/air_quality_map",
    description: "Delhi site concentrations",
  },
  {
    id: "metrics",
    label: "Model Statistics",
    icon: <BarChart3Icon className="h-5 w-5" />,
    path: "/dashboard/metrics",
    description: "Model performance analytics",
  },
  // {
  //   id: "test",
  //   label: "Test",
  //   icon: <BarChart3Icon className="h-5 w-5" />,
  //   path: "/dashboard/test",
  //   description: "CSV data analysis tool",
  // },
];

const Sidebar = ({ activeSection, onNavigate }) => {
  return (
    <Card className="sidebar-nav sticky top-20 lg:top-24 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Navigation</span>
          <span className="sm:hidden">Menu</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 sm:space-y-2 p-2 sm:p-4">
        {navigationItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate(item)}
            className={`nav-item cursor-pointer p-2 sm:p-3 rounded-lg transition-colors ${
              activeSection === item.id
                ? "active bg-blue-50 dark:bg-blue-900/30"
                : "hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
            data-testid={`nav-${item.id}`}
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">{item.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm sm:text-base truncate">
                  {item.label}
                </div>
                <div className="text-xs opacity-70 hidden sm:block truncate">
                  {item.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Sidebar;
export { navigationItems };
