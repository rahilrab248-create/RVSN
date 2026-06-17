import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type AuthSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading: boolean;
};

export function AuthSubmitButton({ children, isLoading, disabled, ...props }: AuthSubmitButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className="inline-flex h-12 w-full items-center justify-center gap-2 bg-lime-300 px-5 text-sm font-extrabold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
      {children}
    </button>
  );
}
