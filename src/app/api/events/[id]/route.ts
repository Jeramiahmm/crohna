import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// PUT /api/events/[id] — update an event
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const existing = await prisma.event.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, date, endDate, location, latitude, longitude, description, category, imageUrl } = body;

    // Validation
    if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    if (title && title.length > 500) {
      return NextResponse.json({ error: "Title must be under 500 characters" }, { status: 400 });
    }
    if (date !== undefined && isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    if (latitude !== undefined && latitude !== null && (typeof latitude !== "number" || latitude < -90 || latitude > 90)) {
      return NextResponse.json({ error: "Latitude must be between -90 and 90" }, { status: 400 });
    }
    if (longitude !== undefined && longitude !== null && (typeof longitude !== "number" || longitude < -180 || longitude > 180)) {
      return NextResponse.json({ error: "Longitude must be between -180 and 180" }, { status: 400 });
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
        ...(category !== undefined && { category: category ?? null }),
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
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const existing = await prisma.event.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
