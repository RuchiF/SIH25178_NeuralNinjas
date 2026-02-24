import React from "react";
import FeatureCard from "./FeatureCard";

const FeaturesSection = ({ features }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div className="text-center mb-16">
      <h2
        className="text-4xl font-bold text-gray-900 mb-4"
        data-testid="features-title"
      >
        Powerful Features
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Everything you need to understand and predict air quality patterns
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, index) => (
        <FeatureCard key={index} feature={feature} index={index} />
      ))}
    </div>
  </div>
);

export default FeaturesSection;
