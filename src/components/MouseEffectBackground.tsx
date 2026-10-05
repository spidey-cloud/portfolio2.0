"use client";

import { useEffect, useRef, useState } from "react";

export default function MouseEffectBackground({
  dotSize = 2,
  dotSpacing = 32,
  repulsionRadius = 120,
  repulsionStrength = 30,
}: {
  dotSize?: number;
  dotSpacing?: number;
  repulsionRadius?: number;
  repulsionStrength?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initDots();
    };
    window.addEventListener("resize", handleResize);

    let dots: any[] = [];
    
    const initDots = () => {
      dots = [];
      const cols = Math.ceil(width / dotSpacing);
      const rows = Math.ceil(height / dotSpacing);
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
          const x = col * dotSpacing;
          const y = row * dotSpacing;

          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const edgeFactor = Math.min(dist / (maxDistance * 0.7), 1);

          if (Math.random() > edgeFactor) continue;

          const pattern = (row + col) % 3;
          const baseOpacities = [0.1, 0.2, 0.3];
          const opacity = baseOpacities[pattern] * edgeFactor;

          dots.push({
            baseX: x,
            baseY: y,
            x: x,
            y: y,
            baseOpacity: opacity,
            pulseOffset: Math.random() * Math.PI * 2,
            vx: 0,
            vy: 0
          });
        }
      }
    };
    initDots();

    let animationFrameId: number;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      ctx.fillStyle = "rgba(161, 161, 170, 1)"; // zinc-400 color

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        
        // Repulsion physics
        const dx = dot.baseX - mouseX;
        const dy = dot.baseY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = dot.baseX;
        let targetY = dot.baseY;

        if (dist < repulsionRadius) {
          const force = (1 - dist / repulsionRadius) * repulsionStrength;
          const angle = Math.atan2(dy, dx);
          targetX += Math.cos(angle) * force;
          targetY += Math.sin(angle) * force;
        }

        // Spring physics interpolation
        dot.vx += (targetX - dot.x) * 0.1;
        dot.vy += (targetY - dot.y) * 0.1;
        dot.vx *= 0.7; // damping
        dot.vy *= 0.7;
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Opacity pulse + proximity boost
        const minOp = Math.max(dot.baseOpacity * 0.5, 0.3);
        const maxOp = Math.min(dot.baseOpacity * 1.5, 1);
        let currentOp = minOp + (maxOp - minOp) * (Math.sin(time + dot.pulseOffset) * 0.5 + 0.5);

        if (dist < repulsionRadius * 1.2) {
          const proximityFactor = 1 - dist / (repulsionRadius * 1.2);
          currentOp = Math.min(currentOp + proximityFactor * 0.8, 1);
        }

        ctx.globalAlpha = currentOp;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dotSpacing, dotSize, repulsionRadius, repulsionStrength, isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
