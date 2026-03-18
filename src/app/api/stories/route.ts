import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// GET /api/stories — returns AI-generated stories for the authenticated user with cursor-based pagination
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ stories: [], total: 0 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ stories: [], total: 0 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam || "50", 10) || 50, 1), 100);

    const dbStories = await prisma.aIStory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = dbStories.length > limit;
    const sliced = hasMore ? dbStories.slice(0, limit) : dbStories;
    const nextCursor = hasMore ? sliced[sliced.length - 1].id : undefined;

    const stories = sliced.map((s) => ({
      id: s.id,
      title: s.title,
      period: s.period,
      year: s.year ?? undefined,
      summary: s.summary,
      highlights: s.highlights,
      stats: (s.stats as Record<string, string | number>) ?? undefined,
    }));

    return NextResponse.json({ stories, total: stories.length, nextCursor });
  } catch (error) {
    console.error("GET /api/stories error:", error);
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}

// POST /api/stories — create a new story
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { year, period } = body;

    if (year !== undefined && year !== null) {
      const yearNum = Number(year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        return NextResponse.json({ error: "Invalid year" }, { status: 400 });
      }
    }

    const story = await prisma.aIStory.create({
      data: {
        userId: user.id,
        title: year ? `Your ${year}` : `Your ${period || "Life Story"}`,
        period: period || (year ? `January – December ${year}` : "All Time"),
        year: year ? Number(year) : null,
        summary: "This story will be generated based on your life events during this period.",
        highlights: [
          "Key moment that defined this period",
          "Growth and personal development",
          "Meaningful connections made",
        ],
        stats: { events: 0, cities: 0, photos: 0 },
      },
    });

    return NextResponse.json({
      story: {
        id: story.id,
        title: story.title,
        period: story.period,
        year: story.year ?? undefined,
        summary: story.summary,
        highlights: story.highlights,
        stats: (story.stats as Record<string, string | number>) ?? undefined,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/stories error:", error);
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
  }
}
