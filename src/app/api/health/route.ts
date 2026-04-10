import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";

const checkHealthLimit = createRateLimiter("health", 30, 60_000);

async function checkDatabase(): Promise<"connected" | "disconnected"> {
  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    return "connected";
  } catch {
    return "disconnected";
  }
}

async function checkRedis(): Promise<"connected" | "disconnected" | "not_configured"> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return "not_configured";
  }
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    await redis.ping();
    return "connected";
  } catch {
    return "disconnected";
  }
}

async function checkSupabase(): Promise<"connected" | "disconnected" | "not_configured"> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return "not_configured";
  }
  try {
    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();
    const { error } = await supabase.storage.listBuckets();
    return error ? "disconnected" : "connected";
  } catch {
    return "disconnected";
  }
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!(await checkHealthLimit(ip)).allowed) {
      return NextResponse.json(
        { status: "rate_limited", timestamp: new Date().toISOString() },
        { status: 429 }
      );
    }

    const [database, redis, supabase] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkSupabase(),
    ]);

    const isHealthy = database === "connected";

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        services: { database, redis, supabase },
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        services: { database: "disconnected", redis: "unknown", supabase: "unknown" },
      },
      { status: 503 }
    );
  }
}
