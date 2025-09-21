"use client";

import React, { useEffect, useRef } from "react";

type Layer = "far" | "mid" | "near";
type Kind = "bird" | "kite" | "seagull";

type SkyBackgroundProps = {
  fullscreen?: boolean;
  density?: number;
  speedScale?: number;
  wind?: number;
  tint?: string;
  showHorizon?: boolean;
  seed?: number;
  style?: React.CSSProperties;
  className?: string;
};

type Entity = {
  id: number;
  kind: Kind;
  layer: Layer;
  x: number;
  y: number;
  vx: number;
  amp: number;
  freq: number;
  life: number;
  rot: number;
  wobble: number;
  size: number;
  flipX: boolean;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const SkyBackground: React.FC<SkyBackgroundProps> = ({
  fullscreen = true,
  density = 0.6,
  speedScale = 1,
  wind = 0.1,
  tint = "#7ec8e3",
  showHorizon = true,
  seed,
  style,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const entsRef = useRef<Entity[]>([]);
  const tRef = useRef(0);
  const prngRef = useRef(() => Math.random());

  useEffect(() => {
    if (seed == null) return;
    let s = seed >>> 0;
    prngRef.current = () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return ((s >>> 0) % 1_000_000) / 1_000_000;
    };
  }, [seed]);

  const resize = () => {
    const cvs = canvasRef.current;
    if (!cvs) return;

    let w: number, h: number;
    if (fullscreen) {
      w = window.innerWidth;
      h = window.innerHeight;
    } else {
      const parent = cvs.parentElement;
      if (parent) {
        w = parent.clientWidth;
        h = parent.clientHeight;
      } else {
        w = window.innerWidth;
        h = window.innerHeight;
      }
    }

    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    cvs.width = Math.floor(w * dpr);
    cvs.height = Math.floor(h * dpr);
    cvs.style.width = `${w}px`;
    cvs.style.height = `${h}px`;
    const ctx = cvs.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  useEffect(() => {
    resize();
    if (fullscreen) {
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }
  }, [fullscreen]);

  const spawn = (canvasW: number, canvasH: number) => {
    const rnd = prngRef.current;
    const kinds: Kind[] = ["bird", "kite", "seagull"];

    const layer: Layer = (() => {
      const r = rnd();
      if (r < 0.35) return "far";
      if (r < 0.75) return "mid";
      return "near";
    })();

    const kind = kinds[Math.floor(rnd() * kinds.length)];
    const baseYByLayer =
      layer === "far"
        ? canvasH * 0.25
        : layer === "mid"
        ? canvasH * 0.45
        : canvasH * 0.6;

    const leftToRight = rnd() > 0.3 + wind * 0.2;
    const sizeBase = layer === "far" ? 10 : layer === "mid" ? 16 : 22;
    const size = sizeBase * (0.8 + rnd() * 0.6);
    const vxBase =
      (layer === "far" ? 20 : layer === "mid" ? 35 : 55) * (0.7 + rnd() * 0.6);
    const vx = (leftToRight ? 1 : -1) * vxBase;
    const amp =
      (layer === "far" ? 6 : layer === "mid" ? 10 : 16) * (0.8 + rnd() * 0.6);
    const freq = 0.6 + rnd() * 1.1;
    const x = leftToRight ? -size * 4 : canvasW + size * 4;
    const y = baseYByLayer + (rnd() - 0.5) * (layer === "near" ? 80 : 50);
    const life = 8 + rnd() * 10;
    const rot = leftToRight ? 0 : Math.PI;
    const flipX = !leftToRight;
    const wobble = rnd() * Math.PI * 2;

    const id = Math.floor(rnd() * 1e9);

    entsRef.current.push({
      id,
      kind,
      layer,
      x,
      y,
      vx,
      amp,
      freq,
      life,
      rot,
      wobble,
      size,
      flipX,
    });
  };

  const drawEntity = (ctx: CanvasRenderingContext2D, e: Entity, t: number) => {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(e.flipX ? -1 : 1, 1);
    const lift = Math.sin(t * e.freq + e.wobble) * e.amp;

    ctx.rotate(Math.atan2(lift, e.vx) * 0.2 + (e.kind === "kite" ? 0.1 : 0));

    if (e.kind === "bird") {
      const wing = Math.sin(t * (e.freq * 1.8) + e.wobble) * (e.size * 0.4);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, e.size * 0.8, e.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-e.size * 0.2, 0);
      ctx.quadraticCurveTo(-e.size * 0.6, -wing * 0.5, -e.size * 1.2, 0);
      ctx.moveTo(e.size * 0.2, 0);
      ctx.quadraticCurveTo(e.size * 0.6, -wing * 0.5, e.size * 1.2, 0);
      ctx.stroke();
      ctx.strokeStyle = "#f6b23b";
      ctx.beginPath();
      ctx.moveTo(e.size * 0.9, 0);
      ctx.lineTo(e.size * 1.1, e.size * 0.05);
      ctx.stroke();
    } else if (e.kind === "seagull") {
      const wing = Math.sin(t * (e.freq * 1.6) + e.wobble) * (e.size * 0.5);
      ctx.strokeStyle = "rgba(80,80,80,0.6)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-e.size * 1.2, 0);
      ctx.quadraticCurveTo(0, -wing, e.size * 1.2, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-e.size * 1.2, 0.6);
      ctx.quadraticCurveTo(0, -wing * 0.8 + 0.6, e.size * 1.2, 0.6);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#ff7a90";
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      const s = e.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.9, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.9, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "rgba(50,50,50,0.3)";
      ctx.beginPath();
      ctx.moveTo(0, s);
      for (let i = 1; i <= 6; i++) {
        const px =
          Math.sin((t + i * 0.2) * (e.freq * 1.2) + e.wobble) *
          (s * 0.25) *
          (i / 6);
        ctx.lineTo(px, s + i * (s * 0.35));
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    let last = performance.now();

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      tRef.current += dt;

      const w = cvs.clientWidth;
      const h = cvs.clientHeight;

      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, tint);
      g.addColorStop(1, "#cde8f5");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      if (showHorizon) {
        const horizonY = Math.floor(h * 0.72) + 0.5;
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(w, horizonY);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const y = horizonY + 8 + i * 10;
          ctx.moveTo(0, y);
          for (let x = 0; x <= w; x += 24) {
            const yy =
              y +
              Math.sin(x * 0.03 + tRef.current * (0.6 + i * 0.08)) *
                (1 + i * 0.2);
            ctx.lineTo(x, yy);
          }
        }
        ctx.stroke();
      }

      const spawnBudget = clamp(density, 0, 1) * 3;
      for (let i = 0; i < spawnBudget; i++) {
        if (
          entsRef.current.length < 60 * density &&
          Math.random() < 0.04 * density
        ) {
          spawn(w, h);
        }
      }

      const layers: Layer[] = ["far", "mid", "near"];
      for (const L of layers) {
        for (const e of entsRef.current) {
          if (e.layer !== L) continue;

          const layerMul = L === "far" ? 0.6 : L === "mid" ? 1 : 1.4;
          const wx = wind * 15;
          e.x += (e.vx + wx) * layerMul * speedScale * dt;
          e.y +=
            Math.sin(tRef.current * e.freq + e.wobble) *
            0.2 *
            layerMul *
            e.amp *
            dt *
            10;

          e.life -= dt;
          if (
            e.x < -100 ||
            e.x > w + 100 ||
            e.y < -100 ||
            e.y > h + 150 ||
            e.life <= 0
          ) {
            e.life = -9999;
          }
        }
        for (const e of entsRef.current) {
          if (e.layer === L && e.life > 0) drawEntity(ctx, e, tRef.current);
        }
      }

      if (entsRef.current.length > 0 && now % 8 < 16) {
        entsRef.current = entsRef.current.filter((e) => e.life > 0);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [density, speedScale, wind, tint, showHorizon]);

  const baseStyle: React.CSSProperties = fullscreen
    ? { position: "fixed", inset: 0, zIndex: -1 }
    : { width: "100%", height: "100%", display: "block" };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ ...baseStyle, ...style }}
      aria-hidden
    />
  );
};
