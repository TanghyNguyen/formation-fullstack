"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavbarLinks() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Gammes" },
    { href: "/chords", label: "Accords" },
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
