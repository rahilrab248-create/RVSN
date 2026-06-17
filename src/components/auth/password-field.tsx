"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordFieldProps = {
  name: string;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
};

export function PasswordField({ name, placeholder, autoComplete, minLength = 8 }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={name}>
        {placeholder}
      </label>
      <input
        id={name}
        required
        minLength={minLength}
        name={name}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-12 w-full border border-slate-200 bg-white px-4 pr-14 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-slate-950"
      />
      <button
        type="button"
        onClick={() => setIsVisible((value) => !value)}
        className="absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center bg-transparent text-slate-500 transition hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-lime-300 dark:text-slate-200"
        aria-label={isVisible ? `Hide ${placeholder.toLowerCase()}` : `Show ${placeholder.toLowerCase()}`}
        aria-pressed={isVisible}
      >
        {isVisible ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
  );
}
