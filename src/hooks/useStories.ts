import useSWR from "swr";
import { useSession } from "next-auth/react";
import { demoStories, AIStory } from "@/data/demo";

const fetcher = (url: string) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r)));

export function useStories() {
  const { data: session, status } = useSession();
  const isReady = status !== "loading";
  const isAuthenticated = !!session;

  const { data, error, isLoading, mutate } = useSWR<{
    stories: AIStory[];
  }>(isReady && isAuthenticated ? "/api/stories" : null, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const stories = data?.stories || [];
  const isShowingDemo = isReady && (!isAuthenticated || (!isLoading && stories.length === 0));
  const displayStories = isShowingDemo ? demoStories : stories;

  return {
    stories: displayStories,
    isLoading: !isReady || (isAuthenticated && isLoading),
    isShowingDemo,
    error,
    mutate,
  };
}
