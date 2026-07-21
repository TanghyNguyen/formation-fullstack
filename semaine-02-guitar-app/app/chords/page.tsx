import { Suspense } from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { fetchChordLibrary, fetchChordTypes, fetchDegreeStyles } from "@/lib/guitar-api";
import ChordsPageClient from "@/components/ChordsPageClient";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export default async function ChordsPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const presets = session?.user?.id
    ? await prisma.preset.findMany({
        where: { userId: session.user.id, type: "chord" },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const isLoggedIn = !!session?.user?.id;
  const [chordTypes, libraryGroups, degreeStyles] = await Promise.all([
    fetchChordTypes(locale),
    fetchChordLibrary(locale),
    fetchDegreeStyles(),
  ]);

  return (
    <Suspense
      fallback={
        <main className="w-full max-w-5xl mx-auto min-h-screen py-10 px-4">
          <p style={{ color: "var(--muted)" }}>{t(locale, "chords.loading")}</p>
        </main>
      }
    >
      <ChordsPageClient
        isLoggedIn={isLoggedIn}
        presets={presets}
        chordTypes={chordTypes}
        libraryGroups={libraryGroups}
        degreeStyles={degreeStyles}
        locale={locale}
      />
    </Suspense>
  );
}
