import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const checkImportLimit = createRateLimiter("google-import", 5, 60_000);

export async function POST(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    if (!(await checkImportLimit(session.user.email)).allowed) {
      return apiError("Too many import requests. Please wait a minute.", 429);
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return apiError("No Google access token. Please sign out and sign in again to grant calendar access.", 401);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return apiError("User not found", 404);
    }

    // Fetch calendar events from the last 2 years
    const timeMin = new Date();
    timeMin.setFullYear(timeMin.getFullYear() - 2);
    const timeMax = new Date();

    // Paginate through all calendar events (cap at 500)
    const items: Array<{
      id?: string;
      summary?: string;
      description?: string;
      location?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
    }> = [];
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
        // Consume body to avoid connection leak
        await calRes.json().catch(() => ({}));
        if (calRes.status === 401 || calRes.status === 403) {
          return apiError("Google access expired. Please sign out and sign in again.", 401);
        }
        logger.error("Google Calendar API error", { status: calRes.status });
        return apiError("Failed to fetch calendar events", 500);
      }

      const calData = await calRes.json();
      items.push(...(calData.items || []));
      pageToken = calData.nextPageToken;
    } while (pageToken && items.length < MAX_ITEMS);

    const capped = items.length >= MAX_ITEMS;

    // Build candidate IDs for batched dedup query
    const candidateIds = items
      .map((item) => item.id)
      .filter((id): id is string => !!id);

    // Deduplicate using batched WHERE IN query instead of loading all existing records
    const imported = await prisma.$transaction(async (tx) => {
      const existingCalendarEvents = candidateIds.length > 0
        ? await tx.event.findMany({
            where: { userId: user.id, source: "calendar", sourceId: { in: candidateIds } },
            select: { sourceId: true },
          })
        : [];

      const existingSet = new Set(
        existingCalendarEvents
          .map((e: { sourceId: string | null }) => e.sourceId)
          .filter(Boolean)
      );

      const eventsToCreate: {
        userId: string;
        title: string;
        date: Date;
        endDate: Date | null;
        location: string | null;
        description: string | null;
        category: string;
        source: string;
        sourceId: string | null;
      }[] = [];

      for (const item of items) {
        if (!item.summary || item.summary.trim().length === 0) continue;

        const startDate = item.start?.dateTime || item.start?.date;
        const endDate = item.end?.dateTime || item.end?.date;
        if (!startDate) continue;

        const isDateOnly = !item.start?.dateTime;
        const parsedDate = isDateOnly ? new Date(startDate + "T00:00:00") : new Date(startDate);
        if (isNaN(parsedDate.getTime())) continue;

        // Skip events with unreasonable dates
        const yearNum = parsedDate.getFullYear();
        if (yearNum < 1900 || yearNum > 2100) continue;

        const eventId = item.id as string | undefined;
        if (eventId && existingSet.has(eventId)) continue;

        const location = item.location?.substring(0, 200) || null;

        eventsToCreate.push({
          userId: user.id,
          title: item.summary.trim().substring(0, 500),
          date: parsedDate,
          endDate: endDate ? new Date(endDate) : null,
          location,
          description: item.description?.trim()?.substring(0, 5000) || null,
          category: "life",
          source: "calendar",
          sourceId: eventId || null,
        });

        if (eventId) existingSet.add(eventId);
      }

      if (eventsToCreate.length > 0) {
        await tx.event.createMany({ data: eventsToCreate });
      }
      return eventsToCreate.length;
    });

    return apiSuccess({
      imported,
      ...(capped && { warning: `Import capped at ${MAX_ITEMS} events. Some older events may not have been imported.` }),
    });
  } catch (error) {
    logger.error("POST /api/google/calendar error", { error: String(error) });
    return apiError("Failed to import calendar events", 500);
  }
}
