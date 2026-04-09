import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-response";

/**
 * GET /api/google/photos/proxy?id=<mediaItemId>
 *
 * Resolves a Google Photos mediaItemId to a fresh baseUrl and streams the image.
 * Google Photos baseUrls expire after ~1 hour, so we stored gphotos://<id>
 * as a placeholder during import. This endpoint fetches the current URL on demand.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    const mediaItemId = req.nextUrl.searchParams.get("id");
    if (!mediaItemId) {
      return apiError("Missing id parameter", 400);
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return apiError("No Google access token. Please sign out and sign in again.", 401);
    }

    const photosRes = await fetch(
      `https://photoslibrary.googleapis.com/v1/mediaItems/${encodeURIComponent(mediaItemId)}`,
      {
        headers: { Authorization: `Bearer ${token.accessToken}` },
      }
    );

    if (!photosRes.ok) {
      if (photosRes.status === 401 || photosRes.status === 403) {
        return apiError("Google access expired. Please sign out and sign in again.", 401);
      }
      return apiError("Failed to fetch photo", 500);
    }

    const data = await photosRes.json();
    if (!data.baseUrl) {
      return apiError("Photo not found", 404);
    }

    // Fetch the image and stream it back instead of redirecting
    const imageUrl = `${data.baseUrl}=w1200-h800`;
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return apiError("Failed to fetch photo", 500);
    }
    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await imageRes.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/google/photos/proxy error:", error);
    return apiError("Failed to proxy photo", 500);
  }
}
