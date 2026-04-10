import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const checkInsightsLimit = createRateLimiter("insights", 20, 60_000);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    if (!(await checkInsightsLimit(session.user.email)).allowed) {
      return apiError("Too many requests. Please wait a minute.", 429);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    // Check if user has any events first (cheap count query)
    const totalEvents = await prisma.event.count({
      where: { userId: user.id, deletedAt: null },
    });

    if (totalEvents === 0) {
      return apiSuccess({ stats: null });
    }

    // Use groupBy to push aggregation to the database instead of loading all events into memory
    const [categoryGroups, locationGroups, photosCount, datesList] = await Promise.all([
      prisma.event.groupBy({
        by: ["category"],
        where: { userId: user.id, deletedAt: null },
        _count: { id: true },
      }),
      prisma.event.groupBy({
        by: ["location"],
        where: { userId: user.id, deletedAt: null, location: { not: null } },
        _count: { id: true },
      }),
      prisma.event.count({
        where: { userId: user.id, deletedAt: null, imageUrl: { not: null } },
      }),
      prisma.event.findMany({
        where: { userId: user.id, deletedAt: null },
        select: { date: true },
        orderBy: { date: "desc" },
        take: 10_000,
      }),
    ]);

    // Build year map from lightweight date-only query
    const yearMap: Record<number, number> = {};
    const allDates: Date[] = [];
    for (const e of datesList) {
      const year = e.date.getFullYear();
      yearMap[year] = (yearMap[year] || 0) + 1;
      allDates.push(e.date);
    }

    type GroupByCategory = { category: string | null; _count: { id: number } };
    type GroupByLocation = { location: string | null; _count: { id: number } };

    const categories = (categoryGroups as GroupByCategory[])
      .map((g) => ({
        name: (g.category || "uncategorized").charAt(0).toUpperCase() + (g.category || "uncategorized").slice(1),
        count: g._count.id,
        color: "rgba(255,255,255,0.7)",
      }))
      .sort((a, b) => b.count - a.count);

    const yearlyEvents = Object.entries(yearMap)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year);

    const cityVisits = (locationGroups as GroupByLocation[])
      .filter((g) => g.location !== null)
      .map((g) => ({ city: g.location!, count: g._count.id }))
      .sort((a, b) => b.count - a.count);

    const mostActiveYear = yearlyEvents.reduce(
      (a, b) => (b.count > a.count ? b : a),
      yearlyEvents[0]
    )?.year || new Date().getFullYear();

    return apiSuccess({
      stats: {
        totalEvents,
        totalPhotos: photosCount,
        citiesVisited: cityVisits.length,
        mostActiveYear,
        mostVisitedCity: cityVisits[0]?.city || "None",
        topCategory: categories[0]?.name || "None",
        longestActiveRun: calculateLongestActiveRun(allDates),
        categories,
        yearlyEvents,
        cityVisits,
      },
    });
  } catch (error) {
    logger.error("GET /api/insights error", { error: String(error) });
    return apiError("Failed to fetch insights", 500);
  }
}

function calculateLongestActiveRun(dates: Date[]): string {
  if (dates.length < 2) return dates.length === 1 ? "1 day" : "—";

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const dayMs = 86400000;
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diffDays = Math.round(
      (sorted[i].getTime() - sorted[i - 1].getTime()) / dayMs
    );
    if (diffDays <= 7) {
      // Events within a week count as part of the same "active streak"
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }
  maxStreak = Math.max(maxStreak, currentStreak);

  if (maxStreak === 1) return "1 event";
  return `${maxStreak} events`;
}
