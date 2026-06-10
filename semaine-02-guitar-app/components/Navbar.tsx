"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Gammes" },
    { href: "/chords", label: "Accords" },
  ];
  return (
    <nav
      className="px-6 py-0 flex h-15"
      style={{
        background: "var(--panel)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
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
    </nav>
  );
}
