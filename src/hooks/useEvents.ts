import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
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

  const [extraEvents, setExtraEvents] = useState<TimelineEvent[]>([]);
  const [extraCursor, setExtraCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  const events = [...(data?.events || []), ...extraEvents];
  const nextCursor = extraCursor !== undefined ? extraCursor : data?.nextCursor;
  const isShowingDemo = isReady && !isAuthenticated;
  const displayEvents = isShowingDemo ? demoEvents : events;

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || isShowingDemo) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/events?limit=${limit}&cursor=${nextCursor}`);
      if (res.ok) {
        const result = await res.json();
        if (result?.events) {
          setExtraEvents((prev) => [...prev, ...result.events]);
          setExtraCursor(result.nextCursor || undefined);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, isShowingDemo, limit]);

  // Reset extra pages when base data changes
  const resetMutate = useCallback((...args: Parameters<typeof mutate>) => {
    setExtraEvents([]);
    setExtraCursor(undefined);
    return mutate(...args);
  }, [mutate]);

  return {
    events: displayEvents,
    nextCursor,
    isLoading: !isReady || (isAuthenticated && isLoading),
    loadingMore,
    isShowingDemo,
    error,
    mutate: resetMutate,
    loadMore,
  };
}
