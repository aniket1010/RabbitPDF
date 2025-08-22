import { PrismaClient } from "@prisma/client";

// Ensure a single PrismaClient instance in dev to avoid too many connections
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prismaOptions = process.env.DATABASE_URL
  ? {
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    }
  : undefined;

export const prisma = globalForPrisma.prisma || new PrismaClient(prismaOptions as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
