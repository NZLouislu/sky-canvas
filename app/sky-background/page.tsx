"use client";

import React from "react";
import { SkyBackground } from "@/components/SkyBackground";

const SkyBackgroundPage = () => {
  return (
    <div className="relative -mt-3 h-screen w-full overflow-hidden">
      <SkyBackground
        fullscreen={false}
        density={0.7}
        speedScale={1}
        wind={0.15}
        tint="#87ceeb"
        showHorizon={true}
        seed={42}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full overflow-hidden px-4 py-8">
        <div className="text-center max-w-3xl bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Sky Flight Background
          </h1>
          <p className="text-lg md:text-xl text-blue-800 mb-8">
            Watch birds, kites, and seagulls fly across the sky with realistic
            physics and beautiful animations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">
                Birds
              </h3>
              <p className="text-blue-800">
                Elegant birds flying with natural wing movements
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">
                Kites
              </h3>
              <p className="text-blue-800">
                Colorful kites with flowing tails dancing in the wind
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">
                Seagulls
              </h3>
              <p className="text-blue-800">
                Seagulls gliding close to the horizon
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              onClick={() => window.location.reload()}
            >
              Refresh Animation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkyBackgroundPage;
