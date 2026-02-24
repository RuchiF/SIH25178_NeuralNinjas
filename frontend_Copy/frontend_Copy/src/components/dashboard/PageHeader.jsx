import React from "react";
import { navigationItems } from "./Sidebar";

const PageHeader = ({ activeSection }) => {
  const currentItem = navigationItems.find((item) => item.id === activeSection);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-0 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 capitalize">
            {activeSection.replace("-", " ")}
          </h2>
          <p className="text-gray-600 mt-1">{currentItem?.description}</p>
        </div>
        <div className="flex items-center space-x-2">{currentItem?.icon}</div>
      </div>
    </div>
  );
};

export default PageHeader;
