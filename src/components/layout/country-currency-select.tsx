"use client";

import { CustomSelect } from "@/components/ui/custom-select";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

type CountryCurrencySelectProps = {
  isHome?: boolean;
  compact?: boolean;
  className?: string;
};

export function CountryCurrencySelect({ isHome = false, compact = false, className }: CountryCurrencySelectProps) {
  const { countries, selectedCountry, suggestedCountry, setCountryCode } = useCurrency();
  const showSuggestion = suggestedCountry && suggestedCountry.countryCode !== selectedCountry.countryCode;

  return (
    <div className={cn("relative grid gap-1.5", compact ? "w-full" : "w-52", className)}>
      <CustomSelect
        value={selectedCountry.countryCode}
        options={countries.map((country) => ({
          value: country.countryCode,
          label: compact
            ? `${country.flag} ${country.countryName} / ${country.currencyCode}`
            : `${country.flag} ${country.countryCode} / ${country.currencyCode}`,
        }))}
        onChange={setCountryCode}
        toneClassName={cn(
          "h-10 px-3 text-xs",
          isHome
            ? "border-white/30 bg-white/15 !text-white shadow-none hover:border-white hover:bg-white/25 focus:border-white focus:ring-white/15 [&>svg]:text-white"
            : "border-slate-200 bg-slate-50 text-slate-950",
        )}
      />
      {showSuggestion ? (
        <button
          type="button"
          onClick={() => setCountryCode(suggestedCountry.countryCode)}
          className={cn(
            "text-left text-[10px] font-black uppercase tracking-[0.12em] transition",
            isHome ? "text-white/80 hover:text-lime-200" : "text-slate-500 hover:text-slate-950",
          )}
        >
          Use {suggestedCountry.flag} {suggestedCountry.countryName}
        </button>
      ) : null}
    </div>
  );
}
