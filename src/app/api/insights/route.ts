import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

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

    const events = await prisma.event.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    if (events.length === 0) {
      return NextResponse.json({ stats: null });
    }

    // Single-pass aggregation
    const categoryMap: Record<string, number> = {};
    const yearMap: Record<number, number> = {};
    const cityMap: Record<string, number> = {};
    let photosCount = 0;
    const allDates: Date[] = [];

    for (const e of events) {
      const cat = e.category || "uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;

      const year = e.date.getFullYear();
      yearMap[year] = (yearMap[year] || 0) + 1;

      if (e.location) {
        cityMap[e.location] = (cityMap[e.location] || 0) + 1;
      }

      if (e.imageUrl) photosCount++;
      allDates.push(e.date);
    }

    const categories = Object.entries(categoryMap)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        color: "rgba(255,255,255,0.7)",
      }))
      .sort((a, b) => b.count - a.count);

    const yearlyEvents = Object.entries(yearMap)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year);

    const cityVisits = Object.entries(cityMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    const mostActiveYear = yearlyEvents.reduce(
      (a, b) => (b.count > a.count ? b : a),
      yearlyEvents[0]
    )?.year || new Date().getFullYear();

    return NextResponse.json({
      stats: {
        totalEvents: events.length,
        totalPhotos: photosCount,
        citiesVisited: Object.keys(cityMap).length,
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
