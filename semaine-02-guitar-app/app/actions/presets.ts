"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/app/generated/prisma/client";

type ProgressionChordInput = {
  root_pc: number;
  chord_type: string;
  roman?: string;
};

function parseProgressionChords(
  raw: FormDataEntryValue | null,
): Prisma.InputJsonValue {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Accords de la progression requis.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Format des accords invalide.");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("La progression doit contenir au moins un accord.");
  }

  const chords: ProgressionChordInput[] = parsed.map((chord, index) => {
    if (
      !chord ||
      typeof chord !== "object" ||
      typeof (chord as ProgressionChordInput).root_pc !== "number" ||
      typeof (chord as ProgressionChordInput).chord_type !== "string" ||
      !(chord as ProgressionChordInput).chord_type.trim()
    ) {
      throw new Error(`Accord invalide à l’index ${index}.`);
    }

    const rootPc = (chord as ProgressionChordInput).root_pc;
    if (!Number.isInteger(rootPc) || rootPc < 0 || rootPc > 11) {
      throw new Error(`Fondamentale d’accord invalide à l’index ${index}.`);
    }

    const result: ProgressionChordInput = {
      root_pc: rootPc,
      chord_type: (chord as ProgressionChordInput).chord_type.trim(),
    };
    const roman = (chord as ProgressionChordInput).roman;
    if (typeof roman === "string" && roman.trim()) {
      result.roman = roman.trim();
    }
    return result;
  });

  return chords as Prisma.InputJsonValue;
}

export async function createPreset(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const name = (formData.get("name") as string)?.trim();
  const rootPc = formData.get("rootPc") as string;
  const scaleOrChord = (formData.get("scaleOrChord") as string)?.trim();
  const type = formData.get("type") as string;
  const cagedPos = formData.get("cagedPos") as string | null;
  const description =
    (formData.get("description") as string | null)?.trim() || null;

  if (!name) {
    throw new Error("Le nom du preset est requis.");
  }
  if (!["scale", "chord", "progression"].includes(type)) {
    throw new Error("Type de preset invalide.");
  }
  if (!scaleOrChord) {
    throw new Error("Gamme ou accord requis.");
  }

  const parsedRootPc = parseInt(rootPc, 10);
  if (Number.isNaN(parsedRootPc) || parsedRootPc < 0 || parsedRootPc > 11) {
    throw new Error("Fondamentale invalide.");
  }

  await prisma.preset.create({
    data: {
      userId,
      name,
      rootPc: parsedRootPc,
      scaleOrChord,
      type,
      cagedPos: type === "progression" ? null : cagedPos || null,
      description: type === "progression" ? description : null,
      chords:
        type === "progression"
          ? parseProgressionChords(formData.get("chords"))
          : undefined,
    },
  });
  revalidatePath("/");
  revalidatePath("/chords");
}

export async function deletePreset(presetId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.preset.deleteMany({
    where: {
      id: presetId,
      userId: session.user.id,
    },
  });
  revalidatePath("/");
  revalidatePath("/chords");
}
