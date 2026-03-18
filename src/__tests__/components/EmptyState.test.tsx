import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EmptyState from "@/components/ui/EmptyState";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState title="No events yet" description="Add your first memory to get started." />
    );
    expect(screen.getByText("No events yet")).toBeInTheDocument();
    expect(screen.getByText("Add your first memory to get started.")).toBeInTheDocument();
  });

  it("renders default description when empty string provided", () => {
    render(<EmptyState title="Empty" description="" />);
    expect(
      screen.getByText("Your story begins the moment you add your first memory.")
    ).toBeInTheDocument();
  });

  it("renders action button when actionLabel and onAction provided", () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No events"
        description="Start adding."
        actionLabel="Add Memory"
        onAction={onAction}
      />
    );
    const button = screen.getByText("Add Memory");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render action button when only actionLabel is provided without onAction", () => {
    render(
      <EmptyState title="No events" description="Start adding." actionLabel="Add Memory" />
    );
    expect(screen.queryByText("Add Memory")).not.toBeInTheDocument();
  });

  it("does not render action button when neither actionLabel nor onAction provided", () => {
    render(<EmptyState title="No events" description="Start adding." />);
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBe(0);
  });
});
