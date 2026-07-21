"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  getLocaleSnapshot,
  subscribeLocale,
  type Locale,
} from "@/lib/locale";
import { useServerLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

export default function NavbarLinks() {
  const pathname = usePathname();
  const serverLocale = useServerLocale();
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    () => serverLocale,
  );
  const links = [
    { href: "/", label: t(locale, "nav.scales") },
    { href: "/chords", label: t(locale, "nav.chords") },
  ];
  return (
    <div className="flex">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center px-5 py-3 text-sm font-semibold transition-colors"
            style={{
              color: isActive ? "var(--accent)" : "var(--muted)",
              borderBottom: isActive
                ? "2px solid var(--accent)"
                : "2px solid transparent",
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
