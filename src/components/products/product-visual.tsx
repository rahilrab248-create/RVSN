import Image from "next/image";
import { cn } from "@/lib/utils";

type ProductVisualProps = {
  title: string;
  label?: string;
  colorway: string;
  imageUrl?: string;
  className?: string;
};

export function ProductVisual({ title, label, colorway, imageUrl, className }: ProductVisualProps) {
  return (
    <div className={cn("relative overflow-hidden bg-slate-950", className)}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <>
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-95", colorway)} />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2),transparent_34%,rgba(0,0,0,0.42)_72%)]" />
          <div className="absolute inset-x-8 bottom-8 top-8 border border-white/25" />
          <div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
          <div className="absolute left-1/2 top-8 h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-white/20" />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 translate-x-[-135%] skew-x-[-18deg] bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.08)_34%,rgba(255,255,255,0.72)_48%,rgba(215,255,47,0.24)_58%,transparent_72%)] opacity-0 transition duration-700 ease-out group-hover:translate-x-[135%] group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.22),transparent_38%)]" />
      {label ? (
        <div className="absolute bottom-5 left-5 right-5">
          <p className="inline-flex bg-white/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-950">
            {label}
          </p>
        </div>
      ) : null}
    </div>
  );
}
