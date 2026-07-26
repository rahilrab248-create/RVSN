export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.22),transparent_32rem),#000] text-white">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 backdrop-blur-xl">
        <span className="size-2.5 animate-pulse rounded-full bg-violet-200 shadow-[0_0_22px_rgba(196,181,253,0.72)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-50/72">Loading</span>
      </div>
    </div>
  );
}
