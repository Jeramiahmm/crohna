import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-chrono-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl font-display font-bold text-chrono-muted/20 mb-4">
          404
        </div>
        <h2 className="text-xl font-display font-light text-chrono-text mb-2">
          Page not found
        </h2>
        <p className="text-sm font-body font-light text-chrono-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-8 py-3 text-sm font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-colors duration-500"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
