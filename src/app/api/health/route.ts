import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();
    // Quick DB connectivity check
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
