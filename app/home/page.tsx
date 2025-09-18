"use client";

import React from "react";
import BackgroundSun from "@/components/BackgroundSun";
import BlueSkyWithClouds from "@/components/BlueSkyWithClouds";

const HomePage = () => {
  return (
    <div className="relative h-full">
      {/* Background elements */}
      <BlueSkyWithClouds />
      <div className="sun-container-absolute">
        <BackgroundSun />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full overflow-hidden px-4 py-8">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to Sky Canvas
          </h1>
          <p className="text-lg md:text-xl text-blue-50 mb-8">
            Experience the beauty of animated skies with floating clouds and a
            radiant sun
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-white text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
              Explore Features
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white border border-white rounded-lg hover:bg-blue-700 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sun-container-absolute {
          position: absolute;
          top: 40px;
          left: 62%;
          transform: translateX(-50%);
        }
      `}</style>
    </div>
  );
};

export default HomePage;
