import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createRateLimiter } from "@/lib/rate-limit";
import { generateStory } from "@/lib/story-generator";
import { validateCsrf } from "@/lib/csrf";
import { apiSuccess, apiError } from "@/lib/api-response";

const checkStoryLimit = createRateLimiter("stories", 5, 60_000);

// PUT /api/stories/[id] — regenerate a story
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    if (!(await checkStoryLimit(session.user.email)).allowed) {
      return apiError("Too many regeneration requests. Please wait a minute.", 429);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return apiError("User not found", 404);
    }

    const { id } = await params;

    const existing = await prisma.aIStory.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return apiError("Story not found", 404);
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
      take: 10_000,
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

    // Use a transaction to atomically verify ownership and update.
    // The AI call above is external and long-running, so we re-check
    // that the story still exists and belongs to this user before writing.
    const updated = await prisma.$transaction(async (tx) => {
      const fresh = await tx.aIStory.findFirst({
        where: { id, userId: user.id },
      });
      if (!fresh) return null;

      return tx.aIStory.update({
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
    });

    if (!updated) {
      return apiError("Story not found", 404);
    }

    return apiSuccess({
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
    return apiError("Failed to regenerate story", 500);
  }
}

// DELETE /api/stories/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return apiError("User not found", 404);
    }

    const { id } = await params;

    const existing = await prisma.aIStory.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return apiError("Story not found", 404);
    }

    await prisma.aIStory.delete({ where: { id } });

    return apiSuccess({});
  } catch (error) {
    console.error("DELETE /api/stories/[id] error:", error);
    return apiError("Failed to delete story", 500);
  }
}
