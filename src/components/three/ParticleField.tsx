"use client";

export default function ParticleField() {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-chrono-accent/3 rounded-full blur-[120px] animate-float" />
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-chrono-accent-warm/3 rounded-full blur-[100px] animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-chrono-muted/2 rounded-full blur-[80px] animate-float"
        style={{ animationDelay: "4s" }}
      />
    </div>
  );
}
