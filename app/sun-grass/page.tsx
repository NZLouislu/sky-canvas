"use client";
import React, { useState, useEffect, useRef } from "react";

const SunGrassPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Generate grass colors for day
  const getGrassColor = () => {
    const hue = 100 + Math.random() * 30;
    const saturation = 70 + Math.random() * 20;
    const lightness = 25 + Math.random() * 20;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Generate grass field
  const generateGrass = () => {
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
        color: getGrassColor(),
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
        color: `hsl(${100 + Math.random() * 30}, 70%, ${
          25 + Math.random() * 20
        }%)`,
      });
    }

    return grassBlades;
  };

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const grass = generateGrass();

    const animate = () => {
      ctx.clearRect(0, 0, screenSize.width, screenSize.height);

      // Draw sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, screenSize.height);
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

      // Draw grass with gentle sway animation
      grass.forEach((blade) => {
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
  }, [screenSize]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={screenSize.width}
        height={screenSize.height}
        className="absolute inset-0"
      />
    </div>
  );
};

export default SunGrassPage;
