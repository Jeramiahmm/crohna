import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createRateLimiter } from "@/lib/rate-limit";
import { generateStory } from "@/lib/story-generator";

const checkStoryLimit = createRateLimiter("stories", 5, 60_000);

// PUT /api/stories/[id] — regenerate a story
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkStoryLimit(session.user.email)).allowed) {
      return NextResponse.json(
        { error: "Too many regeneration requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    const existing = await prisma.aIStory.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Get user's events for the story's period
    const whereClause: Prisma.EventWhereInput = { userId: user.id, deletedAt: null };
    if (existing.year) {
      const start = new Date(`${existing.year}-01-01`);
      const end = new Date(`${existing.year + 1}-01-01`);
      whereClause.date = { gte: start, lt: end };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });

    const locations = Array.from(new Set(events.map((e) => e.location).filter(Boolean)));
    const photosCount = events.filter((e) => e.imageUrl).length;

    const period = existing.year
      ? `January – December ${existing.year}`
      : "Your Life So Far";

    // Generate story content using Claude API (or fallback)
    const eventSummaries = events.map((e) => ({
      title: e.title,
      date: e.date.toISOString().split("T")[0],
      location: e.location,
      category: e.category,
      description: e.description,
      hasPhoto: !!e.imageUrl,
    }));

    const generated = await generateStory(eventSummaries, period, existing.title);

    const updated = await prisma.aIStory.update({
      where: { id },
      data: {
        title: generated.title,
        summary: generated.summary,
        highlights: generated.highlights,
        period,
        stats: {
          events: events.length,
          cities: locations.length,
          photos: photosCount,
        },
      },
    });

    return NextResponse.json({
      story: {
        id: updated.id,
        title: updated.title,
        period: updated.period,
        year: updated.year ?? undefined,
        summary: updated.summary,
        highlights: updated.highlights,
        stats: (updated.stats as Record<string, string | number>) ?? undefined,
      },
    });
  } catch (error) {
    console.error("PUT /api/stories/[id] error:", error);
    return NextResponse.json({ error: "Failed to regenerate story" }, { status: 500 });
  }
}

// DELETE /api/stories/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    const existing = await prisma.aIStory.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    await prisma.aIStory.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/stories/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
  }
}
