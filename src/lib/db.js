import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

function createClient() {
  return new PrismaClient();
}

export const prisma = globalForPrisma.__kromkaPrisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__kromkaPrisma = prisma;
}
