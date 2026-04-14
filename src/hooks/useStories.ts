import useSWR from "swr";
import { useSession } from "next-auth/react";
import { demoStories, AIStory } from "@/data/demo";

export function useStories() {
  const { data: session, status } = useSession();
  const isReady = status !== "loading";
  const isAuthenticated = !!session;

  const { data, error, isLoading, mutate } = useSWR<{
    stories: AIStory[];
  }>(isReady && isAuthenticated ? "/api/stories" : null, {
    dedupingInterval: 10000,
  });

  const stories = data?.stories || [];
  const isShowingDemo = isReady && !isAuthenticated;
  const displayStories = isShowingDemo ? demoStories : stories;

  return {
    stories: displayStories,
    isLoading: !isReady || (isAuthenticated && isLoading),
    isShowingDemo,
    error,
    mutate,
  };
}
