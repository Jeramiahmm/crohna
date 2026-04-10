import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock next-auth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  getPrisma: vi.fn(() => mockPrisma),
}));

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(() => mockSupabase),
}));

// Mock rate limiter — default to allowing all requests (async interface)
vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: vi.fn(() => vi.fn(() => Promise.resolve({ allowed: true }))),
}));

// Mock auth options
vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Mock env (no-op)
vi.mock("@/lib/env", () => ({}));

// Mock logger (silent in tests)
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Mock story generator
vi.mock("@/lib/story-generator", () => ({
  generateStory: vi.fn((_events: unknown[], _period: string, existingTitle?: string) =>
    Promise.resolve({
      title: existingTitle || "Generated Title",
      summary: "AI-generated story summary.",
      highlights: ["Highlight 1", "Highlight 2", "Highlight 3"],
    })
  ),
}));

// Shared mock Prisma client
export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  event: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  aIStory: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  session: {
    deleteMany: vi.fn(),
  },
  account: {
    deleteMany: vi.fn(),
  },
  $queryRaw: vi.fn(),
  $transaction: vi.fn((input: unknown) => {
    // Support both array and function patterns
    if (Array.isArray(input)) return Promise.resolve(input);
    if (typeof input === "function") return (input as (tx: typeof mockPrisma) => Promise<unknown>)(mockPrisma);
    return Promise.resolve(input);
  }),
};

// Shared mock Supabase client
export const mockBucket = {
  upload: vi.fn(() => ({ error: null })),
  getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.com/image.jpg" } })),
};

export const mockSupabase = {
  storage: {
    from: vi.fn(() => mockBucket),
  },
};
