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
        className="h-12 w-full rounded-[18px] border border-white/12 bg-white/8 px-4 pr-14 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/45 focus:border-violet-200 focus:ring-4 focus:ring-violet-300/10"
      />
      <button
        type="button"
        onClick={() => setIsVisible((value) => !value)}
        className="absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-transparent text-violet-100/62 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-300/40"
        aria-label={isVisible ? `Hide ${placeholder.toLowerCase()}` : `Show ${placeholder.toLowerCase()}`}
        aria-pressed={isVisible}
      >
        {isVisible ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
  );
}
