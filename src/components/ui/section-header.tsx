type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-200">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-black text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-pretty text-sm leading-7 text-slate-300 sm:text-base">{description}</p>
    </div>
  );
}
