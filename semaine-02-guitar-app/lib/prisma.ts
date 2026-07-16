import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/** Bump when Prisma schema fields change so a stale hot-reload client is discarded. */
const PRISMA_CLIENT_VERSION = "preset-description-chords-v1";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientVersion?: string;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma =
  globalForPrisma.prisma &&
  globalForPrisma.prismaClientVersion === PRISMA_CLIENT_VERSION
    ? globalForPrisma.prisma
    : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaClientVersion = PRISMA_CLIENT_VERSION;
}

export default prisma;
