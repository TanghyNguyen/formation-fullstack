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
    <ChordsPageClient
      isLoggedIn={isLoggedIn}
      presets={presets}
      chordTypes={chordTypes}
      libraryGroups={libraryGroups}
      degreeStyles={degreeStyles}
    />
  );
}
