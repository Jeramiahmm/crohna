import useSWR from "swr";
import { useSession } from "next-auth/react";
import { demoEvents, TimelineEvent } from "@/data/demo";

const fetcher = (url: string) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r)));

export function useEvents(limit = 50) {
  const { data: session, status } = useSession();
  const isReady = status !== "loading";
  const isAuthenticated = !!session;

  const { data, error, isLoading, mutate } = useSWR<{
    events: TimelineEvent[];
    nextCursor?: string;
  }>(isReady && isAuthenticated ? `/api/events?limit=${limit}` : null, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const events = data?.events || [];
  // Only show demo data for unauthenticated users. Authenticated users with zero events
  // should see the empty state, not demo data (to avoid confusion).
  const isShowingDemo = isReady && !isAuthenticated;
  const displayEvents = isShowingDemo ? demoEvents : events;

  return {
    events: displayEvents,
    nextCursor: data?.nextCursor,
    isLoading: !isReady || (isAuthenticated && isLoading),
    isShowingDemo,
    error,
    mutate,
  };
}
