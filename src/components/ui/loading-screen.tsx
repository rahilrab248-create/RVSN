export function LoadingScreen() {
  return (
    <div className="loading-screen-fallback pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[#070a0f]">
      <div className="grid place-items-center gap-5">
        <div className="loading-ball relative size-20 rounded-full border border-lime-300/25">
          <span className="absolute left-1/2 top-0 size-3 -translate-x-1/2 rounded-full bg-lime-300 shadow-[0_0_24px_rgba(215,255,47,0.85)]" />
          <span className="absolute inset-4 rounded-full border border-white/10" />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-300">Preparing pitch</p>
      </div>
    </div>
  );
}
