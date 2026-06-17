export type CountryCurrency = {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  locale: string;
  rateFromUsd: number;
  flag: string;
};

export const defaultCountryCode = "US";

export const countryCurrencies: CountryCurrency[] = [
  { countryCode: "US", countryName: "United States", currencyCode: "USD", locale: "en-US", rateFromUsd: 1, flag: "\u{1F1FA}\u{1F1F8}" },
  { countryCode: "IN", countryName: "India", currencyCode: "INR", locale: "en-IN", rateFromUsd: 95.341177, flag: "\u{1F1EE}\u{1F1F3}" },
  { countryCode: "LK", countryName: "Sri Lanka", currencyCode: "LKR", locale: "en-LK", rateFromUsd: 331.567328, flag: "\u{1F1F1}\u{1F1F0}" },
  { countryCode: "AE", countryName: "United Arab Emirates", currencyCode: "AED", locale: "en-AE", rateFromUsd: 3.6725, flag: "\u{1F1E6}\u{1F1EA}" },
  { countryCode: "SA", countryName: "Saudi Arabia", currencyCode: "SAR", locale: "en-SA", rateFromUsd: 3.75, flag: "\u{1F1F8}\u{1F1E6}" },
  { countryCode: "GB", countryName: "United Kingdom", currencyCode: "GBP", locale: "en-GB", rateFromUsd: 0.742781, flag: "\u{1F1EC}\u{1F1E7}" },
  { countryCode: "DE", countryName: "Germany", currencyCode: "EUR", locale: "de-DE", rateFromUsd: 0.859836, flag: "\u{1F1E9}\u{1F1EA}" },
  { countryCode: "PK", countryName: "Pakistan", currencyCode: "PKR", locale: "en-PK", rateFromUsd: 278.7907, flag: "\u{1F1F5}\u{1F1F0}" },
  { countryCode: "BD", countryName: "Bangladesh", currencyCode: "BDT", locale: "en-BD", rateFromUsd: 122.785751, flag: "\u{1F1E7}\u{1F1E9}" },
  { countryCode: "NP", countryName: "Nepal", currencyCode: "NPR", locale: "en-NP", rateFromUsd: 152.54505, flag: "\u{1F1F3}\u{1F1F5}" },
  { countryCode: "CA", countryName: "Canada", currencyCode: "CAD", locale: "en-CA", rateFromUsd: 1.383781, flag: "\u{1F1E8}\u{1F1E6}" },
  { countryCode: "AU", countryName: "Australia", currencyCode: "AUD", locale: "en-AU", rateFromUsd: 1.393663, flag: "\u{1F1E6}\u{1F1FA}" },
];

export function getCountryCurrency(countryCode: string) {
  return countryCurrencies.find((country) => country.countryCode === countryCode) ?? countryCurrencies[0];
}
