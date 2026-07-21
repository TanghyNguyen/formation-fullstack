"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  applyTheme,
  migrateThemeFromLocalStorage,
  type Theme,
} from "@/lib/theme";
import {
  getLocaleSnapshot,
  subscribeLocale,
} from "@/lib/locale";
import { useServerLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const serverLocale = useServerLocale();
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    () => serverLocale,
  );

  useEffect(() => {
    setTheme(migrateThemeFromLocalStorage());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const isDark = theme === "dark";
  const bulbOn = !isDark;

  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="text-xl leading-none select-none transition-[opacity,filter,text-shadow] duration-200"
        style={{
          opacity: bulbOn ? 1 : 0.35,
          filter: bulbOn ? "none" : "grayscale(1)",
          textShadow: bulbOn
            ? "0 0 8px rgba(232, 165, 75, 0.85), 0 0 2px rgba(255, 220, 120, 0.9)"
            : "none",
        }}
        title={bulbOn ? t(locale, "theme.bulbOn") : t(locale, "theme.bulbOff")}
      >
        💡
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={
          isDark ? t(locale, "theme.ariaDark") : t(locale, "theme.ariaLight")
        }
        title={
          isDark ? t(locale, "theme.titleDark") : t(locale, "theme.titleLight")
        }
        onClick={toggle}
        className="relative inline-flex h-7 w-11 shrink-0 items-center rounded-md transition-colors"
        style={{
          background: "var(--wood-dark)",
          border: "1px solid var(--border-strong)",
        }}
      >
        <span
          className="pointer-events-none absolute h-5 w-5 rounded-sm transition-transform duration-200 ease-out"
          style={{
            background: "var(--accent)",
            transform: isDark ? "translateX(18px)" : "translateX(3px)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
          }}
        />
      </button>
    </div>
  );
}
