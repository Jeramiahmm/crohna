import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = ["/api/health", "/api/auth"];

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

/**
 * Validates the Origin header on mutating requests as CSRF defense-in-depth.
 */
function validateCsrfInMiddleware(req: NextRequest): NextResponse | null {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return null;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (!origin && !referer) {
    return NextResponse.json(
      { error: "Forbidden: missing origin header" },
      { status: 403 }
    );
  }

  const allowedHost = req.nextUrl.host;

  const headerToCheck = origin || referer;
  if (headerToCheck) {
    try {
      const parsedHost = new URL(headerToCheck).host;
      if (parsedHost !== allowedHost) {
        return NextResponse.json(
          { error: "Forbidden: cross-origin request" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Forbidden: invalid origin" },
        { status: 403 }
      );
    }
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public routes
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // CSRF check on all mutating API requests
  const csrfError = validateCsrfInMiddleware(req);
  if (csrfError) return csrfError;

  // Auth check: all non-public API routes require a valid session
  // Enforced on ALL methods (GET included) as defense-in-depth
  const method = req.method.toUpperCase();
  if (method !== "OPTIONS") {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    const token = await getToken({ req, secret });
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
