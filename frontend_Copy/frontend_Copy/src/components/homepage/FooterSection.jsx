import React from "react";
import { Button } from "@/components/ui/button";

const FooterSection = ({ onLaunchDashboard }) => (
  <div className="bg-gray-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 font-['Space_Grotesk']">
          Ready to Get Started?
        </h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Access real-time air quality data, generate forecasts, and analyze
          pollution trends with our powerful machine learning platform.
        </p>
        <Button
          onClick={onLaunchDashboard}
          className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          data-testid="footer-cta-btn"
        >
          Launch Dashboard
        </Button>
      </div>
    </div>
  </div>
);

export default FooterSection;
