import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { validateCsrf } from "@/lib/csrf";
import { validateImageUrl } from "@/lib/url-validation";
import { updateEventSchema, parseBody } from "@/lib/validation";

// GET /api/events/[id] — get a single event
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    const event = await prisma.event.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
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
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.event.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { data: body, error: validationError } = await parseBody(req, updateEventSchema);
    if (validationError) return validationError;

    const { title, date, endDate, location, latitude, longitude, description, category: validatedCategory, imageUrl } = body;

    if (imageUrl && typeof imageUrl === "string") {
      const urlError = validateImageUrl(imageUrl);
      if (urlError) {
        return NextResponse.json({ error: urlError }, { status: 400 });
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

    return NextResponse.json({
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
    console.error("PUT /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.event.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
