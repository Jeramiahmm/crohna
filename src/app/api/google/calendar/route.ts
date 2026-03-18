import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return NextResponse.json(
        { error: "No Google access token. Please sign out and sign in again to grant calendar access." },
        { status: 401 }
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch calendar events from the last 2 years
    const timeMin = new Date();
    timeMin.setFullYear(timeMin.getFullYear() - 2);
    const timeMax = new Date();

    const calendarUrl = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    calendarUrl.searchParams.set("timeMin", timeMin.toISOString());
    calendarUrl.searchParams.set("timeMax", timeMax.toISOString());
    calendarUrl.searchParams.set("maxResults", "100");
    calendarUrl.searchParams.set("singleEvents", "true");
    calendarUrl.searchParams.set("orderBy", "startTime");

    const calRes = await fetch(calendarUrl.toString(), {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    });

    if (!calRes.ok) {
      const errData = await calRes.json().catch(() => ({}));
      if (calRes.status === 401 || calRes.status === 403) {
        return NextResponse.json(
          { error: "Google access expired. Please sign out and sign in again." },
          { status: 401 }
        );
      }
      console.error("Google Calendar API error:", errData);
      return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
    }

    const calData = await calRes.json();
    const items = calData.items || [];

    // Filter out all-day events without meaningful titles and deduplicate
    const existingCalendarEvents = await prisma.event.findMany({
      where: { userId: user.id, source: "calendar" },
      select: { title: true, date: true },
    });

    const existingSet = new Set(
      existingCalendarEvents.map((e) => `${e.title}|${e.date.toISOString().split("T")[0]}`)
    );

    let imported = 0;
    for (const item of items) {
      if (!item.summary || item.summary.trim().length === 0) continue;

      const startDate = item.start?.dateTime || item.start?.date;
      const endDate = item.end?.dateTime || item.end?.date;
      if (!startDate) continue;

      const parsedDate = new Date(startDate);
      if (isNaN(parsedDate.getTime())) continue;

      const dateStr = parsedDate.toISOString().split("T")[0];
      const key = `${item.summary.trim()}|${dateStr}`;
      if (existingSet.has(key)) continue;

      const location = item.location || null;

      await prisma.event.create({
        data: {
          userId: user.id,
          title: item.summary.trim(),
          date: parsedDate,
          endDate: endDate ? new Date(endDate) : null,
          location,
          description: item.description?.trim()?.substring(0, 5000) || null,
          category: "life",
          source: "calendar",
        },
      });

      existingSet.add(key);
      imported++;
    }

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    console.error("POST /api/google/calendar error:", error);
    return NextResponse.json({ error: "Failed to import calendar events" }, { status: 500 });
  }
}
