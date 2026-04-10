# Crohna

A life-timeline application built with Next.js 14. Capture, organize, and visualize life events on an interactive timeline and map. Generate AI-powered stories from your memories.

## Features

- **Timeline** — Chronological view of life events with search, filtering, and date ranges
- **Interactive Map** — Leaflet-powered map showing event locations with category-colored markers
- **AI Stories** — Claude-powered narrative generation from your events (with template fallback)
- **Google Import** — Import photos and calendar events from Google (OAuth)
- **PWA** — Installable progressive web app with offline-capable manifest
- **Privacy Controls** — Server-enforced privacy settings for map and timeline visibility

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components)
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Auth:** NextAuth.js with Google OAuth
- **Storage:** Supabase (image uploads)
- **AI:** Anthropic Claude API
- **Rate Limiting:** Upstash Redis (with in-memory fallback)
- **Styling:** Tailwind CSS
- **Testing:** Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or [Neon](https://neon.tech) account)

### Setup

```bash
# Clone and install
git clone https://github.com/jeramiahmm/crohna.git
cd crohna
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL, NextAuth secret, etc.

# Set up database
npx prisma migrate deploy   # production (applies migrations)
npx prisma db push           # development (quick sync)

# Seed sample data (optional)
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon Postgres pooled connection |
| `DIRECT_URL` | Yes | Neon Postgres direct connection (migrations) |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | App URL (`http://localhost:3000` for dev) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL (for uploads) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL (distributed rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token |
| `ANTHROPIC_API_KEY` | No | Claude API key (AI story generation) |

## Architecture

```
src/
  app/
    api/          # API routes (events, stories, user, upload, google, health)
    timeline/     # Timeline page
    insights/     # Insights + AI stories page
    map/          # Map page
    settings/     # User settings page
  components/     # React components (timeline, map, ui)
  hooks/          # SWR data hooks (useEvents, useStories, useInsights)
  lib/            # Server utilities
    auth.ts       # NextAuth configuration
    prisma.ts     # Prisma client singleton
    csrf.ts       # CSRF validation
    validation.ts # Zod input schemas
    logger.ts     # Structured JSON logger
    rate-limit.ts # Upstash + in-memory rate limiting
    api-response.ts # Standardized API response helpers
prisma/
  schema.prisma   # Database schema
  seed.ts         # Sample data seeder
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run db:migrate` | Create and apply migrations (dev) |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:push` | Push schema changes (dev shortcut) |
| `npm run db:seed` | Seed database with sample data |

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set all required environment variables in Vercel dashboard
3. Deploy — Vercel auto-detects Next.js and handles the build

For CI/CD deployment, set these GitHub secrets:
- `VERCEL_TOKEN` — Vercel personal access token
- `VERCEL_ORG_ID` — Vercel organization ID
- `VERCEL_PROJECT_ID` — Vercel project ID

### Database Migrations

```bash
# Development: create a new migration
npx prisma migrate dev --name describe-your-change

# Production: apply pending migrations
npx prisma migrate deploy
```

## Security

- CSRF protection on all mutating API endpoints
- SSRF blocking (private IP ranges rejected for image URLs)
- Rate limiting on all endpoints (Upstash Redis or in-memory fallback)
- Content Security Policy headers
- Input validation with Zod schemas
- Upload MIME type validation (extension derived from MIME, not filename)
- Soft-delete with 30-second undo window

## License

Private
