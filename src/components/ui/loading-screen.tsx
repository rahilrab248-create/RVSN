"use client";

import { useEffect, useState, type CSSProperties } from "react";

export function LoadingScreen() {
  const [count, setCount] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("ft-loader-seen") === "true") {
      return;
    }

    setShouldRender(true);
    const timer = window.setInterval(() => {
      setCount((value) => {
        const nextValue = Math.min(value + Math.ceil((100 - value) / 9), 100);

        if (nextValue >= 100) {
          window.clearInterval(timer);
          window.sessionStorage.setItem("ft-loader-seen", "true");
          window.setTimeout(() => setIsHidden(true), 420);
        }

        return nextValue;
      });
    }, 34);

    return () => window.clearInterval(timer);
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={isHidden ? "aww-loader is-hidden" : "aww-loader"}
      style={
        {
          "--loader-fill": `${count}%`,
          "--loader-mark-y": `${count * -0.08}px`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span>{count}%</span>
      <strong>RVSN</strong>
    </div>
  );
}
