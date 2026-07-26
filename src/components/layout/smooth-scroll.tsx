"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.08,
      easing: (time: number) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    let frameId = 0;

    function raf(time: number) {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    }

    frameId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return null;
}
