"use client";

import { useRef, useEffect, useState } from "react";

export function DotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    resizeObserver.observe(canvas.parentElement as Element);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    const gap = 14;
    const dots: { x: number; y: number; r: number; o: number }[] = [];

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        if (Math.random() > 0.4) {
          dots.push({
            x,
            y,
            r: 1,
            o: Math.random() * 0.3 + 0.08,
          });
        }
      }
    }

    // Animated pulse points representing health metrics
    const pulses = [
      { cx: width * 0.25, cy: height * 0.3 },
      { cx: width * 0.6, cy: height * 0.5 },
      { cx: width * 0.4, cy: height * 0.7 },
      { cx: width * 0.75, cy: height * 0.25 },
      { cx: width * 0.5, cy: height * 0.15 },
    ];

    let frameId: number;
    const startTime = Date.now();

    const isDark =
      document.documentElement.classList.contains("dark");
    const dotColor = isDark ? "140, 92, 255" : "112, 51, 255";
    const pulseColor = isDark
      ? "rgba(140, 92, 255,"
      : "rgba(112, 51, 255,";

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      dots.forEach((d) => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor}, ${d.o})`;
        ctx.fill();
      });

      const t = (Date.now() - startTime) / 1000;

      pulses.forEach((p, i) => {
        const phase = t * 0.8 + i * 1.2;
        const radius = 4 + Math.sin(phase) * 2;
        const glow = 20 + Math.sin(phase) * 10;

        ctx.beginPath();
        ctx.arc(p.cx, p.cy, glow, 0, Math.PI * 2);
        ctx.fillStyle = `${pulseColor} ${0.04 + Math.sin(phase) * 0.02})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.cx, p.cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${pulseColor} ${0.5 + Math.sin(phase) * 0.2})`;
        ctx.fill();
      });

      // Draw connecting lines between pulses
      ctx.strokeStyle = `${pulseColor} 0.06)`;
      ctx.lineWidth = 1;
      for (let i = 0; i < pulses.length - 1; i++) {
        const progress = Math.min(
          1,
          Math.max(0, (t - i * 0.8) / 2)
        );
        if (progress <= 0) continue;
        ctx.beginPath();
        ctx.moveTo(pulses[i].cx, pulses[i].cy);
        ctx.lineTo(
          pulses[i].cx +
            (pulses[i + 1].cx - pulses[i].cx) * progress,
          pulses[i].cy +
            (pulses[i + 1].cy - pulses[i].cy) * progress
        );
        ctx.stroke();
      }

      frameId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [dimensions]);

  return (
    <div className="relative size-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full"
      />
    </div>
  );
}
