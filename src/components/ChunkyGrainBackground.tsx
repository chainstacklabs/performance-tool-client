'use client';

import { useEffect, useRef } from 'react';

interface ChunkyGrainBackgroundProps {
  grainSize?: number;
  frameDelay?: number;
  opacity?: number;
}

export default function ChunkyGrainBackground({
  grainSize = 2.5,
  frameDelay = 120,
  opacity = 0.035,
}: ChunkyGrainBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let timeoutId: number | undefined;

    const resize = () => {
      canvas.width  = Math.floor(window.innerWidth  / grainSize);
      canvas.height = Math.floor(window.innerHeight / grainSize);
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const draw = () => {
      const { width, height } = canvas;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const shade = 180 + Math.random() * 75;
        const alpha = Math.random() * 22;
        data[i]     = shade;
        data[i + 1] = shade;
        data[i + 2] = shade;
        data[i + 3] = alpha;
      }

      ctx.putImageData(imageData, 0, 0);

      if (!prefersReducedMotion) {
        timeoutId = window.setTimeout(draw, frameDelay);
      }
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [grainSize, frameDelay]);

  return (
    <canvas
      ref={canvasRef}
      className="chunky-grain"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
