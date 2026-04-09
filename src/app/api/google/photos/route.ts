import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { apiSuccess, apiError } from "@/lib/api-response";

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
      return apiError("No Google access token. Please sign out and sign in again to grant photos access.", 401);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return apiError("User not found", 404);
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
    const mediaItems: Array<{
      id?: string;
      baseUrl?: string;
      description?: string;
      mediaMetadata?: { creationTime?: string };
    }> = [];
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
          return apiError("Google access expired. Please sign out and sign in again.", 401);
        }
        console.error("Google Photos API error:", errData);
        return apiError("Failed to fetch photos", 500);
      }

      const photosData = await photosRes.json();
      mediaItems.push(...(photosData.mediaItems || []));
      nextPageToken = photosData.nextPageToken;
    } while (nextPageToken && mediaItems.length < MAX_PHOTOS);

    const capped = mediaItems.length >= MAX_PHOTOS;

    // Deduplicate using gphotos:// URL and insert within a transaction
    const imported = await prisma.$transaction(async (tx) => {
      const existingPhotoEvents = await tx.event.findMany({
        where: { userId: user.id, source: "photos" },
        select: { imageUrl: true },
      });

      const existingUrls = new Set(
        existingPhotoEvents.map((e: { imageUrl: string | null }) => e.imageUrl).filter(Boolean)
      );

      const eventsToCreate: {
        userId: string;
        title: string;
        date: Date;
        imageUrl: string;
        description: string | null;
        category: string;
        source: string;
      }[] = [];

      for (const item of mediaItems) {
        if (!item.baseUrl || !item.mediaMetadata?.creationTime || !item.id) continue;

        // Store the mediaItemId as a stable identifier instead of the temporary baseUrl.
        // The baseUrl from Google Photos API expires after ~1 hour.
        // We use a placeholder URL with the mediaItemId so we can re-fetch on demand
        // via GET /api/google/photos/proxy?id=<mediaItemId>.
        const imageUrl = `gphotos://${item.id}`;

        if (existingUrls.has(imageUrl)) continue;

        const creationTime = new Date(item.mediaMetadata.creationTime);
        if (isNaN(creationTime.getTime())) continue;
        const title = item.description?.trim() || `Photo from ${creationTime.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

        eventsToCreate.push({
          userId: user.id,
          title: title.substring(0, 500),
          date: creationTime,
          imageUrl,
          description: item.description?.trim()?.substring(0, 5000) || null,
          category: "life",
          source: "photos",
        });

        existingUrls.add(imageUrl);
      }

      if (eventsToCreate.length > 0) {
        await tx.event.createMany({ data: eventsToCreate });
      }
      return eventsToCreate.length;
    });

    return apiSuccess({
      imported,
      total: mediaItems.length,
      ...(capped && { warning: `Import capped at ${MAX_PHOTOS} photos. Some older photos may not have been imported.` }),
    });
  } catch (error) {
    console.error("POST /api/google/photos error:", error);
    return apiError("Failed to import photos", 500);
  }
}
