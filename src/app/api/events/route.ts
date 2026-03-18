import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { VALID_CATEGORIES } from "@/lib/constants";

function formatEvent(e: {
  id: string;
  title: string;
  date: Date;
  endDate: Date | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  description: string | null;
  category: string | null;
  source: string;
}) {
  return {
    id: e.id,
    title: e.title,
    date: e.date.toISOString().split("T")[0],
    endDate: e.endDate ? e.endDate.toISOString().split("T")[0] : undefined,
    location: e.location ?? undefined,
    latitude: e.latitude ?? undefined,
    longitude: e.longitude ?? undefined,
    imageUrl: e.imageUrl ?? undefined,
    description: e.description ?? undefined,
    category: e.category ?? undefined,
    source: e.source,
  };
}

// GET /api/events — returns all events for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ events: [], total: 0 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ events: [], total: 0 });
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam || "50", 10) || 50, 1), 100);

    const where: Record<string, unknown> = { userId: user.id };
    if (year) {
      const yearNum = parseInt(year, 10);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        return NextResponse.json({ error: "Invalid year parameter" }, { status: 400 });
      }
      const start = new Date(`${yearNum}-01-01T00:00:00Z`);
      const end = new Date(`${yearNum + 1}-01-01T00:00:00Z`);
      where.date = { gte: start, lt: end };
    }

    const dbEvents = await prisma.event.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = dbEvents.length > limit;
    const sliced = hasMore ? dbEvents.slice(0, limit) : dbEvents;
    const events = sliced.map(formatEvent);
    const nextCursor = hasMore ? sliced[sliced.length - 1].id : undefined;

    return NextResponse.json({ events, total: events.length, nextCursor });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST /api/events — create a new event
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
    const { title, date, endDate, location, latitude, longitude, description, category, imageUrl } = body;

    // Validation
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (title.length > 500) {
      return NextResponse.json({ error: "Title must be under 500 characters" }, { status: 400 });
    }
    if (!date || isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: "Valid date is required" }, { status: 400 });
    }
    if (endDate && isNaN(new Date(endDate).getTime())) {
      return NextResponse.json({ error: "Invalid end date" }, { status: 400 });
    }
    if (latitude !== undefined && latitude !== null && (typeof latitude !== "number" || latitude < -90 || latitude > 90)) {
      return NextResponse.json({ error: "Latitude must be between -90 and 90" }, { status: 400 });
    }
    if (longitude !== undefined && longitude !== null && (typeof longitude !== "number" || longitude < -180 || longitude > 180)) {
      return NextResponse.json({ error: "Longitude must be between -180 and 180" }, { status: 400 });
    }
    if (description && typeof description === "string" && description.length > 5000) {
      return NextResponse.json({ error: "Description must be under 5000 characters" }, { status: 400 });
    }

    if (imageUrl && typeof imageUrl === "string") {
      try {
        const parsed = new URL(imageUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
      }
    }

    const cat = category && VALID_CATEGORIES.includes(category.toLowerCase()) ? category.toLowerCase() : "life";

    const event = await prisma.event.create({
      data: {
        userId: user.id,
        title: title.trim(),
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        location: location?.trim() || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        description: description?.trim() || null,
        category: cat,
        imageUrl: imageUrl ?? null,
        source: "manual",
      },
    });

    return NextResponse.json({ event: formatEvent(event) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// DELETE /api/events — bulk delete all events for the authenticated user
export async function DELETE() {
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

    const result = await prisma.event.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error) {
    console.error("DELETE /api/events error:", error);
    return NextResponse.json({ error: "Failed to delete events" }, { status: 500 });
  }
}
