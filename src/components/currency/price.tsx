"use client";

import { useCurrency } from "@/hooks/use-currency";

type PriceProps = {
  value: number;
  className?: string;
};

export function Price({ value, className }: PriceProps) {
  const { formatPrice } = useCurrency();

  return <span className={className}>{formatPrice(value)}</span>;
}
