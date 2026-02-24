import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const FeatureCard = ({ feature, index }) => (
  <Card
    className="card-hover transition-smooth bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl"
    data-testid={`feature-card-${index}`}
  >
    <CardContent className="p-6 text-center space-y-4">
      <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
        {feature.icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
    </CardContent>
  </Card>
);

export default FeatureCard;
