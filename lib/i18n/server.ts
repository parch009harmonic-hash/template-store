import "server-only";

import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, getMessages, isLocale, type Locale } from "@/lib/i18n/messages";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(localeValue) ? localeValue : DEFAULT_LOCALE;
}

export async function getServerI18n() {
  const locale = await getServerLocale();
  return {
    locale,
    messages: getMessages(locale)
  };
}
