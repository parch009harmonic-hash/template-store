export interface FormatCurrencyOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatCurrency(
  amount: number,
  {
    locale = "th-TH",
    currency = "THB",
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  }: FormatCurrencyOptions = {}
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(amount);
}
