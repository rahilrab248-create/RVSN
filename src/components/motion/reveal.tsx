"use client";

import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";

type RevealProps = ComponentPropsWithoutRef<typeof motion.div> & {
  delay?: number;
};

export function Reveal({ children, delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
