"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  LOCALE_COOKIE_NAME,
  DEFAULT_LOCALE,
  getMessages,
  isLocale,
  type Locale,
  type Messages
} from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  initialLocale: Locale;
  children: ReactNode;
}

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function LocaleProvider({ initialLocale, children }: LocaleProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) return;
      setLocaleState(nextLocale);
      document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
      router.refresh();
    },
    [locale, router]
  );

  const value = useMemo(
    () => ({
      locale,
      messages: getMessages(locale),
      setLocale
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const context = useContext(LocaleContext);
  if (context) return context;

  return {
    locale: DEFAULT_LOCALE,
    messages: getMessages(DEFAULT_LOCALE),
    setLocale: () => {
      // no-op fallback outside provider
    }
  };
}
