"use client";
import React, { useState, useEffect, useRef } from "react";

// Define types for our objects
type Star = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleRate: number;
};

type GrassBlade = {
  x: number;
  baseY: number;
  height: number;
  angle: number;
  targetAngle: number;
  width: number;
  sway: number;
  swaySpeed: number;
  swayIntensity: number;
  springiness: number;
  color: string;
};

const DayNightPage = () => {
  const [isDay, setIsDay] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const grassRef = useRef<GrassBlade[]>([]);
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  });

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setScreenSize({ width: window.innerWidth, height: window.innerHeight });
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // Generate grass colors
  const getGrassColor = (isDayMode: boolean) => {
    if (isDayMode) {
      const hue = 100 + Math.random() * 30;
      const saturation = 70 + Math.random() * 20;
      const lightness = 25 + Math.random() * 20;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    } else {
      const hue = 100 + Math.random() * 20;
      const saturation = 20 + Math.random() * 10;
      const lightness = 10 + Math.random() * 10;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
  };

  // Generate grass field
  const generateGrass = (isDayMode: boolean) => {
    const grassCount = Math.floor((screenSize.width * screenSize.height) / 500);
    const grassBlades = [];

    for (let i = 0; i < grassCount; i++) {
      grassBlades.push({
        x: Math.random() * screenSize.width,
        baseY: screenSize.height - 10 - Math.random() * 200,
        height: 40 + Math.random() * 60,
        angle: 0,
        targetAngle: 0,
        width: 2 + Math.random() * 3,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        swayIntensity: 0.01 + Math.random() * 0.03,
        springiness: 0.05 + Math.random() * 0.05,
        color: getGrassColor(isDayMode),
      });
    }

    // Add bottom edge grass
    for (let i = 0; i < grassCount / 4; i++) {
      grassBlades.push({
        x: Math.random() * screenSize.width,
        baseY: screenSize.height + Math.random() * 50,
        height: 60 + Math.random() * 80,
        angle: 0,
        targetAngle: 0,
        width: 2 + Math.random() * 3,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        swayIntensity: 0.01 + Math.random() * 0.03,
        springiness: 0.05 + Math.random() * 0.05,
        color: isDayMode
          ? `hsl(${100 + Math.random() * 30}, 70%, ${25 + Math.random() * 20}%)`
          : `hsl(${100 + Math.random() * 20}, 20%, ${
              10 + Math.random() * 10
            }%)`,
      });
    }

    return grassBlades;
  };

  // Initialize grass
  useEffect(() => {
    grassRef.current = generateGrass(isDay);
  }, [isDay, screenSize]);

  // Toggle between day and night
  const toggleDayNight = () => {
    setIsDay(!isDay);
  };

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, screenSize.width, screenSize.height);

      if (isDay) {
        // Draw sky gradient for day
        const skyGradient = ctx.createLinearGradient(
          0,
          0,
          0,
          screenSize.height
        );
        skyGradient.addColorStop(0, "#4DA6FF");
        skyGradient.addColorStop(0.7, "#87CEEB");
        skyGradient.addColorStop(1, "#A1D7A9");

        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, screenSize.width, screenSize.height);

        // Draw sun
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(
          screenSize.width * 0.8,
          screenSize.height * 0.2,
          40,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Sun rays
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI * 2) / 12;
          ctx.beginPath();
          ctx.moveTo(
            screenSize.width * 0.8 + Math.cos(angle) * 50,
            screenSize.height * 0.2 + Math.sin(angle) * 50
          );
          ctx.lineTo(
            screenSize.width * 0.8 + Math.cos(angle) * 60,
            screenSize.height * 0.2 + Math.sin(angle) * 60
          );
          ctx.strokeStyle = "#FFD700";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      } else {
        // Draw night sky gradient
        const skyGradient = ctx.createLinearGradient(
          0,
          0,
          0,
          screenSize.height
        );
        skyGradient.addColorStop(0, "#0B1A2A");
        skyGradient.addColorStop(0.3, "#183049");
        skyGradient.addColorStop(0.7, "#2A4D69");
        skyGradient.addColorStop(1, "#203A2E");

        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, screenSize.width, screenSize.height);

        // Draw stars
        if (!starsRef.current || starsRef.current.length === 0) {
          starsRef.current = [];
          for (let i = 0; i < 100; i++) {
            starsRef.current.push({
              x: Math.random() * screenSize.width,
              y: Math.random() * screenSize.height * 0.7,
              size: Math.random() * 1.5,
              opacity: Math.random() * 0.3 + 0.7,
              twinkleRate: Math.random() * 0.0005 + 0.0002,
            });
          }
        }

        const timeNow = Date.now() * 0.001;
        starsRef.current.forEach((star) => {
          const twinkle = Math.sin(timeNow * star.twinkleRate) * 0.2 + 0.8;
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw moon
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(
          screenSize.width * 0.8,
          screenSize.height * 0.2,
          40,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Moon shadow
        ctx.fillStyle = "#0B1A2A";
        ctx.beginPath();
        ctx.arc(
          screenSize.width * 0.8 + 10,
          screenSize.height * 0.2,
          40,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Draw grass with gentle sway animation
      grassRef.current.forEach((blade) => {
        // Natural swaying
        blade.sway += blade.swaySpeed;
        const naturalSway = Math.sin(blade.sway) * blade.swayIntensity;

        // Render grass blade
        ctx.save();
        ctx.translate(blade.x, blade.baseY);
        ctx.rotate(naturalSway);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          blade.width / 2,
          -blade.height / 2,
          0,
          -blade.height
        );
        ctx.quadraticCurveTo(-blade.width / 2, -blade.height / 2, 0, 0);

        ctx.fillStyle = blade.color;
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isDay, screenSize]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={screenSize.width}
        height={screenSize.height}
        className="absolute inset-0"
      />
      <div className="absolute top-20 right-4 z-10">
        <button
          onClick={toggleDayNight}
          className="px-4 py-2 bg-white/30 backdrop-blur-sm rounded-lg shadow-md hover:bg-white/50 transition-all duration-300 font-medium"
        >
          {isDay ? "🌙 Night" : "☀️ Day"}
        </button>
      </div>
    </div>
  );
};

export default DayNightPage;
