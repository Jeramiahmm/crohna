import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// GET /api/stories — returns all AI-generated stories for the authenticated user
export async function GET() {
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

    const dbStories = await prisma.aIStory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const stories = dbStories.map((s) => ({
      id: s.id,
      title: s.title,
      period: s.period,
      year: s.year ?? undefined,
      summary: s.summary,
      highlights: s.highlights,
      stats: (s.stats as Record<string, string | number>) ?? undefined,
    }));

    return NextResponse.json({ stories, total: stories.length });
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
