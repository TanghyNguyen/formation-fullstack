import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { fetchChordTypes, fetchDegreeStyles, fetchScales } from "@/lib/guitar-api";
import HomePageClient from "@/components/HomePageClient";

export default async function HomePage() {
  const session = await auth();
  const presets = session?.user?.id
    ? await prisma.preset.findMany({
        where: { userId: session.user.id, type: "scale" },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const isLoggedIn = !!session?.user?.id;
  const [scales, degreeStyles, chordTypes] = await Promise.all([
    fetchScales(),
    fetchDegreeStyles(),
    fetchChordTypes(),
  ]);
  const chordLabels = Object.fromEntries(
    chordTypes.map((chord) => [chord.key, chord.label]),
  );

  return (
    <HomePageClient
      isLoggedIn={isLoggedIn}
      presets={presets}
      scales={scales}
      degreeStyles={degreeStyles}
      chordLabels={chordLabels}
    />
  );
}
