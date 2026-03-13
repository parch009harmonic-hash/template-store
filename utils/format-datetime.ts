export interface FormatDateTimeOptions {
  locale?: string;
  withTime?: boolean;
}

export function formatDateTime(
  value: string | number | Date,
  { locale = "th-TH", withTime = true }: FormatDateTimeOptions = {}
) {
  const date = new Date(value);
  const options: Intl.DateTimeFormatOptions = withTime
    ? {
        dateStyle: "medium",
        timeStyle: "short"
      }
    : {
        dateStyle: "medium"
      };

  return new Intl.DateTimeFormat(locale, options).format(date);
}
