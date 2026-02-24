import React from "react";
import { Button } from "@/components/ui/button";

const HeroSection = ({ onGetStarted }) => (
  <div className="relative overflow-hidden">
    {/* SIH Logo - Top Left Corner */}
    <div className="absolute top-4 left-4 z-10">
      <img
        src="/image.png"
        alt="Smart India Hackathon"
        className="h-12 sm:h-16 w-auto object-contain opacity-90"
      />
    </div>

    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10" />
    <div className="pattern-dots absolute inset-0 opacity-30" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      <div className="text-center space-y-8">
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
          data-testid="main-title"
        >
          <span className="block text-gray-900 font-['Space_Grotesk']">
            Air Quality
          </span>
          <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent font-['Space_Grotesk']">
            Forecasting Portal
          </span>
        </h1>

        <p
          className="max-w-3xl mx-auto text-xl text-gray-600 font-medium leading-relaxed"
          data-testid="subtitle"
        >
          Advanced machine learning models predict hourly ground-level
          concentrations of
          <span className="text-blue-600 font-semibold"> O₃ </span>and
          <span className="text-purple-600 font-semibold"> NO₂ </span>
          across 7 major sites in Delhi, helping you make informed decisions
          about air quality.
        </p>

        <div className="flex justify-center pt-4">
          <Button
            onClick={onGetStarted}
            className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse-glow"
            data-testid="get-started-btn"
          >
            Get Started with Forecasting
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default HeroSection;
