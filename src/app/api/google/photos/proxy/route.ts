import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/google/photos/proxy?id=<mediaItemId>
 *
 * Resolves a Google Photos mediaItemId to a fresh baseUrl and redirects.
 * Google Photos baseUrls expire after ~1 hour, so we stored gphotos://<id>
 * as a placeholder during import. This endpoint fetches the current URL on demand.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mediaItemId = req.nextUrl.searchParams.get("id");
    if (!mediaItemId) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return NextResponse.json(
        { error: "No Google access token. Please sign out and sign in again." },
        { status: 401 }
      );
    }

    const photosRes = await fetch(
      `https://photoslibrary.googleapis.com/v1/mediaItems/${encodeURIComponent(mediaItemId)}`,
      {
        headers: { Authorization: `Bearer ${token.accessToken}` },
      }
    );

    if (!photosRes.ok) {
      if (photosRes.status === 401 || photosRes.status === 403) {
        return NextResponse.json(
          { error: "Google access expired. Please sign out and sign in again." },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: "Failed to fetch photo" }, { status: 500 });
    }

    const data = await photosRes.json();
    if (!data.baseUrl) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Redirect to the fresh baseUrl with width parameter for optimized delivery
    const imageUrl = `${data.baseUrl}=w1200-h800`;
    return NextResponse.redirect(imageUrl);
  } catch (error) {
    console.error("GET /api/google/photos/proxy error:", error);
    return NextResponse.json({ error: "Failed to proxy photo" }, { status: 500 });
  }
}
