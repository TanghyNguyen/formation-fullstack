export type Theme = "dark" | "light";

export const THEME_COOKIE = "theme";
export const DEFAULT_THEME: Theme = "dark";

export function parseTheme(value: string | null | undefined): Theme {
  return value === "light" || value === "dark" ? value : DEFAULT_THEME;
}

/** Écrit le cookie + `data-theme` (client uniquement). */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${maxAge}; SameSite=Lax`;
  try {
    localStorage.setItem(THEME_COOKIE, theme);
  } catch {
    // ignore private mode / blocked storage
  }
}

/** Migre l’ancien localStorage vers le cookie si besoin (client). */
export function migrateThemeFromLocalStorage(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;

  const fromAttr = document.documentElement.dataset.theme;
  if (fromAttr === "light" || fromAttr === "dark") {
    return fromAttr;
  }

  try {
    const stored = localStorage.getItem(THEME_COOKIE);
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
      return stored;
    }
  } catch {
    // ignore
  }

  applyTheme(DEFAULT_THEME);
  return DEFAULT_THEME;
}
