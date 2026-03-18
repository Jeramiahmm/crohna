// Validates required environment variables at import time
const requiredVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length > 0 && process.env.NODE_ENV === "production") {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
}

if (missingVars.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn(
    `[Chrono] Warning: Missing environment variables: ${missingVars.join(", ")}`
  );
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
} as const;
