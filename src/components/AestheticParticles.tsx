"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  targetAlpha: number;
}

export default function AestheticParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const colors = [
      "rgba(59, 130, 246,",  // Blue
      "rgba(139, 92, 246,", // Purple
      "rgba(236, 72, 153,",  // Pink
      "rgba(20, 184, 166,"   // Teal
    ];

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const initParticles = () => {
      particles = [];
      const count = Math.min(25, Math.floor((window.innerWidth * window.innerHeight) / 50000));
      for (let i = 0; i < count; i++) {
        const radius = Math.random() * 80 + 40; // Soft large glowing orbs
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0,
          targetAlpha: Math.random() * 0.12 + 0.04
        });
      }
    };

    const animate = () => {
      // Ease mouse position
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((p) => {
        // Soft fade-in on mount
        if (p.alpha < p.targetAlpha) {
          p.alpha += 0.005;
        }

        // Apply constant drifting velocity
        p.x += p.vx;
        p.y += p.vy;

        // Interactive mouse push/pull (gentle drift)
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 400) {
          const force = (400 - dist) / 4000;
          p.x -= dx * force * 0.1;
          p.y -= dy * force * 0.1;
        }

        // Boundary wrap-around with safety padding
        const pad = p.radius;
        if (p.x < -pad) p.x = window.innerWidth + pad;
        if (p.x > window.innerWidth + pad) p.x = -pad;
        if (p.y < -pad) p.y = window.innerHeight + pad;
        if (p.y > window.innerHeight + pad) p.y = -pad;

        // Draw soft glowing orb
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `${p.color}${p.alpha})`);
        gradient.addColorStop(0.5, `${p.color}${p.alpha * 0.3})`);
        gradient.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    window.addEventListener("resize", () => {
      resizeCanvas();
      initParticles();
    });

    window.addEventListener("mousemove", handleMouseMove);

    resizeCanvas();
    initParticles();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-80" />;
}
