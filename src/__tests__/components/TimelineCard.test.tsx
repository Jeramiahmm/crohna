import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TimelineCard from "@/components/timeline/TimelineCard";
import { TimelineEvent } from "@/data/demo";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const baseEvent: TimelineEvent = {
  id: "test-1",
  title: "Started College",
  date: "2024-08-20",
  location: "Boulder, CO",
  description: "Began my journey at CU Boulder.",
  category: "education",
  source: "manual",
};

describe("TimelineCard", () => {
  it("renders event title", () => {
    render(<TimelineCard event={baseEvent} index={0} />);
    expect(screen.getByText("Started College")).toBeInTheDocument();
  });

  it("renders event location", () => {
    render(<TimelineCard event={baseEvent} index={0} />);
    expect(screen.getByText("Boulder, CO")).toBeInTheDocument();
  });

  it("renders formatted date", () => {
    render(<TimelineCard event={baseEvent} index={0} />);
    expect(screen.getByText(/August 20, 2024/)).toBeInTheDocument();
  });

  it("renders event description", () => {
    render(<TimelineCard event={baseEvent} index={0} />);
    expect(screen.getByText("Began my journey at CU Boulder.")).toBeInTheDocument();
  });

  it("renders category badge when image is present", () => {
    const eventWithImage = { ...baseEvent, imageUrl: "https://example.com/photo.jpg" };
    render(<TimelineCard event={eventWithImage} index={0} />);
    expect(screen.getByText("education")).toBeInTheDocument();
  });

  it("renders season label", () => {
    render(<TimelineCard event={baseEvent} index={0} />);
    expect(screen.getByText("Summer")).toBeInTheDocument();
  });

  it("renders image when imageUrl is provided", () => {
    const eventWithImage = { ...baseEvent, imageUrl: "https://example.com/photo.jpg" };
    render(<TimelineCard event={eventWithImage} index={0} />);
    const img = screen.getByAltText("Started College");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
  });

  it("resolves gphotos:// URLs to proxy URLs", () => {
    const eventWithGphotos = { ...baseEvent, imageUrl: "gphotos://ABC123" };
    render(<TimelineCard event={eventWithGphotos} index={0} />);
    const img = screen.getByAltText("Started College");
    expect(img).toHaveAttribute("src", "/api/google/photos/proxy?id=ABC123");
  });

  it("does not render image when imageUrl is absent", () => {
    const eventNoImage = { ...baseEvent };
    delete eventNoImage.imageUrl;
    render(<TimelineCard event={eventNoImage} index={0} />);
    expect(screen.queryByAltText("Started College")).not.toBeInTheDocument();
  });

  it("renders edit button when onEdit is provided", () => {
    const onEdit = vi.fn();
    const eventWithImage = { ...baseEvent, imageUrl: "https://example.com/photo.jpg" };
    render(<TimelineCard event={eventWithImage} index={0} onEdit={onEdit} />);
    // Edit button exists (it's hidden via CSS opacity, but still in DOM)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("does not render edit button when onEdit is not provided", () => {
    render(<TimelineCard event={baseEvent} index={0} />);
    expect(screen.queryAllByRole("button").length).toBe(0);
  });

  it("renders source badge for non-manual sources when image is present", () => {
    const calendarEvent = { ...baseEvent, source: "calendar", imageUrl: "https://example.com/photo.jpg" };
    render(<TimelineCard event={calendarEvent} index={0} />);
    expect(screen.getByText("calendar")).toBeInTheDocument();
  });

  it("does not render source badge for manual events", () => {
    const manualEvent = { ...baseEvent, source: "manual", imageUrl: "https://example.com/photo.jpg" };
    render(<TimelineCard event={manualEvent} index={0} />);
    // "manual" should not appear as a source badge
    const manualBadges = screen.queryAllByText("manual");
    expect(manualBadges.length).toBe(0);
  });

  it("handles event without optional fields gracefully", () => {
    const minimalEvent: TimelineEvent = {
      id: "test-minimal",
      title: "Minimal Event",
      date: "2024-01-01",
    };
    render(<TimelineCard event={minimalEvent} index={0} />);
    expect(screen.getByText("Minimal Event")).toBeInTheDocument();
    // No location separator should appear
    expect(screen.queryByText("/")).not.toBeInTheDocument();
  });
});
