"use client";

import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { countryCurrencies, defaultCountryCode, getCountryCurrency, type CountryCurrency } from "@/config/currency";

type CurrencyContextValue = {
  selectedCountry: CountryCurrency;
  suggestedCountry: CountryCurrency | null;
  countries: CountryCurrency[];
  hasStoredPreference: boolean;
  setCountryCode: (countryCode: string) => void;
  formatPrice: (usdValue: number) => string;
  convertFromUsd: (usdValue: number) => number;
};

export const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const storageKey = "fooltball-country-currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCodeState] = useState(defaultCountryCode);
  const [suggestedCountryCode, setSuggestedCountryCode] = useState<string | null>(null);
  const [hasStoredPreference, setHasStoredPreference] = useState(false);

  useEffect(() => {
    try {
      const storedCountryCode = window.localStorage.getItem(storageKey);

      if (storedCountryCode) {
        setCountryCodeState(getCountryCurrency(storedCountryCode).countryCode);
        setHasStoredPreference(true);
        return;
      }

      const detectedCountry = detectCountryFromBrowser();

      if (detectedCountry && detectedCountry !== defaultCountryCode) {
        setSuggestedCountryCode(detectedCountry);
      }
    } catch {
      setCountryCodeState(defaultCountryCode);
    }
  }, []);

  const selectedCountry = useMemo(() => getCountryCurrency(countryCode), [countryCode]);
  const suggestedCountry = useMemo(
    () => (suggestedCountryCode && !hasStoredPreference ? getCountryCurrency(suggestedCountryCode) : null),
    [hasStoredPreference, suggestedCountryCode],
  );

  const value = useMemo<CurrencyContextValue>(() => {
    function setCountryCode(nextCountryCode: string) {
      const nextCountry = getCountryCurrency(nextCountryCode);
      setCountryCodeState(nextCountry.countryCode);
      setHasStoredPreference(true);
      setSuggestedCountryCode(null);

      try {
        window.localStorage.setItem(storageKey, nextCountry.countryCode);
      } catch {
        // Local storage can be unavailable in private browsing modes.
      }
    }

    function convertFromUsd(usdValue: number) {
      return Math.max(0, usdValue) * selectedCountry.rateFromUsd;
    }

    function formatPrice(usdValue: number) {
      return new Intl.NumberFormat(selectedCountry.locale, {
        style: "currency",
        currency: selectedCountry.currencyCode,
        maximumFractionDigits: selectedCountry.currencyCode === "USD" ? 0 : 0,
      }).format(convertFromUsd(usdValue));
    }

    return {
      selectedCountry,
      suggestedCountry,
      countries: countryCurrencies,
      hasStoredPreference,
      setCountryCode,
      convertFromUsd,
      formatPrice,
    };
  }, [hasStoredPreference, selectedCountry, suggestedCountry]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

function detectCountryFromBrowser() {
  const locales = typeof navigator === "undefined" ? [] : [navigator.language, ...navigator.languages];

  for (const locale of locales) {
    const region = locale.split("-")[1]?.toUpperCase();

    if (region && countryCurrencies.some((country) => country.countryCode === region)) {
      return region;
    }
  }

  return null;
}
