import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CloudIcon,
  TrendingUpIcon,
  MapPinIcon,
  BarChart3Icon,
} from "lucide-react";
import {
  HeroSection,
  FeaturesSection,
  CoverageSection,
  FooterSection,
} from "@/components/homepage";

// Main Homepage Component
const Homepage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <CloudIcon className="h-6 w-6" />,
      title: "Monitoring and Forecasting",
      description: "Track O₃ and NO₂ concentrations and forest hourly",
    },
    {
      icon: <TrendingUpIcon className="h-6 w-6" />,
      title: "24-48h Forecasting",
      description: "Advanced ML predictions for air quality trends",
    },
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: "Multi-Site Coverage",
      description: "Monitor air quality across major sites in Delhi",
    },
    {
      icon: <BarChart3Icon className="h-6 w-6" />,
      title: "Model Analytics",
      description: "Detailed performance metrics and accuracy indicators",
    },
  ];

  const cities = ["Delhi"];
  const pollutants = ["O₃ (Ozone)", "NO₂ (Nitrogen Dioxide)"];

  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <HeroSection onGetStarted={handleNavigateToDashboard} />
      <FeaturesSection features={features} />
      <CoverageSection cities={cities} pollutants={pollutants} />
      <FooterSection onLaunchDashboard={handleNavigateToDashboard} />
    </div>
  );
};

export default Homepage;
