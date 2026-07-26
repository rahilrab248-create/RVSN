type AuthFormMessageProps = {
  type: "error" | "success";
  message: string;
};

export function AuthFormMessage({ type, message }: AuthFormMessageProps) {
  return (
    <div
      className={
        type === "error"
          ? "rounded-[16px] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
          : "rounded-[16px] border border-violet-200/30 bg-violet-300/10 px-4 py-3 text-sm text-violet-100"
      }
    >
      {message}
    </div>
  );
}
