import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";

const checkImportLimit = createRateLimiter("google-import", 5, 60_000);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkImportLimit(session.user.email)).allowed) {
      return NextResponse.json(
        { error: "Too many import requests. Please wait a minute." },
        { status: 429 }
      );
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

    // Paginate through all calendar events (cap at 500)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = [];
    let pageToken: string | undefined;
    const MAX_ITEMS = 500;

    do {
      const calendarUrl = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
      calendarUrl.searchParams.set("timeMin", timeMin.toISOString());
      calendarUrl.searchParams.set("timeMax", timeMax.toISOString());
      calendarUrl.searchParams.set("maxResults", "250");
      calendarUrl.searchParams.set("singleEvents", "true");
      calendarUrl.searchParams.set("orderBy", "startTime");
      if (pageToken) calendarUrl.searchParams.set("pageToken", pageToken);

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
      items.push(...(calData.items || []));
      pageToken = calData.nextPageToken;
    } while (pageToken && items.length < MAX_ITEMS);

    // Filter out all-day events without meaningful titles and deduplicate
    const existingCalendarEvents = await prisma.event.findMany({
      where: { userId: user.id, source: "calendar" },
      select: { title: true, date: true },
    });

    const existingSet = new Set(
      existingCalendarEvents.map((e) => `${e.title}|${e.date.toISOString().split("T")[0]}`)
    );

    // Collect events to batch insert
    const eventsToCreate: {
      userId: string;
      title: string;
      date: Date;
      endDate: Date | null;
      location: string | null;
      description: string | null;
      category: string;
      source: string;
    }[] = [];

    for (const item of items) {
      if (!item.summary || item.summary.trim().length === 0) continue;

      const startDate = item.start?.dateTime || item.start?.date;
      const endDate = item.end?.dateTime || item.end?.date;
      if (!startDate) continue;

      // For date-only strings (YYYY-MM-DD), append T00:00:00 to avoid UTC midnight shift
      const isDateOnly = !item.start?.dateTime;
      const parsedDate = isDateOnly ? new Date(startDate + "T00:00:00") : new Date(startDate);
      if (isNaN(parsedDate.getTime())) continue;

      const dateStr = parsedDate.toISOString().split("T")[0];
      const key = `${item.summary.trim()}|${dateStr}`;
      if (existingSet.has(key)) continue;

      const location = item.location || null;

      eventsToCreate.push({
        userId: user.id,
        title: item.summary.trim(),
        date: parsedDate,
        endDate: endDate ? new Date(endDate) : null,
        location,
        description: item.description?.trim()?.substring(0, 5000) || null,
        category: "life",
        source: "calendar",
      });

      existingSet.add(key);
    }

    // Batch insert all events at once instead of N+1 sequential inserts
    if (eventsToCreate.length > 0) {
      await prisma.event.createMany({ data: eventsToCreate });
    }
    const imported = eventsToCreate.length;

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    console.error("POST /api/google/calendar error:", error);
    return NextResponse.json({ error: "Failed to import calendar events" }, { status: 500 });
  }
}
