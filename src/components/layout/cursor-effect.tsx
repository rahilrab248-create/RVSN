"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function CursorEffect() {
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isInteractiveHover, setIsInteractiveHover] = useState(false);
  const [isInsidePage, setIsInsidePage] = useState(false);
  const pathname = usePathname();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 180, damping: 26, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 180, damping: 26, mass: 0.5 });

  useEffect(() => {
    setIsFinePointer(window.matchMedia("(pointer: fine)").matches);

    function moveCursor(event: PointerEvent) {
      x.set(event.clientX - 80);
      y.set(event.clientY - 80);
      setIsInsidePage(true);
      const interactiveElement = (event.target as Element | null)?.closest<HTMLElement>(interactiveHoverSelector);
      setIsInteractiveHover(Boolean(interactiveElement));
    }

    function hideCursor() {
      setIsInsidePage(false);
    }

    window.addEventListener("pointermove", moveCursor);
    window.addEventListener("pointerleave", hideCursor);
    document.addEventListener("mouseleave", hideCursor);
    window.addEventListener("blur", hideCursor);

    return () => {
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("pointerleave", hideCursor);
      document.removeEventListener("mouseleave", hideCursor);
      window.removeEventListener("blur", hideCursor);
    };
  }, [x, y]);

  if (!isFinePointer || pathname !== "/") {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] hidden size-44 rounded-full border border-white/35 bg-[radial-gradient(circle,rgba(255,255,255,0.72),rgba(215,255,47,0.28)_28%,rgba(56,189,248,0.18)_52%,transparent_74%)] mix-blend-screen shadow-[0_0_48px_rgba(255,255,255,0.32)] backdrop-blur-[1px] lg:block"
      style={{ x: springX, y: springY }}
      animate={{
        opacity: isInsidePage && !isInteractiveHover ? 1 : 0,
        scale: isInsidePage && !isInteractiveHover ? 1 : 0.65,
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    />
  );
}

const interactiveHoverSelector = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "p",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "[data-text-hover]",
].join(",");
