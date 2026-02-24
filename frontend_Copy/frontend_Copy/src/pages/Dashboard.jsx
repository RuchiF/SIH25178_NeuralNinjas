import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Import dashboard sections
import Overview from "@/components/dashboard/Overview";
import Forecast from "@/components/dashboard/Forecast";
import UploadData from "@/components/dashboard/UploadData";
import ModelMetrics from "@/components/dashboard/ModelMetrics";
import PreviousForecast from "@/components/dashboard/PreviousForecast";
import AirQualityMap from "@/components/dashboard/AirQualityMap";
import Test from "@/components/dashboard/Test";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PageHeader from "@/components/dashboard/PageHeader";

// Main Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  // Get current section from URL
  useEffect(() => {
    const path = location.pathname.split("/dashboard/")[1];
    if (
      path &&
      [
        "overview",
        "forecast",
        "upload",
        "metrics",
        "previous_forecast",
        "air_quality_map",
        "test",
      ].includes(path)
    ) {
      setActiveSection(path);
    } else {
      setActiveSection("overview");
      navigate("/dashboard/overview", { replace: true });
    }
  }, [location, navigate]);

  const handleNavigation = (item) => {
    setActiveSection(item.id);
    navigate(item.path);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.reload();
    }, 1000);
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <DashboardHeader
        onRefresh={handleRefresh}
        isLoading={isLoading}
        onHomeClick={handleHomeClick}
      />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar Navigation - Hidden on mobile, shown as horizontal on tablet, vertical on desktop */}
          <div className="lg:w-64 flex-shrink-0">
            <Sidebar
              activeSection={activeSection}
              onNavigate={handleNavigation}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="space-y-3 sm:space-y-6">
              <PageHeader activeSection={activeSection} />

              {/* Dynamic Content */}
              <Routes>
                <Route path="overview" element={<Overview />} />
                {/* <Route path="forecast" element={<Forecast />} /> */}
                {/* <Route path="upload" element={<UploadData />} /> */}
                <Route path="metrics" element={<ModelMetrics />} />
                <Route
                  path="previous_forecast"
                  element={<PreviousForecast />}
                />
                <Route path="air_quality_map" element={<AirQualityMap />} />
                {/* {<Route path="test" element={<Test />} />} */}
                <Route path="" element={<Overview />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
