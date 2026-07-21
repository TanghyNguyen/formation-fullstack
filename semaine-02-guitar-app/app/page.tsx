import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { fetchChordTypes, fetchDegreeStyles, fetchScales } from "@/lib/guitar-api";
import HomePageClient from "@/components/HomePageClient";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
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
    fetchScales(locale),
    fetchDegreeStyles(),
    fetchChordTypes(locale),
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
      locale={locale}
    />
  );
}
