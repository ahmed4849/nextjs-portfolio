"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number; z: number };

function spherePoints(count: number): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = Math.PI * (3 - Math.sqrt(5)) * index;
    return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
  });
}

const PARTICLES = spherePoints(620);
const KNOT = Array.from({ length: 240 }, (_, index) => {
  const angle = (index / 239) * Math.PI * 2;
  const radius = 1.5 + 0.48 * Math.cos(angle * 3);
  return {
    x: radius * Math.cos(angle * 2),
    y: radius * Math.sin(angle * 2),
    z: 0.64 * Math.sin(angle * 3),
  };
});

/** Projects a real 3D point field onto canvas without a heavy rendering dependency. */
export function ParticleSculpture({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let rotation = 0.4;
    let lastTime = 0;
    let visible = true;
    let disposed = false;
    const pointer = { x: 0, y: 0 };
    const tilt = { x: 0, y: 0 };

    const project = (point: Point, size: number) => {
      const yAngle = rotation + tilt.x;
      const xAngle = 0.55 + tilt.y;
      const x = point.x * Math.cos(yAngle) + point.z * Math.sin(yAngle);
      const depth = point.z * Math.cos(yAngle) - point.x * Math.sin(yAngle);
      const y = point.y * Math.cos(xAngle) - depth * Math.sin(xAngle);
      const z = point.y * Math.sin(xAngle) + depth * Math.cos(xAngle);
      const perspective = 4 / (4 - z * 0.32);
      return {
        x: width / 2 + x * size * perspective,
        y: height / 2 + y * size * perspective,
        z,
      };
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const scale = Math.min(width, height) * 0.24;
      const glow = context.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        scale * 2.1,
      );
      glow.addColorStop(0, "rgba(71,218,231,.12)");
      glow.addColorStop(1, "rgba(71,218,231,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      const particles = PARTICLES.map((point) =>
        project(point, scale * 1.85),
      ).sort((a, b) => a.z - b.z);
      for (const point of particles) {
        const opacity = 0.18 + ((point.z + 1) / 2) * 0.58;
        context.fillStyle = `rgba(104,222,232,${opacity})`;
        context.beginPath();
        context.arc(
          point.x,
          point.y,
          point.z > 0 ? 1.15 : 0.65,
          0,
          Math.PI * 2,
        );
        context.fill();
      }

      const knot = KNOT.map((point) => project(point, scale * 0.92));
      context.lineCap = "round";
      for (let index = 1; index < knot.length; index++) {
        const previous = knot[index - 1];
        const point = knot[index];
        const light = Math.max(0.2, Math.min(1, (point.z + 2) / 4));
        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = `rgba(${Math.round(75 + light * 110)},${Math.round(140 + light * 100)},${Math.round(170 + light * 80)},${0.55 + light * 0.45})`;
        context.lineWidth = 7 + light * 8;
        context.stroke();
        context.strokeStyle = `rgba(233,255,255,${light * 0.55})`;
        context.lineWidth = 1.1;
        context.stroke();
      }
    };

    const animate = (time: number) => {
      if (disposed) return;
      const delta = lastTime ? Math.min(time - lastTime, 40) : 16;
      lastTime = time;
      rotation += delta * 0.00013;
      tilt.x += (pointer.x - tilt.x) * 0.04;
      tilt.y += (pointer.y - tilt.y) * 0.04;
      draw();
      frame = requestAnimationFrame(animate);
    };

    const resume = () => {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (!paused && visible && !document.hidden)
        frame = requestAnimationFrame(animate);
      else draw();
    };

    const resize = new ResizeObserver((entries) => {
      const rectangle = entries[0].contentRect;
      width = rectangle.width;
      height = rectangle.height;
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        width < 500 ? 1.5 : 2,
      );
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw();
    });
    resize.observe(canvas);

    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      resume();
    });
    intersection.observe(canvas);

    const move = (event: PointerEvent) => {
      if (paused || event.pointerType === "touch") return;
      const rectangle = canvas.getBoundingClientRect();
      pointer.x =
        ((event.clientX - rectangle.left) / rectangle.width - 0.5) * 0.8;
      pointer.y =
        ((event.clientY - rectangle.top) / rectangle.height - 0.5) * 0.55;
    };
    const leave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", resume);
    resume();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [paused]);

  return (
    <canvas className="sculpture-canvas" ref={canvasRef} aria-hidden="true" />
  );
}
