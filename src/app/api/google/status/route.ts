import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// GET /api/google/status — check which Google services have imported data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ calendar: false, photos: false });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ calendar: false, photos: false });
    }

    const [calendarCount, photosCount] = await Promise.all([
      prisma.event.count({ where: { userId: user.id, source: "calendar" } }),
      prisma.event.count({ where: { userId: user.id, source: "photos" } }),
    ]);

    return NextResponse.json({
      calendar: calendarCount > 0,
      photos: photosCount > 0,
    });
  } catch {
    return NextResponse.json({ calendar: false, photos: false });
  }
}
