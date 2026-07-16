import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { fetchChordTypes, fetchDegreeStyles, fetchScales } from "@/lib/guitar-api";
import HomePageClient from "@/components/HomePageClient";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [presets, progressionPresets] = userId
    ? await Promise.all([
        prisma.preset.findMany({
          where: { userId, type: "scale" },
          orderBy: { createdAt: "desc" },
        }),
        prisma.preset.findMany({
          where: { userId, type: "progression" },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], []];
  const isLoggedIn = !!userId;
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
      progressionPresets={progressionPresets}
      scales={scales}
      degreeStyles={degreeStyles}
      chordLabels={chordLabels}
    />
  );
}
