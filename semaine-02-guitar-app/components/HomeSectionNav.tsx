"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";

type HomeSectionNavProps = {
  locale: Locale;
  showMyProgressions: boolean;
  showMyPresets: boolean;
};

function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  try {
    history.replaceState(null, "", `#${id}`);
  } catch {
    // ignore
  }
}

export default function HomeSectionNav({
  locale,
  showMyProgressions,
  showMyPresets,
}: HomeSectionNavProps) {
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    const target = document.getElementById("fretboard");
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Fully visible → hide FAB; otherwise show.
        setShowFab((entry?.intersectionRatio ?? 1) < 1);
      },
      { threshold: 1 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const links: { id: string; label: string; show: boolean }[] = [
    {
      id: "harmonization",
      label: t(locale, "home.nav.harmonization"),
      show: true,
    },
    {
      id: "ai-progressions",
      label: t(locale, "home.nav.aiProgressions"),
      show: true,
    },
    {
      id: "my-progressions",
      label: t(locale, "home.myProgressions"),
      show: showMyProgressions,
    },
    {
      id: "my-presets",
      label: t(locale, "home.myPresets"),
      show: showMyPresets,
    },
  ];

  return (
    <>
      <nav
        className="mt-4 mb-2 flex flex-wrap gap-2"
        aria-label={t(locale, "home.nav.label")}
      >
        {links
          .filter((link) => link.show)
          .map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToId(link.id)}
              className="text-sm px-3 py-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
              style={{
                color: "var(--muted)",
                border: "1px solid var(--border-strong)",
                background: "transparent",
              }}
            >
              {link.label}
            </button>
          ))}
      </nav>

      {showFab ? (
        <button
          type="button"
          onClick={() => scrollToId("fretboard")}
          aria-label={t(locale, "home.backToFretboard")}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full text-sm font-semibold w-11 h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          style={{
            opacity: 0.75,
            background: "var(--panel)",
            color: "var(--text)",
            border: "1px solid var(--border-strong)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          ↑
        </button>
      ) : null}
    </>
  );
}
