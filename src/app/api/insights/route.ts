import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ stats: null });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ stats: null });
    }

    const baseWhere = { userId: user.id, deletedAt: null };

    // Use database aggregation instead of loading all events into memory
    const [totalEvents, photosCount, categoryGroups, locationGroups] = await Promise.all([
      prisma.event.count({ where: baseWhere }),
      prisma.event.count({ where: { ...baseWhere, imageUrl: { not: null } } }),
      prisma.event.groupBy({
        by: ["category"],
        where: baseWhere,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.event.groupBy({
        by: ["location"],
        where: { ...baseWhere, location: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
    ]);

    if (totalEvents === 0) {
      return NextResponse.json({ stats: null });
    }

    // Fetch only dates for streak calculation and yearly aggregation (select minimal data)
    const eventDates = await prisma.event.findMany({
      where: baseWhere,
      select: { date: true },
      orderBy: { date: "desc" },
    });

    // Build yearly aggregation from dates
    const yearMap: Record<number, number> = {};
    const allDates: Date[] = [];
    for (const e of eventDates) {
      const year = e.date.getFullYear();
      yearMap[year] = (yearMap[year] || 0) + 1;
      allDates.push(e.date);
    }

    const categories = categoryGroups.map((g) => {
      const name = g.category || "uncategorized";
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count: g._count.id,
        color: "rgba(255,255,255,0.7)",
      };
    });

    const yearlyEvents = Object.entries(yearMap)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year);

    const cityVisits = locationGroups.map((g) => ({
      city: g.location!,
      count: g._count.id,
    }));

    const mostActiveYear = yearlyEvents.reduce(
      (a, b) => (b.count > a.count ? b : a),
      yearlyEvents[0]
    )?.year || new Date().getFullYear();

    return NextResponse.json({
      stats: {
        totalEvents,
        totalPhotos: photosCount,
        citiesVisited: cityVisits.length,
        mostActiveYear,
        mostVisitedCity: cityVisits[0]?.city || "None",
        topCategory: categories[0]?.name || "None",
        longestStreak: calculateLongestStreak(allDates),
        categories,
        yearlyEvents,
        cityVisits,
      },
    });
  } catch (error) {
    console.error("GET /api/insights error:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}

function calculateLongestStreak(dates: Date[]): string {
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
