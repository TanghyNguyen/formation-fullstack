import { auth } from "@/auth";
import { signInWithGoogle, signOutAction } from "@/app/actions/auth";
import NavbarLinks from "@/components/NavbarLinks";

export default async function Navbar() {
  const session = await auth();
  return (
    <nav
      className="px-6 py-0 flex h-15 items-center justify-between"
      style={{
        background: "var(--panel)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <NavbarLinks />
      {session?.user ? (
        <div className="flex items-center gap-3 shrink-0">
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
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Se déconnecter
            </button>
          </form>
        </div>
      ) : (
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
            style={{
              color: "var(--accent)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            Se connecter
          </button>
        </form>
      )}
    </nav>
  );
}
