import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CategoryChart from "@/components/insights/CategoryChart";
import CityChart from "@/components/insights/CityChart";
import YearChart from "@/components/insights/YearChart";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, role, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div role={role} {...props}>{children}</div>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
    line: (props: React.SVGProps<SVGLineElement>) => <line {...props} />,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("CategoryChart accessibility", () => {
  const categories = [
    { name: "Travel", count: 5, color: "rgba(255,255,255,0.8)" },
    { name: "Career", count: 3, color: "rgba(255,255,255,0.6)" },
  ];

  it("has role=img for screen readers", () => {
    render(<CategoryChart categories={categories} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("has descriptive aria-label with category data", () => {
    render(<CategoryChart categories={categories} />);
    const chart = screen.getByRole("img");
    expect(chart.getAttribute("aria-label")).toContain("Travel 5");
    expect(chart.getAttribute("aria-label")).toContain("Career 3");
  });

  it("renders category names and counts", () => {
    render(<CategoryChart categories={categories} />);
    expect(screen.getByText("Travel")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Career")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders heading", () => {
    render(<CategoryChart categories={categories} />);
    expect(screen.getByText("Events by Category")).toBeInTheDocument();
  });
});

describe("CityChart accessibility", () => {
  const data = [
    { city: "Boulder, CO", count: 7 },
    { city: "San Francisco", count: 3 },
  ];

  it("has role=img with descriptive aria-label", () => {
    render(<CityChart data={data} />);
    const chart = screen.getByRole("img");
    expect(chart.getAttribute("aria-label")).toContain("Boulder, CO 7");
    expect(chart.getAttribute("aria-label")).toContain("San Francisco 3");
  });

  it("renders city names", () => {
    render(<CityChart data={data} />);
    expect(screen.getByText("Boulder, CO")).toBeInTheDocument();
    expect(screen.getByText("San Francisco")).toBeInTheDocument();
  });
});

describe("YearChart accessibility", () => {
  const data = [
    { year: 2023, count: 6 },
    { year: 2024, count: 8 },
  ];

  it("has role=img with descriptive aria-label", () => {
    render(<YearChart data={data} />);
    const chart = screen.getByRole("img");
    expect(chart.getAttribute("aria-label")).toContain("2023 6");
    expect(chart.getAttribute("aria-label")).toContain("2024 8");
  });

  it("renders year labels and counts", () => {
    render(<YearChart data={data} />);
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });
});
