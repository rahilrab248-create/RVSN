"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
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

  return (
    <div ref={rootRef} className={cn("relative grid gap-2", className)}>
      {label ? <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</span> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 border border-slate-200 bg-white px-4 text-left text-sm font-black text-slate-950 shadow-sm outline-none transition hover:border-lime-400 hover:shadow-md focus:border-lime-500 focus:ring-4 focus:ring-lime-200/60 disabled:cursor-default disabled:opacity-100",
          isOpen && "border-lime-500 ring-4 ring-lime-200/60",
          toneClassName,
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={cn("truncate", !selectedOption && "text-slate-400")}>{selectedOption?.label ?? placeholder}</span>
        <ChevronDown className={cn("shrink-0 text-slate-500 transition", isOpen && "rotate-180")} size={18} />
      </button>

      <AnimatePresence>
        {isOpen && !disabled ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-950/15"
            role="listbox"
          >
            <div className="max-h-72 overflow-y-auto p-1.5">
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
                      "flex min-h-10 w-full items-center justify-between gap-3 px-3 text-left text-sm font-bold text-slate-700 transition hover:bg-lime-100 hover:text-slate-950",
                      isSelected && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
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
      </AnimatePresence>
    </div>
  );
}
