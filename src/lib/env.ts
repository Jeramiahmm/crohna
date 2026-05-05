import { logger } from "@/lib/logger";

/**
 * Validates required environment variables at runtime (not import time).
 * Skips during `next build` (NEXT_PHASE=phase-production-build) since
 * Vercel's build environment doesn't have all runtime secrets.
 */
let validated = false;

export function validateEnv() {
  if (validated) return;
  validated = true;

  // Skip during next build — env vars aren't available in build phase
  if (process.env.NEXT_PHASE === "phase-production-build") return;

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

  // Warn (don't throw) if Upstash is missing in production. The rate limiter
  // falls back to in-memory; throwing here would crash the auth route on every
  // request and break Google login when Upstash is unconfigured.
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)
  ) {
    logger.warn(
      "Upstash Redis is not configured in production — rate limiting will fall back to in-memory and won't work across serverless instances."
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
