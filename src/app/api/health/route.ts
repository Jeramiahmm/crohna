import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";

const checkHealthLimit = createRateLimiter("health", 30, 60_000);

export async function GET(req: NextRequest) {
  try {
    // Rate limit by IP since health check is unauthenticated
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!(await checkHealthLimit(ip)).allowed) {
      return NextResponse.json(
        { status: "rate_limited", timestamp: new Date().toISOString() },
        { status: 429 }
      );
    }

    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      { status: 503 }
    );
  }
}
