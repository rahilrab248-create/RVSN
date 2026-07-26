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
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-black shadow-[0_18px_45px_rgba(124,58,237,0.24)] transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
      {children}
    </button>
  );
}
