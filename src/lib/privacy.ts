import { getPrisma } from "@/lib/prisma";

export interface PrivacyPreferences {
  shareableStories: boolean;
  showLocationOnShared: boolean;
}

const DEFAULT_PRIVACY: PrivacyPreferences = {
  shareableStories: true,
  showLocationOnShared: true,
};

/**
 * Load privacy preferences from the database for a given user ID.
 * Falls back to permissive defaults if preferences are missing.
 */
export async function getPrivacyPreferences(userId: string): Promise<PrivacyPreferences> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  if (!user?.preferences || typeof user.preferences !== "object") {
    return DEFAULT_PRIVACY;
  }

  const prefs = user.preferences as Record<string, unknown>;
  return {
    shareableStories: typeof prefs.shareableStories === "boolean" ? prefs.shareableStories : DEFAULT_PRIVACY.shareableStories,
    showLocationOnShared: typeof prefs.showLocationOnShared === "boolean" ? prefs.showLocationOnShared : DEFAULT_PRIVACY.showLocationOnShared,
  };
}
