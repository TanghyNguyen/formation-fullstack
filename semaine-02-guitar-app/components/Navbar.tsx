import { auth } from "@/auth";
import { signInWithGoogle, signOutAction } from "@/app/actions/auth";
import NavbarLinks from "@/components/NavbarLinks";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Navbar() {
  const session = await auth();
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
                Se déconnecter
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
              Se connecter
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}
