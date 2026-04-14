import { logger } from "@/lib/logger";

/**
 * Validates required environment variables at runtime (not import time).
 * Call this from API route handlers, not at module scope, so `next build`
 * can complete without secrets present.
 */
let validated = false;

export function validateEnv() {
  if (validated) return;
  validated = true;

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

  if (missingVars.length > 0) {
    logger.warn("Missing environment variables", { vars: missingVars });
  }

  // Warn if Upstash is missing in production (rate limiting won't work across serverless instances)
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)
  ) {
    throw new Error(
      "Upstash Redis is required in production for distributed rate limiting. " +
      "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
    );
  }
}

export const env = {
  get DATABASE_URL() { return process.env.DATABASE_URL; },
  get NEXTAUTH_SECRET() { return process.env.NEXTAUTH_SECRET; },
  get NEXTAUTH_URL() { return process.env.NEXTAUTH_URL; },
  get GOOGLE_CLIENT_ID() { return process.env.GOOGLE_CLIENT_ID; },
  get GOOGLE_CLIENT_SECRET() { return process.env.GOOGLE_CLIENT_SECRET; },
  get SUPABASE_URL() { return process.env.NEXT_PUBLIC_SUPABASE_URL; },
  get SUPABASE_ANON_KEY() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; },
} as const;
