# Chrono — Comprehensive Code Audit (Round 2)

**Date:** 2026-03-20
**Auditor:** Senior Engineering Review (FAANG-level)
**Scope:** Full codebase — security, performance, reliability, accessibility, architecture, UX
**Previous audit:** 2026-03-19 (findings incorporated and expanded)

---

## Executive Summary

Chrono is a Next.js 14 personal timeline/life-logging app with Prisma/Postgres, NextAuth (Google OAuth), Supabase file storage, Upstash rate limiting, and AI story generation via Claude API. The codebase is well above average for an early-stage product — clean architecture, good testing, thoughtful design system. However, this deep audit uncovered **80+ issues** across security, reliability, and performance that must be addressed for production readiness.

**What's done well:**
- Prisma client singleton with `globalThis` pattern
- CSRF utility exists and is applied to mutating endpoints
- Rate limiting on critical write endpoints (stories, events)
- SWR for data fetching with cursor-based pagination
- Proper `escapeHtml()` in map popups
- Google imports use transactions for batch inserts
- Comprehensive test suite (Vitest unit + Playwright e2e)
- Cohesive dark/light theme with CSS custom properties
- AI story generation with graceful fallback

**Biggest risks if not addressed:**
1. CSRF bypass via missing origin/referer headers
2. No middleware-level auth enforcement — new routes easily ship unprotected
3. Unbounded queries + missing rate limits on insights = easy DoS
4. `unsafe-inline` in CSP = XSS protection is theater
5. Privacy settings are client-side only — server never enforces them

---

## CRITICAL (Fix Immediately)

### C1. CSRF Bypass When Origin and Referer Are Both Missing
**File:** `src/lib/csrf.ts:11-12`
```
if (!origin && !referer) return null;
```
Requests with neither header pass without validation. Certain HTTP clients, proxies, and browser privacy settings strip both. This is a real attack vector.
**Fix:** Reject mutating requests with no origin/referer, or implement token-based CSRF (double-submit cookie pattern).

### C2. Middleware Is Disabled — No Centralized Auth/CSRF
**File:** `src/middleware.ts:5-7`
Empty matcher array means zero centralized protection. Every route handler must manually call `validateCsrf()` and `getServerSession()`. This is the #1 architectural risk — any new route without these calls is wide open.
**Fix:** Enable middleware on `/api/*` (excluding `/api/health`). Enforce auth + CSRF at middleware level.

### C3. CSP Allows `unsafe-inline` for Scripts
**File:** `next.config.mjs:34`
`script-src 'self' 'unsafe-inline'` defeats CSP's primary XSS defense. Any XSS payload can execute inline scripts.
**Fix:** Use nonce-based CSP (Next.js supports this) or remove `unsafe-inline`.

### C4. `req.json()` Not Wrapped in try/catch (4 Routes)
**Files:**
- `src/app/api/stories/route.ts:89`
- `src/app/api/user/route.ts:51`
- `src/app/api/events/route.ts:119`
- `src/app/api/events/[id]/route.ts:35`

Malformed JSON body crashes the handler with an unhandled exception → 500 error with potential stack trace leak.
**Fix:** Wrap all `req.json()` calls in try/catch, return 400 on parse failure.

### C5. Image URL Allows SSRF to Internal Networks
**File:** `src/app/api/events/route.ts:145-154`
URL validation checks protocol (`http:`/`https:`) but allows internal IPs (`127.0.0.1`, `192.168.x.x`, `10.x.x.x`, `169.254.x.x`).
**Fix:** Add private/reserved IP range blocking before accepting image URLs.

### C6. Google Photos Proxy Is an Open Redirect
**File:** `src/app/api/google/photos/proxy/route.ts:56`
`NextResponse.redirect(imageUrl)` sends the user's browser to an external URL. Attackers can craft URLs that redirect to phishing sites.
**Fix:** Stream image bytes through the endpoint instead of redirecting.

---

## HIGH (Fix Before Launch)

### H1. Missing Database Indexes on Foreign Keys
**File:** `prisma/schema.prisma`
`Account` and `Session` models lack `@@index([userId])`. Every auth session lookup does a sequential scan.
**Fix:** Add `@@index([userId])` to both models.

### H2. No Rate Limiting on `/api/insights` or `/api/health`
- `src/app/api/insights/route.ts` — runs 4 parallel DB queries with unbounded result sets
- `src/app/api/health/route.ts` — hits DB with no auth or rate limit

**Fix:** Add `createRateLimiter()` to both. Insights especially — it's the most expensive endpoint.

### H3. No Account Deletion Confirmation
**File:** `src/app/api/user/route.ts:93-126`
DELETE handler nukes all user data with a single unauthenticated-beyond-session API call. No password re-entry, no confirmation token, no soft-delete grace period.
**Fix:** Require re-authentication or a confirmation token. Consider 30-day soft-delete before hard purge.

### H4. Upload Extension Spoofing
**File:** `src/app/api/upload/route.ts:53-55`
Extension is taken from original filename, not MIME type. A file named `exploit.exe` with `image/jpeg` MIME gets saved as `.exe`.
**Fix:** Derive extension from validated MIME type only.

### H5. Upload Paths Not User-Scoped
**File:** `src/app/api/upload/route.ts:47`
All uploads go to a flat namespace. Can't manage per-user storage, can't clean up on account deletion, can't enforce quotas.
**Fix:** Prefix uploads with `{userId}/`.

### H6. Supabase Client Singleton Inconsistent with Prisma Pattern
**File:** `src/lib/supabase.ts:3-15`
Uses module-level `let _supabase` instead of `globalThis` pattern. Hot reload in dev creates multiple clients with leaked connections.
**Fix:** Use the same `globalThis` pattern as `prisma.ts`.

### H7. Privacy Settings Are Client-Side Only
Settings page saves preferences to DB, but the API never checks them when serving data. Shared timelines, public profiles — none enforced server-side.
**Fix:** Enforce privacy settings in every data-serving endpoint.

### H8. Story Generation UI Missing
`POST /api/stories` exists and works, but no UI button calls it. The flagship AI feature is unreachable.
**Fix:** Add "Generate Story" button on insights/timeline page.

### H9. Session Refresh Error Never Surfaced
**File:** `src/lib/auth.ts:82`
`RefreshAccessTokenError` is set on session but no component reads it. Google integrations silently break with no recovery path.
**Fix:** Add global session error banner with re-auth prompt (component exists: `SessionErrorBanner.tsx` — verify it's wired up).

### H10. Map Always Uses Dark Tile Layer
**File:** `src/components/map/EventMap.tsx:64`
Hardcoded dark tiles regardless of theme.
**Fix:** Use theme context to switch tile URLs.

---

## MEDIUM

### Security & Auth
| # | Issue | Location |
|---|-------|----------|
| M1 | Unauth'd requests get `{ stats: null }` instead of 401 on insights | `api/insights/route.ts:6-19` |
| M2 | Unauth'd requests get empty arrays instead of 401 on events/stories | Multiple routes |
| M3 | Google status returns false booleans for unauth'd instead of 401 | `api/google/status/route.ts:11` |
| M4 | No rate limit on Google status endpoint | `api/google/status/route.ts` |
| M5 | Story regeneration not wrapped in DB transaction (race condition) | `api/stories/[id]/route.ts:43-95` |
| M6 | CSRF validation is manual per-route (easy to forget on new routes) | `src/lib/csrf.ts` |

### Input Validation
| # | Issue | Location |
|---|-------|----------|
| M7 | No `endDate > startDate` validation | `api/events/route.ts:129-134`, `api/events/[id]/route.ts:45-47` |
| M8 | No location string length limit | `api/events/route.ts:164` |
| M9 | Year parameter not validated for empty string | `api/events/route.ts:63-71` |
| M10 | No input schema validation library (should use Zod) | All API routes |

### Performance
| # | Issue | Location |
|---|-------|----------|
| M11 | Google Photos import loads ALL existing URLs into memory | `api/google/photos/route.ts:109-115` |
| M12 | Google Calendar import same pattern | `api/google/calendar/route.ts:89-98` |
| M13 | Silent 500-item cap on Google imports — no user warning | Both google routes |
| M14 | Insights `findMany` with no limit on date query | `api/insights/route.ts:48-52` |
| M15 | `handleScroll` recreated every render | `Navigation.tsx:257` |
| M16 | Missing `React.memo` on hot-path components | `TimelineCard`, `AddMemoryButton` |
| M17 | No `<Suspense>` boundary around `useSearchParams` | Timeline, Map, Insights pages |

### Accessibility
| # | Issue | Location |
|---|-------|----------|
| M18 | Photo upload drop zone not keyboard-accessible | `EventModal.tsx:172-197` |
| M19 | Map markers not keyboard-navigable | `EventMap.tsx` |
| M20 | TimelineCard doesn't use semantic `<article>` tags | `TimelineCard.tsx` |
| M21 | StatCard statistics lack `aria-label` | `StatCard.tsx` |
| M22 | Map legend missing `role` attributes | `EventMap.tsx:262-276` |
| M23 | No focus return when modals close | `Navigation.tsx`, `EventModal.tsx` |
| M24 | Category buttons in EventModal lack `role` attributes | `EventModal.tsx:262-276` |

### Reliability
| # | Issue | Location |
|---|-------|----------|
| M25 | No GET handler for `/api/events/[id]` or `/api/stories/[id]` | Both `[id]/route.ts` |
| M26 | Leaflet map init has no try/catch (fails silently) | `EventMap.tsx:58-75` |
| M27 | Marker click handlers accumulate without cleanup | `EventMap.tsx:163` |
| M28 | Image upload races with form validation | `EventModal.tsx:67-72` |
| M29 | `setTimeout` for success message has no cleanup on unmount | `EventModal.tsx:82-85` |
| M30 | `uploadImageIfNeeded()` has no AbortController | `useEventForm.ts` |
| M31 | Map theme change effect has no cleanup | `EventMap.tsx:86-92` |

### API Design
| # | Issue | Location |
|---|-------|----------|
| M32 | No standard API response envelope | All routes |
| M33 | Pagination uses different patterns across routes | Events vs Stories |
| M34 | Calendar dedup uses name+date instead of Google event ID | `api/google/calendar/route.ts` |

---

## LOW

| # | Issue | Location |
|---|-------|----------|
| L1 | No timezone handling — all dates UTC | Multiple routes |
| L2 | `cn()` passes array instead of spreading to clsx | `src/lib/utils.ts:3-4` |
| L3 | Unused Tailwind content path `./src/pages` | `tailwind.config.ts:5` |
| L4 | Duplicate CSS variable definitions | `globals.css:254-268` |
| L5 | Potentially unused CSS classes (`.watermark`, `.mask-gradient-*`) | `globals.css:115-229` |
| L6 | CSS `::selection` styled twice with specificity issues | `globals.css:242-250` |
| L7 | Missing `onUpdate: Cascade` on Account model | `schema.prisma:40` |
| L8 | Non-null assertions without runtime guards (`event.latitude!`) | `EventMap.tsx:138` |
| L9 | Type cast without verification (`e.target as HTMLElement`) | `Navigation.tsx:187` |
| L10 | Google API error details logged to console | `api/google/photos/route.ts:90` |
| L11 | Search input has no max length | `Navigation.tsx:149-159` |
| L12 | No request deduplication on story generation | `api/stories/route.ts:73-78` |
| L13 | `eslint-disable` for `no-explicit-any` in API routes | Calendar, Photos, Stories routes |
| L14 | Duplicate navigation definitions | `Navigation.tsx:13-27` |
| L15 | Hero uses hardcoded sign-in path instead of `signIn()` | `src/app/page.tsx:71` |
| L16 | Demo events use Unsplash without attribution | `src/data/demo.ts` |
| L17 | PWA manifest is minimal (missing icon set, start_url) | `public/manifest.json` |
| L18 | Map legend shows category colors but markers are all white | `EventMap.tsx` |
| L19 | `getEventsByYear` defined in `demo.ts` but used everywhere | `src/data/demo.ts` |
| L20 | Insights "longest streak" metric is misleading | `api/insights/route.ts:111` |

---

## Feature Recommendations

### Should Add (High Impact)
1. **Middleware-level auth** — Single enforcement point for protected routes
2. **Zod input validation** — Schema-based validation on all API inputs
3. **Structured logging** — Replace `console.error` with Pino + correlation IDs
4. **Request ID tracing** — `X-Request-Id` header propagation
5. **Error monitoring** — Sentry or equivalent
6. **Optimistic UI** — SWR `optimisticData` for instant feedback
7. **Error boundary per route** — Not just root-level
8. **Confirmation dialogs** — For all destructive operations
9. **Incremental Google import** — Progress indicator instead of silent 500-cap

### Could Add (Nice to Have)
10. PWA offline support with IndexedDB caching
11. Next.js `<Image>` with responsive image transforms
12. Dynamic OG image generation for shared timelines
13. CSV/JSON export of timeline data
14. Keyboard shortcuts (`n` = new event, `/` = search, `j`/`k` = navigate)
15. Soft delete with 30-second undo window
16. Geocoding — auto-resolve lat/lng from location text
17. Multiple OAuth providers (Apple, GitHub, email/password)
18. Timeline collaboration (shared timelines for couples/families)
19. "On This Day" push notifications
20. Year-in-review automated email

---

## Recommended Action Plan

### Week 1 — Critical Security
1. Enable middleware with auth + CSRF enforcement
2. Fix CSRF bypass (reject requests with no origin/referer)
3. Remove `unsafe-inline` from CSP (use nonces)
4. Wrap all `req.json()` calls in try/catch
5. Block private IPs in image URL validation
6. Fix Google Photos proxy (stream bytes, don't redirect)

### Week 2 — High Priority
7. Add `@@index([userId])` to Account and Session models
8. Add rate limiting to insights and health endpoints
9. Implement account deletion with confirmation
10. Fix upload extension spoofing (derive from MIME)
11. Scope upload paths to user ID
12. Fix Supabase singleton pattern
13. Wire up story generation UI
14. Surface session refresh errors to users
15. Fix map theme-awareness

### Week 3 — Medium Priority
16. Add Zod validation schemas to all API routes
17. Return 401 (not empty data) for unauthenticated requests
18. Fix accessibility gaps (keyboard nav, ARIA, semantic HTML)
19. Add AbortController to image uploads
20. Clean up timer/effect leaks
21. Standardize API response format
22. Add `<Suspense>` boundaries for `useSearchParams`

### Ongoing
23. Add error monitoring (Sentry)
24. Add structured logging
25. Component memoization pass
26. Expand test coverage for edge cases found in this audit
