export async function register() {
  if (process.env.NODE_ENV === "production") {
    // Validate environment on startup
    await import("@/lib/env");

    const { logger } = await import("@/lib/logger");
    logger.info("Crohna server starting", {
      nodeEnv: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasRedis: !!process.env.UPSTASH_REDIS_REST_URL,
      hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
    });
  }
}

export function onRequestError(
  error: { digest: string } & Error,
  request: { path: string; method: string; headers: { [key: string]: string } },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string }
) {
  // Structured error reporting — Vercel captures these automatically.
  // To add Sentry: import * as Sentry from "@sentry/nextjs"; Sentry.captureException(error);
  const entry = {
    level: "error",
    message: "Unhandled request error",
    timestamp: new Date().toISOString(),
    error: error.message,
    digest: error.digest,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  };

  if (process.stderr?.write) {
    process.stderr.write(JSON.stringify(entry) + "\n");
  } else {
    console.error(JSON.stringify(entry));
  }
}
