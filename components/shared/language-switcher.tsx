"use client";

import { Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/shared/locale-provider";
import type { Locale } from "@/lib/i18n";

const NEXT_LOCALE: Record<Locale, Locale> = {
  th: "en",
  en: "th"
};

export function LanguageSwitcher() {
  const { locale, setLocale, messages } = useI18n();
  const nextLocale = NEXT_LOCALE[locale];

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 rounded-full border-[#d8b7a0] bg-background/80 px-3 text-xs font-semibold"
      onClick={() => setLocale(nextLocale)}
      aria-label={`${messages.localeSwitchLabel} / ${messages.localeName}`}
    >
      <Globe className="h-3.5 w-3.5" />
      {nextLocale.toUpperCase()}
    </Button>
  );
}
