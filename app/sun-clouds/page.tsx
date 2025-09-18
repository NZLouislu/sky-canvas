"use client";

import React from "react";
import BackgroundSun from "@/components/BackgroundSun";
import BackgroundScene from "@/components/BackgroundScene";

const SunAndCloudsPage = () => {
  return (
    <div className="relative h-full">
      {/* Background elements */}
      <BackgroundScene />
      <div className="sun-container-absolute">
        <BackgroundSun />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full overflow-hidden px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 max-w-3xl mx-4">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-600 mb-6">
            Sun and Clouds
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Enjoy the beautiful animated sky with floating clouds and a radiant
            sun
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Explore Features
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sun-container-absolute {
          position: absolute;
          top: 40px;
          left: 60%;
          transform: translateX(-50%);
        }
      `}</style>
    </div>
  );
};

export default SunAndCloudsPage;
