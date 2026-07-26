"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type CustomSelectOption = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  label?: string;
  value: string;
  options: CustomSelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  toneClassName?: string;
};

export function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select option",
  disabled = false,
  className,
  toneClassName,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [openDirection, setOpenDirection] = useState<"down" | "up">("down");
  const [menuMaxHeight, setMenuMaxHeight] = useState(256);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0, width: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function chooseOption(nextValue: string) {
    onChange?.(nextValue);
    setIsOpen(false);
  }

  const updateMenuPlacement = useCallback(() => {
    if (!rootRef.current) {
      return;
    }

    const rect = rootRef.current.getBoundingClientRect();
    const viewportPadding = 18;
    const menuGap = 8;
    const preferredMenuHeight = Math.min(320, options.length * 48 + 16);
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const nextDirection = spaceBelow < preferredMenuHeight && spaceAbove > spaceBelow ? "up" : "down";
    const availableSpace = nextDirection === "up" ? spaceAbove : spaceBelow;
    const nextMenuMaxHeight = Math.max(168, Math.min(preferredMenuHeight, availableSpace));

    setOpenDirection(nextDirection);
    setMenuMaxHeight(nextMenuMaxHeight);
    setMenuPosition({
      left: Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - rect.width - viewportPadding)),
      top:
        nextDirection === "up"
          ? Math.max(viewportPadding, rect.top - nextMenuMaxHeight - menuGap)
          : Math.min(window.innerHeight - viewportPadding - nextMenuMaxHeight, rect.bottom + menuGap),
      width: rect.width,
    });
  }, [options.length]);

  function toggleOpen() {
    if (!isOpen) {
      updateMenuPlacement();
    }

    setIsOpen((current) => !current);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateMenuPlacement();
    window.addEventListener("resize", updateMenuPlacement);
    window.addEventListener("scroll", updateMenuPlacement, true);

    return () => {
      window.removeEventListener("resize", updateMenuPlacement);
      window.removeEventListener("scroll", updateMenuPlacement, true);
    };
  }, [isOpen, updateMenuPlacement]);

  return (
    <div ref={rootRef} className={cn("relative grid gap-2", className)}>
      {label ? <span className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-100/50">{label}</span> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 rounded-full border border-white/10 bg-black/35 px-4 text-left text-sm font-black text-white shadow-sm outline-none transition hover:border-violet-300/50 hover:shadow-md focus:border-violet-300 focus:ring-4 focus:ring-violet-300/15 disabled:cursor-default disabled:opacity-100",
          isOpen && "border-violet-300 ring-4 ring-violet-300/15",
          toneClassName,
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={cn("truncate", !selectedOption && "text-violet-100/40")}>{selectedOption?.label ?? placeholder}</span>
        <ChevronDown className={cn("shrink-0 text-violet-100/55 transition", isOpen && "rotate-180")} size={18} />
      </button>

      {isMounted
        ? createPortal(
            <AnimatePresence>
              {isOpen && !disabled ? (
          <motion.div
            ref={menuRef}
            initial={{ height: 0, opacity: 0, y: openDirection === "up" ? 8 : -8, scale: 0.985 }}
            animate={{ height: "auto", opacity: 1, y: 0, scale: 1 }}
            exit={{ height: 0, opacity: 0, y: openDirection === "up" ? 8 : -8, scale: 0.985 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[999] overflow-hidden rounded-[24px] border border-violet-200/24 bg-[#08040f]/96 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            style={{ left: menuPosition.left, top: menuPosition.top, width: menuPosition.width }}
            role="listbox"
          >
            <div
              data-lenis-prevent
              className="overflow-y-auto overscroll-contain p-2"
              style={{ maxHeight: menuMaxHeight }}
            >
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => chooseOption(option.value)}
                    className={cn(
                      "flex min-h-11 w-full items-center justify-between gap-3 rounded-[18px] px-3.5 text-left text-sm font-bold text-violet-100/68 transition hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none",
                      isSelected && "bg-violet-300 text-black shadow-[0_10px_24px_rgba(196,181,253,0.18)] hover:bg-violet-300 hover:text-black",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? <Check size={16} /> : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
