import Anthropic from "@anthropic-ai/sdk";

const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

interface EventSummary {
  title: string;
  date: string;
  location: string | null;
  category: string | null;
  description: string | null;
  hasPhoto: boolean;
}

interface GeneratedStory {
  title: string;
  summary: string;
  highlights: string[];
}

function buildEventsContext(events: EventSummary[], period: string): string {
  if (events.length === 0) return "";

  const eventLines = events.map((e) => {
    const parts = [`- ${e.date}: "${e.title}"`];
    if (e.location) parts.push(`at ${e.location}`);
    if (e.category) parts.push(`[${e.category}]`);
    if (e.description) parts.push(`— ${e.description}`);
    if (e.hasPhoto) parts.push("(has photo)");
    return parts.join(" ");
  });

  const locations = Array.from(new Set(events.map((e) => e.location).filter(Boolean)));
  const categories = Array.from(new Set(events.map((e) => e.category).filter(Boolean)));
  const photosCount = events.filter((e) => e.hasPhoto).length;

  return [
    `Period: ${period}`,
    `Total events: ${events.length}`,
    `Locations: ${locations.join(", ") || "none specified"}`,
    `Categories: ${categories.join(", ") || "none specified"}`,
    `Photos: ${photosCount}`,
    "",
    "Events (chronological):",
    ...eventLines,
  ].join("\n");
}

/**
 * Generate a story using the Claude API.
 * Falls back to template generation if ANTHROPIC_API_KEY is not set.
 */
export async function generateStory(
  events: EventSummary[],
  period: string,
  existingTitle?: string
): Promise<GeneratedStory> {
  if (!hasApiKey || events.length === 0) {
    return generateTemplateFallback(events, period, existingTitle);
  }

  try {
    const client = new Anthropic({ timeout: 15_000 });
    const context = buildEventsContext(events, period);

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are writing a personal life story chapter for someone's timeline app. Based on their real life events below, write a warm, reflective narrative.

${context}

Respond in this exact JSON format (no markdown, no code fences):
{
  "title": "A creative, personal title for this chapter (e.g. 'The Year Everything Changed', 'Finding Your Path')",
  "summary": "A 2-4 sentence reflective narrative summary that weaves together the key themes and moments. Write in second person ('you'). Be warm and meaningful, not generic.",
  "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4", "highlight 5"]
}

Rules:
- The title should be evocative and personal, not just "Your 2024"
- The summary should feel like a chapter opening in a memoir
- Include exactly 5 highlights — the most meaningful moments, phrased as short, vivid descriptions
- Reference specific events, locations, and details from the data
- Keep the tone warm, reflective, and authentic — avoid clichés`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(text) as GeneratedStory;

    // Validate structure
    if (
      typeof parsed.title !== "string" ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.highlights)
    ) {
      throw new Error("Invalid response structure");
    }

    return {
      title: parsed.title.slice(0, 500),
      summary: parsed.summary.slice(0, 10000),
      highlights: parsed.highlights.slice(0, 8).map((h) => String(h).slice(0, 500)),
    };
  } catch (error) {
    console.error("Claude API story generation failed, using fallback:", error);
    return generateTemplateFallback(events, period, existingTitle);
  }
}

/** Template-based fallback when no API key or API fails */
function generateTemplateFallback(
  events: EventSummary[],
  period: string,
  existingTitle?: string
): GeneratedStory {
  const locations = Array.from(new Set(events.map((e) => e.location).filter(Boolean)));
  const categories = Array.from(new Set(events.map((e) => e.category).filter(Boolean)));
  const photosCount = events.filter((e) => e.hasPhoto).length;

  const title = existingTitle || `Your ${period}`;

  const summary =
    events.length > 0
      ? `A chapter defined by ${events.length} meaningful moments${locations.length > 0 ? ` across ${locations.join(", ")}` : ""}. ${
          categories.length > 0
            ? `Your focus areas were ${categories.join(", ")}.`
            : ""
        } ${
          photosCount > 0
            ? `You captured ${photosCount} photo${photosCount > 1 ? "s" : ""} along the way.`
            : ""
        }`.trim()
      : "No events found for this period yet. Add some memories to generate your story.";

  const highlights =
    events.length > 0
      ? events.slice(0, 5).map((e) => e.title)
      : ["Add events to see your highlights here"];

  return { title, summary, highlights };
}
