export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#070a0f] text-white">
      <div className="flex items-center gap-3">
        <span className="size-3 animate-pulse rounded-full bg-lime-300" />
        <span className="font-mono text-xs uppercase tracking-[0.28em] text-slate-300">Loading matchday</span>
      </div>
    </div>
  );
}
