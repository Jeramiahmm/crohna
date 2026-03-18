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
    `[Crohna] Warning: Missing environment variables: ${missingVars.join(", ")}`
  );
}

// Warn if Upstash is missing in production (rate limiting won't work across serverless instances)
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)
) {
  console.warn(
    "[Crohna] Warning: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set. " +
    "Rate limiting will not work correctly in serverless production."
  );
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;
