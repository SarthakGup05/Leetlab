import {PrismaClient} from "../generated/prisma/index.js";

const GlobalPrisma = globalThis;

export  const prisma = GlobalPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (!GlobalPrisma.prisma) {
    GlobalPrisma.prisma = prisma;
  }
}