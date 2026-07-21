import { auth } from "@/auth";
import { signInWithGoogle, signOutAction } from "@/app/actions/auth";
import NavbarLinks from "@/components/NavbarLinks";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleToggle from "@/components/LocaleToggle";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export default async function Navbar() {
  const session = await auth();
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <nav
      className="px-6 py-0 flex h-15 items-center justify-between"
      style={{
        background: "var(--panel)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <NavbarLinks />
      <div className="flex items-center gap-3 shrink-0">
        <LocaleToggle />
        <ThemeToggle />
        {session?.user ? (
          <>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--muted)" }}
            >
              {session.user.name}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
                style={{
                  color: "var(--accent)",
                  border: "1px solid var(--border-strong)",
                }}
              >
                {t(locale, "nav.signOut")}
              </button>
            </form>
          </>
        ) : (
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
              style={{
                color: "var(--accent)",
                border: "1px solid var(--border-strong)",
              }}
            >
              {t(locale, "nav.signIn")}
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}
