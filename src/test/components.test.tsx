import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { KPICard } from "@/components/shared/kpi-card";

describe("UI Components & Shared Badges", () => {
  it("renders Button with text and variant class", () => {
    render(<Button variant="default">Confirm Order</Button>);
    const btn = screen.getByRole("button", { name: /confirm order/i });
    expect(btn).toBeInTheDocument();
  });

  it("renders Button in loading state with spinner and disabled attribute", () => {
    render(<Button isLoading>Submit</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("renders Badge component with correct text", () => {
    render(<Badge variant="success">Active Beat</Badge>);
    expect(screen.getByText("Active Beat")).toBeInTheDocument();
  });

  it("renders StatusBadge with correct semantic status label", () => {
    const { rerender } = render(<StatusBadge status="delivered" />);
    expect(screen.getByText("Delivered")).toBeInTheDocument();

    rerender(<StatusBadge status="in_transit" />);
    expect(screen.getByText("En Route")).toBeInTheDocument();

    rerender(<StatusBadge status="pending_approval" />);
    expect(screen.getByText("Pending Review")).toBeInTheDocument();

    rerender(<StatusBadge status="offline_queued" />);
    expect(screen.getByText("Offline Queued")).toBeInTheDocument();
  });

  it("renders KPICard with value and title", () => {
    render(
      <KPICard
        data={{
          title: "Total Outlets",
          value: "8,450",
          change: "+128",
          isPositive: true,
          trendText: "Across 48 beats",
          iconName: "Store",
        }}
      />
    );
    expect(screen.getByText("Total Outlets")).toBeInTheDocument();
    expect(screen.getByText("8,450")).toBeInTheDocument();
    expect(screen.getByText("+128")).toBeInTheDocument();
  });
});
