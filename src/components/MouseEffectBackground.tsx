"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";

const SPRING_CONFIG = { stiffness: 300, damping: 30, mass: 0.5 };
const OPACITY_DURATION_BASE = 0.8;
const OPACITY_DURATION_VARIATION = 0.2;
const OPACITY_EASE = [0.4, 0, 0.2, 1] as const;
const OPACITY_DELAY_CYCLE = 1.5;
const OPACITY_DELAY_STEP = 0.02;
const MIN_OPACITY_MULTIPLIER = 0.5;
const MAX_OPACITY_MULTIPLIER = 1.5;
const MIN_OPACITY_FALLBACK = 0.3;
const PROXIMITY_MULTIPLIER = 1.2;
const PROXIMITY_OPACITY_BOOST = 0.8;

interface Dot {
  id: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  opacity: number;
}

interface DotComponentProps {
  dot: Dot;
  index: number;
  dotSize: number;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  repulsionRadius: number;
  repulsionStrength: number;
  isMobile: boolean;
}

function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

function generateDots(width: number, height: number, spacing: number): Dot[] {
  const dots: Dot[] = [];
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const x = col * spacing;
      const y = row * spacing;

      // Calculate distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Calculate edge factor (0 at edges, 1 at center)
      const edgeFactor = Math.min(distanceFromCenter / (maxDistance * 0.7), 1);

      // Skip dots near edges with probability based on distance
      if (Math.random() > edgeFactor) {
        continue;
      }

      const pattern = (row + col) % 3;
      const baseOpacities = [0.1, 0.2, 0.3]; // Lowered global background opacity
      const opacity = baseOpacities[pattern] * edgeFactor;

      dots.push({
        id: `dot-${row}-${col}`,
        x,
        y,
        baseX: x,
        baseY: y,
        opacity,
      });
    }
  }

  return dots;
}

function DotComponent({
  dot,
  index,
  dotSize,
  mouseX,
  mouseY,
  repulsionRadius,
  repulsionStrength,
  isMobile,
}: DotComponentProps) {
  const posX = useTransform([mouseX, mouseY], () => {
    if (isMobile) return 0;
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) {
      return 0;
    }

    const dx = dot.baseX - mx;
    const dy = dot.baseY - my;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < repulsionRadius) {
      const force = (1 - distance / repulsionRadius) * repulsionStrength;
      const angle = Math.atan2(dy, dx);
      return Math.cos(angle) * force;
    }

    return 0;
  });

  const posY = useTransform([mouseX, mouseY], () => {
    if (isMobile) return 0;
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) {
      return 0;
    }

    const dx = dot.baseX - mx;
    const dy = dot.baseY - my;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < repulsionRadius) {
      const force = (1 - distance / repulsionRadius) * repulsionStrength;
      const angle = Math.atan2(dy, dx);
      return Math.sin(angle) * force;
    }

    return 0;
  });

  const opacityBoost = useTransform([mouseX, mouseY], () => {
    if (isMobile) return 0;
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) return 0;

    const distance = calculateDistance(dot.baseX, dot.baseY, mx, my);
    const maxDistance = repulsionRadius * PROXIMITY_MULTIPLIER;

    if (distance < maxDistance) {
      const proximityFactor = 1 - distance / maxDistance;
      return proximityFactor * PROXIMITY_OPACITY_BOOST;
    }

    return 0;
  });

  const x = useSpring(posX, SPRING_CONFIG);
  const y = useSpring(posY, SPRING_CONFIG);

  const baseMinOpacity = Math.max(
    dot.opacity * MIN_OPACITY_MULTIPLIER,
    MIN_OPACITY_FALLBACK
  );
  const baseMaxOpacity = Math.min(dot.opacity * MAX_OPACITY_MULTIPLIER, 1);

  const minOpacityWithBoost = useTransform(opacityBoost, (boost) =>
    Math.min(baseMinOpacity + boost, 1)
  );

  const delay = (index * OPACITY_DELAY_STEP) % OPACITY_DELAY_CYCLE;

  return (
    <motion.div
      animate={{
        opacity: [baseMinOpacity, baseMaxOpacity, baseMinOpacity],
      }}
      className="absolute rounded-full bg-zinc-400 will-change-transform dark:bg-zinc-600"
      initial={{ opacity: baseMinOpacity }}
      style={{
        width: dotSize,
        height: dotSize,
        left: dot.baseX,
        top: dot.baseY,
        x,
        y,
        opacity: useSpring(minOpacityWithBoost, {
          stiffness: 150,
          damping: 25,
        }),
      }}
      transition={{
        opacity: {
          duration:
            OPACITY_DURATION_BASE + (index % 4) * OPACITY_DURATION_VARIATION,
          repeat: Number.POSITIVE_INFINITY,
          ease: OPACITY_EASE,
          delay,
          times: [0, 0.5, 1],
        },
      }}
    />
  );
}

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
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const mouseY = useMotionValue(Number.POSITIVE_INFINITY);
  const [dots, setDots] = useState<Dot[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let timeoutId: number;
    const updateDots = () => {
      // Debounce the dot regeneration slightly for performance during resize
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setDots(generateDots(window.innerWidth, window.innerHeight, dotSpacing));
      }, 100);
    };

    updateDots();
    window.addEventListener("resize", updateDots);

    return () => {
      window.removeEventListener("resize", updateDots);
      clearTimeout(timeoutId);
    };
  }, [dotSpacing]);

  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => {
      mouseX.set(Number.POSITIVE_INFINITY);
      mouseY.set(Number.POSITIVE_INFINITY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isMobile, mouseX, mouseY]);

  if (isMobile) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {dots.map((dot, index) => (
        <DotComponent
          dot={dot}
          dotSize={dotSize}
          index={index}
          key={dot.id}
          mouseX={mouseX}
          mouseY={mouseY}
          repulsionRadius={repulsionRadius}
          repulsionStrength={repulsionStrength}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}
