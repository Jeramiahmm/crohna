import { NextRequest, NextResponse } from "next/server";
import { demoStories } from "@/data/demo";

// GET /api/stories — returns all AI-generated stories
export async function GET() {
  return NextResponse.json({
    stories: demoStories,
    total: demoStories.length,
  });
}

// POST /api/stories — generate a new AI story
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { year, period } = body;

  // In production, this would call an AI model to generate the story
  const newStory = {
    id: `story-${Date.now()}`,
    title: year ? `Your ${year}` : `Your ${period || "Life Story"}`,
    period: period || (year ? `January – December ${year}` : "All Time"),
    year: year || null,
    summary:
      "This is a generated summary of your life events during this period. In production, this would be created by an AI model analyzing your actual events.",
    highlights: [
      "Key moment that defined this period",
      "Growth and personal development",
      "Meaningful connections made",
    ],
    stats: {
      events: 0,
      cities: 0,
      photos: 0,
    },
  };

  return NextResponse.json({ story: newStory }, { status: 201 });
}
