import { NextRequest, NextResponse } from "next/server";

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
  try {
    const csrfError = validateCsrfInMiddleware(req);
    if (csrfError) return csrfError;
    return NextResponse.next();
  } catch {
    // Never let the Edge function throw — that produces
    // MIDDLEWARE_INVOCATION_FAILED, which broke the OAuth flow. Fail open
    // and let the route handler enforce auth via getServerSession().
    return NextResponse.next();
  }
}

// Exclude /api/auth/* (NextAuth handles its own flow, including CSRF) and
// /api/health from middleware execution. Each protected route enforces auth
// via getServerSession(authOptions) on its own, so there is no lost coverage.
export const config = {
  matcher: ["/api/((?!auth/|auth$|health/|health$).*)"],
};
