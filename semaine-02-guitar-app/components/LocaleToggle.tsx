"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  LOCALES,
  applyLocale,
  getLocaleSnapshot,
  subscribeLocale,
  type Locale,
} from "@/lib/locale";
import { useServerLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

export default function LocaleToggle() {
  const router = useRouter();
  const serverLocale = useServerLocale();
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    () => serverLocale,
  );

  function setLocale(next: Locale) {
    if (next === locale) return;
    applyLocale(next);
    router.refresh();
  }

  return (
    <div
      className="inline-flex rounded-md overflow-hidden"
      role="group"
      aria-label={t(locale, "locale.aria")}
      style={{ border: "1px solid var(--border-strong)" }}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className="text-xs font-semibold px-2.5 py-1.5 uppercase"
            style={{
              background: active ? "var(--accent)" : "var(--wood-dark)",
              color: active ? "#1a1208" : "var(--text)",
            }}
            aria-pressed={active}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
