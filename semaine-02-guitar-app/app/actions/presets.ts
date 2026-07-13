"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPreset(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const name = formData.get("name") as string;
  const rootPc = formData.get("rootPc") as string;
  const scaleOrChord = formData.get("scaleOrChord") as string;
  const type = formData.get("type") as string;
  const cagedPos = formData.get("cagedPos") as string | null;
  await prisma.preset.create({
    data: {
      userId,
      name,
      rootPc: parseInt(rootPc),
      scaleOrChord,
      type,
      cagedPos: cagedPos || null,
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
