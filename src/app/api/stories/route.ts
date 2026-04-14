import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { generateStory } from "@/lib/story-generator";
import { createRateLimiter } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { createStorySchema, parseBody } from "@/lib/validation";
import { apiSuccess, apiError, apiPaginated } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const checkStoryLimit = createRateLimiter("stories", 5, 60_000);

// GET /api/stories — returns AI-generated stories with cursor-based pagination
export async function GET(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 100);
    const cursor = searchParams.get("cursor") || undefined;

    // Validate cursor format (CUIDs are alphanumeric)
    if (cursor && !/^[a-z0-9]+$/i.test(cursor)) {
      return apiError("Invalid cursor", 400);
    }

    const dbStories = await prisma.aIStory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (dbStories.length > limit) {
      const nextItem = dbStories.pop()!;
      nextCursor = nextItem.id;
    }

    const stories = dbStories.map((s) => ({
      id: s.id,
      title: s.title,
      period: s.period,
      year: s.year ?? undefined,
      summary: s.summary,
      highlights: s.highlights,
      stats: (s.stats as Record<string, string | number>) ?? undefined,
    }));

    return apiPaginated(stories, "stories", nextCursor);
  } catch (error) {
    logger.error("GET /api/stories error", { error: String(error) });
    return apiError("Failed to fetch stories", 500);
  }
}

// POST /api/stories — create a new story
export async function POST(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    if (!(await checkStoryLimit(session.user.email)).allowed) {
      return apiError("Too many story requests. Please wait a minute.", 429);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const { data: body, error: validationError } = await parseBody(req, createStorySchema);
    if (validationError) return validationError;

    const { year, period } = body;

    // Prevent duplicate stories for the same year
    if (year) {
      const existing = await prisma.aIStory.findFirst({
        where: { userId: user.id, year: Number(year) },
        select: { id: true },
      });
      if (existing) {
        return apiError("A story for this year already exists. Delete it first or choose a different year.", 409);
      }
    }

    // Fetch user's events for the period to generate content
    const storyPeriod = period || (year ? `January – December ${year}` : "All Time");
    const eventWhere: Record<string, unknown> = { userId: user.id, deletedAt: null };
    if (year) {
      const yearNum = Number(year);
      eventWhere.date = {
        gte: new Date(`${yearNum}-01-01`),
        lt: new Date(`${yearNum + 1}-01-01`),
      };
    }

    const events = await prisma.event.findMany({
      where: eventWhere,
      orderBy: { date: "asc" },
      take: 500,
    });

    const eventSummaries = events.map((e) => ({
      title: e.title,
      date: e.date.toISOString().split("T")[0],
      location: e.location,
      category: e.category,
      description: e.description,
      hasPhoto: !!e.imageUrl,
    }));

    const defaultTitle = year ? `Your ${year}` : `Your ${period || "Life Story"}`;
    const generated = await generateStory(eventSummaries, storyPeriod, defaultTitle);

    const locations = Array.from(new Set(events.map((e) => e.location).filter(Boolean)));
    const photosCount = events.filter((e) => e.imageUrl).length;

    const story = await prisma.aIStory.create({
      data: {
        userId: user.id,
        title: generated.title,
        period: storyPeriod,
        year: year ? Number(year) : null,
        summary: generated.summary,
        highlights: generated.highlights,
        stats: {
          events: events.length,
          cities: locations.length,
          photos: photosCount,
        },
      },
    });

    return apiSuccess({
      story: {
        id: story.id,
        title: story.title,
        period: story.period,
        year: story.year ?? undefined,
        summary: story.summary,
        highlights: story.highlights,
        stats: (story.stats as Record<string, string | number>) ?? undefined,
      },
    }, 201);
  } catch (error) {
    logger.error("POST /api/stories error", { error: String(error) });
    return apiError("Failed to create story", 500);
  }
}
