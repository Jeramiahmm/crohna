import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { validateImageUrl } from "@/lib/url-validation";
import { createEventSchema, parseBody } from "@/lib/validation";
import { apiSuccess, apiError, apiPaginated } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const checkEventLimit = createRateLimiter("events", 30, 60_000);

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
    const year = searchParams.get("year");
    const cursor = searchParams.get("cursor") || undefined;
    const limitParam = searchParams.get("limit");

    // Validate cursor format (CUIDs are alphanumeric)
    if (cursor && !/^[a-z0-9]+$/i.test(cursor)) {
      return apiError("Invalid cursor", 400);
    }
    const limit = Math.min(Math.max(parseInt(limitParam || "50", 10) || 50, 1), 100);

    const where: Record<string, unknown> = { userId: user.id, deletedAt: null };
    if (year && year.trim() !== "") {
      const yearNum = parseInt(year, 10);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        return apiError("Invalid year parameter", 400);
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

    return apiPaginated(events, "events", nextCursor);
  } catch (error) {
    logger.error("GET /api/events error", { error: String(error) });
    return apiError("Failed to fetch events", 500);
  }
}

// POST /api/events — create a new event
export async function POST(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    if (!(await checkEventLimit(session.user.email)).allowed) {
      return apiError("Too many events created. Please wait a minute.", 429);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const { data: body, error: validationError } = await parseBody(req, createEventSchema);
    if (validationError) return validationError;

    const { title, date, endDate, location, latitude, longitude, description, category: cat, imageUrl } = body;

    if (imageUrl && typeof imageUrl === "string") {
      const urlError = validateImageUrl(imageUrl);
      if (urlError) {
        return apiError(urlError, 400);
      }
    }

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

    return apiSuccess({ event: formatEvent(event) }, 201);
  } catch (error) {
    logger.error("POST /api/events error", { error: String(error) });
    return apiError("Failed to create event", 500);
  }
}

// DELETE /api/events — bulk delete all events for the authenticated user
export async function DELETE(req: NextRequest) {
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

    const result = await prisma.event.updateMany({
      where: { userId: user.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return apiSuccess({ deleted: result.count });
  } catch (error) {
    logger.error("DELETE /api/events error", { error: String(error) });
    return apiError("Failed to delete events", 500);
  }
}
