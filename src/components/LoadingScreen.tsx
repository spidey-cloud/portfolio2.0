import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete?: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [slidingUp, setSlidingUp] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDone(true);
      onComplete?.();
      return;
    }

    const DURATION = 4500; // ~3.5s moderate pace
    const start = performance.now();
    let frame = 0;
    let timer1: NodeJS.Timeout | number;
    let timer2: NodeJS.Timeout | number;
    let timer3: NodeJS.Timeout | number;

    function tick(now: number) {
      const elapsed = now - start;
      const progressFrac = Math.min(1, elapsed / DURATION);

      // Smooth ease-out deceleration curve towards 100%
      const easeProgress = 1 - Math.pow(1 - progressFrac, 1.35);
      const pct = Math.min(100, Math.floor(easeProgress * 100));

      setProgress(pct);

      if (pct < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        // Brief 300ms pause at 100% before curtain slide-up
        timer1 = setTimeout(() => {
          setSlidingUp(true);

          // Trigger hero reveal slightly after the curtain starts lifting
          timer2 = setTimeout(() => {
            onComplete?.();
          }, 200);

          // Unmount after curtain completely leaves viewport (900ms transition)
          timer3 = setTimeout(() => {
            setDone(true);
          }, 950);
        }, 300);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (done) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#fff",
        color: "#000",
        display: "grid",
        placeItems: "center",
        transform: slidingUp ? "translateY(-100%)" : "translateY(0%)",
        transition: "transform 900ms cubic-bezier(0.77, 0, 0.175, 1)",
        boxShadow: slidingUp ? "0 30px 60px rgba(0, 0, 0, 0.3)" : "none",
        pointerEvents: slidingUp ? "none" : "auto",
        willChange: "transform",
      }}
    >
      <img
        src="https://framerusercontent.com/assets/78ITT311ohCcKY3Dz62fo3Y0Q.png"
        alt=""
        width={450}
        height={450}
        style={{
          width: "min(80vw, 54vh, 450px)",
          height: "auto",
          transition: "opacity 300ms ease, transform 300ms ease",
          opacity: slidingUp ? 0.8 : 1,
          transform: slidingUp ? "scale(0.96)" : "scale(1)",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 24,
          bottom: 16,
          font: "400 clamp(64px, 14vw, 160px)/1 Arial, sans-serif",
          fontVariantNumeric: "tabular-nums",
          color: "#000",
        }}
      >
        {progress}
        <span style={{ fontSize: "0.3em" }}>%</span>
      </span>
    </div>
  );
}
