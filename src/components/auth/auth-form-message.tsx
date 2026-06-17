type AuthFormMessageProps = {
  type: "error" | "success";
  message: string;
};

export function AuthFormMessage({ type, message }: AuthFormMessageProps) {
  return (
    <div
      className={
        type === "error"
          ? "border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
          : "border border-lime-300/30 bg-lime-300/10 px-4 py-3 text-sm text-lime-100"
      }
    >
      {message}
    </div>
  );
}
