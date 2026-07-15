import { Suspense } from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { fetchChordLibrary, fetchChordTypes, fetchDegreeStyles } from "@/lib/guitar-api";
import ChordsPageClient from "@/components/ChordsPageClient";

export default async function ChordsPage() {
  const session = await auth();
  const presets = session?.user?.id
    ? await prisma.preset.findMany({
        where: { userId: session.user.id, type: "chord" },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const isLoggedIn = !!session?.user?.id;
  const [chordTypes, libraryGroups, degreeStyles] = await Promise.all([
    fetchChordTypes(),
    fetchChordLibrary(),
    fetchDegreeStyles(),
  ]);

  return (
    <Suspense
      fallback={
        <main className="w-full max-w-5xl mx-auto min-h-screen py-10 px-4">
          <p style={{ color: "var(--muted)" }}>Chargement des accords…</p>
        </main>
      }
    >
      <ChordsPageClient
        isLoggedIn={isLoggedIn}
        presets={presets}
        chordTypes={chordTypes}
        libraryGroups={libraryGroups}
        degreeStyles={degreeStyles}
      />
    </Suspense>
  );
}
