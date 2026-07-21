export type Locale = "fr" | "en";

export const LOCALE_COOKIE = "locale";
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALES: readonly Locale[] = ["fr", "en"] as const;

export function parseLocale(value: string | null | undefined): Locale {
  return value === "en" || value === "fr" ? value : DEFAULT_LOCALE;
}

function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
  if (!match) return null;
  return parseLocale(decodeURIComponent(match.split("=")[1] ?? ""));
}

/** Écrit le cookie + `lang` sur <html> (client uniquement). */
export function applyLocale(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
  try {
    localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener());
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeLocale(onStoreChange: Listener): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getLocaleSnapshot(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const fromHtml = document.documentElement.lang;
  if (fromHtml === "fr" || fromHtml === "en") return fromHtml;
  const fromCookie = readLocaleCookie();
  if (fromCookie) return fromCookie;
  try {
    return parseLocale(localStorage.getItem(LOCALE_COOKIE));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function getServerLocaleSnapshot(): Locale {
  return DEFAULT_LOCALE;
}
