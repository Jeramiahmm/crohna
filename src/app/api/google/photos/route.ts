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

    if (!checkImportLimit(session.user.email).allowed) {
      return NextResponse.json(
        { error: "Too many import requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return NextResponse.json(
        { error: "No Google access token. Please sign out and sign in again to grant photos access." },
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

    // Fetch recent photos (last 2 years)
    const dateFilter = {
      ranges: [
        {
          startDate: {
            year: new Date().getFullYear() - 2,
            month: 1,
            day: 1,
          },
          endDate: {
            year: new Date().getFullYear(),
            month: 12,
            day: 31,
          },
        },
      ],
    };

    // Paginate through photos (cap at 500)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mediaItems: any[] = [];
    let nextPageToken: string | undefined;
    const MAX_PHOTOS = 500;

    do {
      const photosRes = await fetch(
        "https://photoslibrary.googleapis.com/v1/mediaItems:search",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageSize: 100,
            pageToken: nextPageToken,
            filters: {
              dateFilter,
              mediaTypeFilter: { mediaTypes: ["PHOTO"] },
            },
          }),
        }
      );

      if (!photosRes.ok) {
        const errData = await photosRes.json().catch(() => ({}));
        if (photosRes.status === 401 || photosRes.status === 403) {
          return NextResponse.json(
            { error: "Google access expired. Please sign out and sign in again." },
            { status: 401 }
          );
        }
        console.error("Google Photos API error:", errData);
        return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
      }

      const photosData = await photosRes.json();
      mediaItems.push(...(photosData.mediaItems || []));
      nextPageToken = photosData.nextPageToken;
    } while (nextPageToken && mediaItems.length < MAX_PHOTOS);

    // Deduplicate by checking existing photo-sourced events
    const existingPhotoEvents = await prisma.event.findMany({
      where: { userId: user.id, source: "photos" },
      select: { imageUrl: true },
    });

    const existingUrls = new Set(existingPhotoEvents.map((e) => e.imageUrl).filter(Boolean));

    let imported = 0;
    for (const item of mediaItems) {
      if (!item.baseUrl || !item.mediaMetadata?.creationTime) continue;

      // Use the baseUrl with size parameter for display
      const imageUrl = `${item.baseUrl}=w800-h600`;

      // Skip if we already imported this photo (by checking if description matches the ID)
      if (existingUrls.has(imageUrl)) continue;

      const creationTime = new Date(item.mediaMetadata.creationTime);
      if (isNaN(creationTime.getTime())) continue;
      const title = item.description?.trim() || `Photo from ${creationTime.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

      await prisma.event.create({
        data: {
          userId: user.id,
          title: title.substring(0, 500),
          date: creationTime,
          imageUrl,
          description: item.description?.trim()?.substring(0, 5000) || null,
          category: "life",
          source: "photos",
        },
      });

      existingUrls.add(imageUrl);
      imported++;
    }

    return NextResponse.json({ success: true, imported, total: mediaItems.length });
  } catch (error) {
    console.error("POST /api/google/photos error:", error);
    return NextResponse.json({ error: "Failed to import photos" }, { status: 500 });
  }
}
