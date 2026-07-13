import { auth } from "@/auth";
import prisma from "@/lib/prisma";
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

  return <HomePageClient isLoggedIn={isLoggedIn} presets={presets} />;
}
