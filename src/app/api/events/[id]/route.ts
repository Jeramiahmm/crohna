import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { validateCsrf } from "@/lib/csrf";
import { validateImageUrl } from "@/lib/url-validation";
import { updateEventSchema, parseBody } from "@/lib/validation";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

// GET /api/events/[id] — get a single event
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    const event = await prisma.event.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });
    if (!event) {
      return apiError("Event not found", 404);
    }

    return apiSuccess({
      event: {
        id: event.id,
        title: event.title,
        date: event.date.toISOString().split("T")[0],
        endDate: event.endDate ? event.endDate.toISOString().split("T")[0] : undefined,
        location: event.location ?? undefined,
        latitude: event.latitude ?? undefined,
        longitude: event.longitude ?? undefined,
        imageUrl: event.imageUrl ?? undefined,
        description: event.description ?? undefined,
        category: event.category ?? undefined,
        source: event.source,
      },
    });
  } catch (error) {
    logger.error("GET /api/events/[id] error", { error: String(error) });
    return apiError("Failed to fetch event", 500);
  }
}

// PUT /api/events/[id] — update an event
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const { id } = await params;
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

    const existing = await prisma.event.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });
    if (!existing) {
      return apiError("Event not found", 404);
    }

    const { data: body, error: validationError } = await parseBody(req, updateEventSchema);
    if (validationError) return validationError;

    const { title, date, endDate, location, latitude, longitude, description, category: validatedCategory, imageUrl } = body;

    if (imageUrl && typeof imageUrl === "string") {
      const urlError = validateImageUrl(imageUrl);
      if (urlError) {
        return apiError(urlError, 400);
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(latitude !== undefined && { latitude: latitude ?? null }),
        ...(longitude !== undefined && { longitude: longitude ?? null }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(validatedCategory !== undefined && { category: validatedCategory }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl ?? null }),
      },
    });

    return apiSuccess({
      event: {
        id: event.id,
        title: event.title,
        date: event.date.toISOString().split("T")[0],
        endDate: event.endDate ? event.endDate.toISOString().split("T")[0] : undefined,
        location: event.location ?? undefined,
        latitude: event.latitude ?? undefined,
        longitude: event.longitude ?? undefined,
        imageUrl: event.imageUrl ?? undefined,
        description: event.description ?? undefined,
        category: event.category ?? undefined,
        source: event.source,
      },
    });
  } catch (error) {
    logger.error("PUT /api/events/[id] error", { error: String(error) });
    return apiError("Failed to update event", 500);
  }
}

// DELETE /api/events/[id] — delete an event
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const { id } = await params;
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

    const existing = await prisma.event.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });
    if (!existing) {
      return apiError("Event not found", 404);
    }

    await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });

    return apiSuccess({});
  } catch (error) {
    logger.error("DELETE /api/events/[id] error", { error: String(error) });
    return apiError("Failed to delete event", 500);
  }
}
