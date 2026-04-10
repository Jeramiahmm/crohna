"use client";

export default function MapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen pt-24 pb-32 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-display font-bold text-chrono-text mb-4">
          Something went wrong
        </h2>
        <p className="text-sm font-body font-light text-chrono-muted mb-6">
          {error.message || "Failed to load the map. Please try again."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 text-sm font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
