import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // During next build (page data collection), DATABASE_URL isn't available.
    // Return a proxy that throws on actual DB calls but lets the build complete.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return new Proxy({} as PrismaClient, {
        get: (_target, prop) => {
          if (prop === "$connect" || prop === "$disconnect") return () => Promise.resolve();
          if (typeof prop === "string" && !prop.startsWith("$")) {
            return new Proxy({}, { get: () => () => { throw new Error("Database not available during build"); } });
          }
          return undefined;
        },
      });
    }
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}
