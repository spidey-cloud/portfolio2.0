import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDone(true);
      return;
    }
    const start = performance.now();
    let frame = 0;
    let timer: NodeJS.Timeout | number;

    function tick(now: number) {
      const pct = Math.min(100, Math.floor((now - start) / 30));
      setProgress(pct);
      if (pct < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        timer = setTimeout(() => setDone(true), 450);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

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
        opacity: progress === 100 ? 0 : 1,
        transition: "opacity 450ms ease",
        pointerEvents: progress === 100 ? "none" : "auto",
      }}
    >
      <img
        src="https://framerusercontent.com/assets/78ITT311ohCcKY3Dz62fo3Y0Q.png"
        alt=""
        width={450}
        height={450}
        style={{ width: "min(80vw, 54vh, 450px)", height: "auto" }}
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
