import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";

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
    const whereClause: Record<string, unknown> = { userId: user.id, deletedAt: null };
    if (existing.year) {
      const start = new Date(`${existing.year}-01-01`);
      const end = new Date(`${existing.year + 1}-01-01`);
      whereClause.date = { gte: start, lt: end };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });

    // Build regenerated content based on actual events
    const locations = Array.from(new Set(events.map((e) => e.location).filter(Boolean)));
    const categories = Array.from(new Set(events.map((e) => e.category).filter(Boolean)));
    const photosCount = events.filter((e) => e.imageUrl).length;

    const period = existing.year
      ? `January – December ${existing.year}`
      : "Your Life So Far";

    const summary = events.length > 0
      ? `A chapter defined by ${events.length} meaningful moments${locations.length > 0 ? ` across ${locations.join(", ")}` : ""}. ${
          categories.length > 0
            ? `Your focus areas were ${categories.join(", ")}.`
            : ""
        } ${
          photosCount > 0
            ? `You captured ${photosCount} photo${photosCount > 1 ? "s" : ""} along the way.`
            : ""
        }`.trim()
      : "No events found for this period yet. Add some memories to generate your story.";

    const highlights = events.length > 0
      ? events.slice(0, 5).map((e) => e.title)
      : ["Add events to see your highlights here"];

    const updated = await prisma.aIStory.update({
      where: { id },
      data: {
        summary,
        highlights,
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
