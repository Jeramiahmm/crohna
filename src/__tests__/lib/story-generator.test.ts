import { describe, it, expect, vi, beforeEach } from "vitest";

// Unmock the story generator for this test file — we test the actual module
vi.unmock("@/lib/story-generator");

// Mock the Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));

// Need to import after mocks are set up
const { generateStory } = await import("@/lib/story-generator");

const sampleEvents = [
  {
    title: "Visited Paris",
    date: "2024-05-01",
    location: "Paris",
    category: "travel",
    description: "Amazing trip to the Eiffel Tower",
    hasPhoto: true,
  },
  {
    title: "Got Promoted",
    date: "2024-08-01",
    location: "NYC",
    category: "career",
    description: "Senior engineer role",
    hasPhoto: false,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateStory", () => {
  it("uses template fallback when no API key", async () => {
    // ANTHROPIC_API_KEY is not set in test env, so it should use fallback
    const result = await generateStory(sampleEvents, "2024", "Your 2024");

    expect(result.title).toBe("Your 2024");
    expect(result.summary).toContain("2 meaningful moments");
    expect(result.summary).toContain("Paris");
    expect(result.summary).toContain("NYC");
    expect(result.highlights).toContain("Visited Paris");
    expect(result.highlights).toContain("Got Promoted");
  });

  it("returns default message when no events", async () => {
    const result = await generateStory([], "2024");

    expect(result.summary).toContain("No events found");
    expect(result.highlights).toContain("Add events to see your highlights here");
  });

  it("includes photo count in template summary", async () => {
    const result = await generateStory(sampleEvents, "2024");

    expect(result.summary).toContain("1 photo");
  });

  it("includes categories in template summary", async () => {
    const result = await generateStory(sampleEvents, "2024");

    expect(result.summary).toContain("travel");
    expect(result.summary).toContain("career");
  });
});
