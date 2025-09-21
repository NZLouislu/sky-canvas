"use client";

import React, { useState, useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  id?: number;
  size?: number;
  opacity?: number;
  twinkle?: number;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress?: number;
  id?: number;
}

const StoriesInTheSky = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [constellationName, setConstellationName] = useState("");
  const [constellationStory, setConstellationStory] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [animatedLines, setAnimatedLines] = useState<Line[]>([]);
  const [backgroundStars, setBackgroundStars] = useState<Star[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate background stars on mount
  useEffect(() => {
    const bgStars: Star[] = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.5,
      opacity: Math.random() * 0.8,
      twinkle: Math.random() * 3 + 1,
    }));
    setBackgroundStars(bgStars);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isRevealing) return;

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setStars([...stars, { x, y, id: Date.now() }]);
    }
  };

  const calculateConstellationLines = (stars: Star[], shapeType: string) => {
    if (stars.length < 2) return [];

    const connections: Line[] = [];

    if (shapeType === "linear") {
      // Find the two most distant stars to define the line
      let maxDist = 0;
      let p1: Star | null = null,
        p2: Star | null = null;

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dist = Math.sqrt(
            Math.pow(stars[i].x - stars[j].x, 2) +
              Math.pow(stars[i].y - stars[j].y, 2)
          );
          if (dist > maxDist) {
            maxDist = dist;
            p1 = stars[i];
            p2 = stars[j];
          }
        }
      }

      // Project all stars onto the line and sort by projection distance
      if (p1 && p2) {
        const direction = { x: p2.x - p1.x, y: p2.y - p1.y };
        const length = Math.sqrt(
          direction.x * direction.x + direction.y * direction.y
        );
        const unitDir = { x: direction.x / length, y: direction.y / length };

        const projectedStars = stars.map((star) => {
          const v = { x: star.x - p1!.x, y: star.y - p1!.y };
          const projection = v.x * unitDir.x + v.y * unitDir.y;
          return { star, projection };
        });

        projectedStars.sort((a, b) => a.projection - b.projection);

        // Connect consecutive stars
        for (let i = 0; i < projectedStars.length - 1; i++) {
          connections.push({
            x1: projectedStars[i].star.x,
            y1: projectedStars[i].star.y,
            x2: projectedStars[i + 1].star.x,
            y2: projectedStars[i + 1].star.y,
          });
        }
      }
    } else if (shapeType === "circular" || shapeType === "elliptical") {
      const centroid = {
        x: stars.reduce((sum, star) => sum + star.x, 0) / stars.length,
        y: stars.reduce((sum, star) => sum + star.y, 0) / stars.length,
      };

      // Sort stars by angle from centroid
      const sortedStars = [...stars].sort((a, b) => {
        const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
        const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
        return angleA - angleB;
      });

      // Connect in circular order - ALWAYS close the shape
      for (let i = 0; i < sortedStars.length; i++) {
        const next = (i + 1) % sortedStars.length;
        connections.push({
          x1: sortedStars[i].x,
          y1: sortedStars[i].y,
          x2: sortedStars[next].x,
          y2: sortedStars[next].y,
        });
      }
    } else if (shapeType === "triangular" && stars.length === 3) {
      // Connect all three points to form a closed triangle
      for (let i = 0; i < 3; i++) {
        const next = (i + 1) % 3;
        connections.push({
          x1: stars[i].x,
          y1: stars[i].y,
          x2: stars[next].x,
          y2: stars[next].y,
        });
      }
    } else if (shapeType === "rectangular" && stars.length === 4) {
      // Find the convex hull to ensure proper rectangle ordering
      const centroid = {
        x: stars.reduce((sum, star) => sum + star.x, 0) / 4,
        y: stars.reduce((sum, star) => sum + star.y, 0) / 4,
      };

      // Sort vertices by angle to ensure proper ordering
      const sortedStars = [...stars].sort((a, b) => {
        const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
        const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
        return angleA - angleB;
      });

      // Connect the rectangle - always close it
      for (let i = 0; i < 4; i++) {
        const next = (i + 1) % 4;
        connections.push({
          x1: sortedStars[i].x,
          y1: sortedStars[i].y,
          x2: sortedStars[next].x,
          y2: sortedStars[next].y,
        });
      }
    } else if (shapeType === "grid") {
      // Connect grid pattern with regular spacing
      const xPositions = [...new Set(stars.map((s) => s.x))].sort(
        (a, b) => a - b
      );
      const yPositions = [...new Set(stars.map((s) => s.y))].sort(
        (a, b) => a - b
      );

      // Create a map for quick lookup
      const starMap = new Map();
      stars.forEach((star) => {
        starMap.set(`${star.x},${star.y}`, star);
      });

      // Connect horizontal lines
      for (const y of yPositions) {
        const rowStars = stars
          .filter((s) => Math.abs(s.y - y) < 10)
          .sort((a, b) => a.x - b.x);
        for (let i = 0; i < rowStars.length - 1; i++) {
          connections.push({
            x1: rowStars[i].x,
            y1: rowStars[i].y,
            x2: rowStars[i + 1].x,
            y2: rowStars[i + 1].y,
          });
        }
      }

      // Connect vertical lines
      for (const x of xPositions) {
        const colStars = stars
          .filter((s) => Math.abs(s.x - x) < 10)
          .sort((a, b) => a.y - b.y);
        for (let i = 0; i < colStars.length - 1; i++) {
          connections.push({
            x1: colStars[i].x,
            y1: colStars[i].y,
            x2: colStars[i + 1].x,
            y2: colStars[i + 1].y,
          });
        }
      }
    } else if (shapeType === "radial") {
      // Find center star (the one with minimum total distance to others)
      let centerStar: Star | null = null;
      let minTotalDistance = Infinity;

      stars.forEach((star, i) => {
        const totalDist = stars.reduce(
          (sum, other, j) =>
            i === j
              ? sum
              : sum +
                Math.sqrt(
                  Math.pow(star.x - other.x, 2) + Math.pow(star.y - other.y, 2)
                ),
          0
        );

        if (totalDist < minTotalDistance) {
          minTotalDistance = totalDist;
          centerStar = star;
        }
      });

      // Connect all stars to the center
      if (centerStar) {
        stars.forEach((star) => {
          if (star !== centerStar) {
            connections.push({
              x1: centerStar!.x,
              y1: centerStar!.y,
              x2: star.x,
              y2: star.y,
            });
          }
        });
      }
    } else {
      // For abstract patterns, use a combination of MST and closing connections
      if (stars.length === 0) return [];

      const visited = new Set();
      const edges: { from: number; to: number; distance: number }[] = [];
      const mst: { from: number; to: number; distance: number }[] = [];

      // Create all possible edges with distances
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const distance = Math.sqrt(
            Math.pow(stars[i].x - stars[j].x, 2) +
              Math.pow(stars[i].y - stars[j].y, 2)
          );
          edges.push({ from: i, to: j, distance });
        }
      }

      // Sort edges by distance
      edges.sort((a, b) => a.distance - b.distance);

      // Start with first star
      visited.add(0);

      while (visited.size < stars.length) {
        let minEdge: { from: number; to: number; distance: number } | null =
          null;
        let minDistance = Infinity;

        // Find minimum edge connecting visited to unvisited
        for (const edge of edges) {
          if (
            (visited.has(edge.from) && !visited.has(edge.to)) ||
            (!visited.has(edge.from) && visited.has(edge.to))
          ) {
            if (edge.distance < minDistance) {
              minDistance = edge.distance;
              minEdge = edge;
            }
          }
        }

        if (minEdge) {
          mst.push(minEdge);
          visited.add(minEdge.from);
          visited.add(minEdge.to);
        }
      }

      // Convert MST edges to connections
      for (const edge of mst) {
        connections.push({
          x1: stars[edge.from].x,
          y1: stars[edge.from].y,
          x2: stars[edge.to].x,
          y2: stars[edge.to].y,
        });
      }

      // For small star counts, consider closing the shape
      if (stars.length <= 6) {
        // Find the convex hull and close it
        const centroid = {
          x: stars.reduce((sum, star) => sum + star.x, 0) / stars.length,
          y: stars.reduce((sum, star) => sum + star.y, 0) / stars.length,
        };

        const sortedStars = [...stars].sort((a, b) => {
          const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
          const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
          return angleA - angleB;
        });

        // Add closing connections if they don't create too long lines
        for (let i = 0; i < sortedStars.length; i++) {
          const next = (i + 1) % sortedStars.length;
          const distance = Math.sqrt(
            Math.pow(sortedStars[i].x - sortedStars[next].x, 2) +
              Math.pow(sortedStars[i].y - sortedStars[next].y, 2)
          );

          // Only add if distance is reasonable
          if (distance < 300) {
            // Check if this connection already exists
            const exists = connections.some(
              (conn) =>
                (conn.x1 === sortedStars[i].x &&
                  conn.y1 === sortedStars[i].y &&
                  conn.x2 === sortedStars[next].x &&
                  conn.y2 === sortedStars[next].y) ||
                (conn.x2 === sortedStars[i].x &&
                  conn.y2 === sortedStars[i].y &&
                  conn.x1 === sortedStars[next].x &&
                  conn.y1 === sortedStars[next].y)
            );

            if (!exists) {
              connections.push({
                x1: sortedStars[i].x,
                y1: sortedStars[i].y,
                x2: sortedStars[next].x,
                y2: sortedStars[next].y,
              });
            }
          }
        }
      }
    }

    return connections;
  };

  const analyzeStarPattern = (stars: Star[]) => {
    const centroid = {
      x: stars.reduce((sum, star) => sum + star.x, 0) / stars.length,
      y: stars.reduce((sum, star) => sum + star.y, 0) / stars.length,
    };

    // Calculate distances and statistics
    const distances = stars.map((star) =>
      Math.sqrt(
        Math.pow(star.x - centroid.x, 2) + Math.pow(star.y - centroid.y, 2)
      )
    );

    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const maxDistance = Math.max(...distances);
    const minDistance = Math.min(...distances);
    const distanceVariance =
      distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) /
      distances.length;
    const distanceStdDev = Math.sqrt(distanceVariance);

    // Analyze distribution
    const distributionType =
      distanceStdDev / avgDistance > 0.5
        ? "scattered"
        : distanceStdDev / avgDistance < 0.2
        ? "clustered"
        : "balanced";

    // Shape detection algorithms
    const detectShape = () => {
      // Linear detection
      if (stars.length >= 3) {
        // Use PCA-like approach for linearity
        let covXX = 0,
          covYY = 0,
          covXY = 0;
        stars.forEach((star) => {
          const dx = star.x - centroid.x;
          const dy = star.y - centroid.y;
          covXX += dx * dx;
          covYY += dy * dy;
          covXY += dx * dy;
        });

        const trace = covXX + covYY;
        const det = covXX * covYY - covXY * covXY;
        const eigenvalues = [
          trace / 2 + Math.sqrt((trace * trace) / 4 - det),
          trace / 2 - Math.sqrt((trace * trace) / 4 - det),
        ];

        const linearityRatio =
          Math.min(...eigenvalues) / Math.max(...eigenvalues);
        if (linearityRatio < 0.15) return "linear";
      }

      // Circular/Elliptical detection
      const angleVariances = stars.map((star) => {
        const angle = Math.atan2(star.y - centroid.y, star.x - centroid.x);
        return angle;
      });

      // Check if angles are well-distributed
      angleVariances.sort((a, b) => a - b);
      let maxGap = 0;
      for (let i = 0; i < angleVariances.length; i++) {
        const gap =
          i === angleVariances.length - 1
            ? 2 * Math.PI + angleVariances[0] - angleVariances[i]
            : angleVariances[i + 1] - angleVariances[i];
        maxGap = Math.max(maxGap, gap);
      }

      if (maxGap < Math.PI / 2 && distanceStdDev / avgDistance < 0.3) {
        return "circular";
      } else if (maxGap < Math.PI / 2) {
        return "elliptical";
      }

      // Triangular detection
      if (stars.length === 3) {
        return "triangular";
      }

      // Rectangular detection
      if (stars.length === 4) {
        // Check if stars form right angles
        const angles: number[] = [];
        for (let i = 0; i < 4; i++) {
          const p1 = stars[i];
          const p2 = stars[(i + 1) % 4];
          const p3 = stars[(i + 2) % 4];

          const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
          const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

          const dot = v1.x * v2.x + v1.y * v2.y;
          const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
          const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

          angles.push(Math.acos(dot / (mag1 * mag2)));
        }

        const rightAngles = angles.filter(
          (a) => Math.abs(a - Math.PI / 2) < 0.3
        ).length;
        if (rightAngles >= 3) return "rectangular";
      }

      // Grid detection
      if (stars.length >= 6) {
        // Check for grid-like pattern
        const xPositions = stars.map((s) => s.x).sort((a, b) => a - b);
        const yPositions = stars.map((s) => s.y).sort((a, b) => a - b);

        const xGaps: number[] = [],
          yGaps: number[] = [];
        for (let i = 1; i < xPositions.length; i++) {
          xGaps.push(xPositions[i] - xPositions[i - 1]);
        }
        for (let i = 1; i < yPositions.length; i++) {
          yGaps.push(yPositions[i] - yPositions[i - 1]);
        }

        const avgXGap = xGaps.reduce((a, b) => a + b, 0) / xGaps.length;
        const avgYGap = yGaps.reduce((a, b) => a + b, 0) / yGaps.length;

        const xRegularity =
          xGaps.filter((g) => Math.abs(g - avgXGap) < avgXGap * 0.3).length /
          xGaps.length;
        const yRegularity =
          yGaps.filter((g) => Math.abs(g - avgYGap) < avgYGap * 0.3).length /
          yGaps.length;

        if (xRegularity > 0.6 && yRegularity > 0.6) return "grid";
      }

      // Cross/Star pattern detection
      if (stars.length >= 5) {
        // Find potential center star
        let centerStar: Star | null = null;
        let minTotalDistance = Infinity;

        stars.forEach((star, i) => {
          const totalDist = stars.reduce(
            (sum, other, j) =>
              i === j
                ? sum
                : sum +
                  Math.sqrt(
                    Math.pow(star.x - other.x, 2) +
                      Math.pow(star.y - other.y, 2)
                  ),
            0
          );

          if (totalDist < minTotalDistance) {
            minTotalDistance = totalDist;
            centerStar = star;
          }
        });

        // Check if other stars form radial pattern from center
        if (centerStar) {
          const angles = stars
            .filter((s) => s !== centerStar)
            .map((s) => Math.atan2(s.y - centerStar!.y, s.x - centerStar!.x))
            .sort((a, b) => a - b);

          let isRegular = true;
          const expectedAngle = (2 * Math.PI) / (stars.length - 1);
          for (let i = 0; i < angles.length; i++) {
            const nextAngle =
              i === angles.length - 1 ? angles[0] + 2 * Math.PI : angles[i + 1];
            const actualGap = nextAngle - angles[i];
            if (Math.abs(actualGap - expectedAngle) > expectedAngle * 0.3) {
              isRegular = false;
              break;
            }
          }

          if (isRegular) return "radial";
        }
      }

      return "abstract";
    };

    const shapeType = detectShape();

    // Calculate specific position data for the prompt
    const starPositions = stars.map((star, i) => ({
      id: i + 1,
      x: Math.round(star.x),
      y: Math.round(star.y),
    }));

    return {
      numStars: stars.length,
      shapeType,
      distributionType,
      avgDistance: Math.round(avgDistance),
      distanceVariance: Math.round(distanceVariance),
      centroid: {
        x: Math.round(centroid.x),
        y: Math.round(centroid.y),
      },
      starPositions,
    };
  };

  const revealConstellation = async () => {
    if (stars.length < 3) {
      alert("Please place at least 3 stars to create a constellation!");
      return;
    }

    setIsRevealing(true);
    const pattern = analyzeStarPattern(stars);
    const connectionLines = calculateConstellationLines(
      stars,
      pattern.shapeType
    );

    // Clear existing lines
    setLines([]);
    setAnimatedLines([]);

    // Create a sequence of line animations - much faster now
    let delay = 0;
    connectionLines.forEach((line, index) => {
      setTimeout(() => {
        // Add the line with progress 0
        setAnimatedLines((prev) => [
          ...prev,
          { ...line, progress: 0, id: index },
        ]);

        // Animate the line drawing
        const startTime = Date.now();
        const duration = 200; // Reduced from 500ms to 200ms

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          setAnimatedLines((prev) =>
            prev.map((l) => (l.id === index ? { ...l, progress } : l))
          );

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      }, delay);

      delay += 100; // Reduced from 300ms to 100ms
    });

    try {
      // Simulate AI response for constellation story
      setTimeout(() => {
        const stories = [
          {
            name: "The Cosmic Dragon",
            story:
              "These stars form the shape of a majestic dragon soaring through the night sky, with its wings spread wide and tail trailing behind.",
          },
          {
            name: "The Dancing Bear",
            story:
              "This constellation looks like a bear dancing on its hind legs, with the top stars forming its head and the lower ones its paws.",
          },
          {
            name: "The Celestial Ship",
            story:
              "These stars create the outline of an ancient sailing ship, complete with masts and billowing sails, navigating through the cosmic ocean.",
          },
          {
            name: "The Giant's Hand",
            story:
              "This pattern resembles a giant hand reaching across the sky, with fingers spread wide as if trying to grasp something beyond our world.",
          },
        ];

        const randomStory = stories[Math.floor(Math.random() * stories.length)];
        setConstellationName(randomStory.name);
        setConstellationStory(randomStory.story);
        setIsRevealing(false);
      }, delay + 300);
    } catch (error) {
      console.error("Error in reveal process:", error);
      setIsRevealing(false);
    }
  };

  const resetCanvas = () => {
    setStars([]);
    setLines([]);
    setAnimatedLines([]);
    setConstellationName("");
    setConstellationStory("");
  };

  return (
    <div className="relative w-full -mt-2 h-screen bg-gradient-to-b from-gray-950 via-indigo-950 to-black overflow-hidden">
      {/* Animated background stars */}
      {backgroundStars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}px`,
            top: `${star.y}px`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `twinkle ${star.twinkle}s infinite alternate`,
          }}
        />
      ))}

      {/* Main canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-pointer"
        onClick={handleCanvasClick}
      >
        {/* Constellation lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {animatedLines.map((line, i) => {
            const length = Math.sqrt(
              Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2)
            );

            return (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x1 + (line.x2 - line.x1) * (line.progress || 0)}
                y2={line.y1 + (line.y2 - line.y1) * (line.progress || 0)}
                stroke="rgba(200, 200, 255, 0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>

        {/* User-placed stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${star.x}px`, top: `${star.y}px` }}
          >
            <div className="relative">
              <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
              <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-pulse blur-sm" />
              <div className="absolute -inset-1 bg-white/30 rounded-full blur-md" />
            </div>
          </div>
        ))}
      </div>

      {/* UI Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <h1
          className="text-xl font-light text-white/90"
          style={{ fontFamily: "Quicksand, sans-serif" }}
        >
          Stories in the Sky
        </h1>

        <div className="flex gap-4">
          <button
            onClick={revealConstellation}
            disabled={isRevealing || stars.length < 3}
            className={`bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-lg 
              ${
                isRevealing || stars.length < 3
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white/20"
              } 
              transition-all duration-200 border border-white/10`}
          >
            <span
              style={{ fontFamily: "Quicksand, sans-serif" }}
              className="font-light"
            >
              {isRevealing ? "Revealing..." : "Reveal constellation"}
            </span>
          </button>

          <button
            onClick={resetCanvas}
            className="bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-lg 
              hover:bg-white/20 transition-all duration-200 border border-white/10"
          >
            <span
              style={{ fontFamily: "Quicksand, sans-serif" }}
              className="font-light"
            >
              Reset
            </span>
          </button>
        </div>
      </div>

      {/* Constellation story display */}
      {constellationName && (
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
            <h2
              className="text-xl font-semibold text-purple-300 mb-3"
              style={{ fontFamily: "Quicksand, sans-serif" }}
            >
              {constellationName}
            </h2>
            <p
              className="text-purple-100 leading-relaxed"
              style={{ fontFamily: "Quicksand, sans-serif" }}
            >
              {constellationStory}
            </p>
          </div>
        </div>
      )}

      {/* Instructions - shown when no stars are placed */}
      {stars.length === 0 && (
        <div className="absolute bottom-6 left-6 right-6 text-center">
          <p
            className="text-white/70 text-sm"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            Click anywhere to place stars to create your own story
          </p>
        </div>
      )}
    </div>
  );
};

export default StoriesInTheSky;
