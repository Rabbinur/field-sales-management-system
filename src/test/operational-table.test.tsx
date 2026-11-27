import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { OperationalTable } from "@/components/shared/operational-table";
import { mockRecentOrders } from "@/lib/constants/mock-data";

describe("OperationalTable Component", () => {
  it("renders orders list with order numbers and retailer names", () => {
    const onSelect = vi.fn();
    render(<OperationalTable orders={mockRecentOrders} onSelectOrder={onSelect} />);

    expect(screen.getAllByText("ORD-2026-0842")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Prince Super Bazar")[0]).toBeInTheDocument();
  });

  it("filters orders by search term", () => {
    const onSelect = vi.fn();
    render(<OperationalTable orders={mockRecentOrders} onSelectOrder={onSelect} />);

    const searchInput = screen.getByPlaceholderText(/search by order/i);
    fireEvent.change(searchInput, { target: { value: "Bogura" } });

    expect(screen.getAllByText("ORD-2026-0838")[0]).toBeInTheDocument();
    expect(screen.queryByText("ORD-2026-0842")).not.toBeInTheDocument();
  });

  it("filters orders by operational status", () => {
    const onSelect = vi.fn();
    render(<OperationalTable orders={mockRecentOrders} onSelectOrder={onSelect} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "delivered" } });

    expect(screen.getAllByText("ORD-2026-0841")[0]).toBeInTheDocument();
    expect(screen.queryByText("ORD-2026-0842")).not.toBeInTheDocument();
  });

  it("sorts orders by total amount when Amount header is clicked", () => {
    const onSelect = vi.fn();
    render(<OperationalTable orders={mockRecentOrders} onSelectOrder={onSelect} pageSize={10} />);

    const amountHeader = screen.getByText("Amount (BDT)");
    fireEvent.click(amountHeader); // Ascending sort

    const rows = screen.getAllByText(/ORD-2026-/);
    // In ascending order, lowest amount is ORD-2026-0838 (8,900)
    expect(rows[0]).toHaveTextContent("ORD-2026-0838");

    fireEvent.click(amountHeader); // Descending sort
    const rowsDesc = screen.getAllByText(/ORD-2026-/);
    // In descending order, highest amount is ORD-2026-0839 (54,000)
    expect(rowsDesc[0]).toHaveTextContent("ORD-2026-0839");
  });

  it("displays empty state when no records match filter", () => {
    const onSelect = vi.fn();
    render(<OperationalTable orders={mockRecentOrders} onSelectOrder={onSelect} />);

    const searchInput = screen.getByPlaceholderText(/search by order/i);
    fireEvent.change(searchInput, { target: { value: "NonExistentStore123" } });

    expect(screen.getAllByText("No matching orders")[0]).toBeInTheDocument();
  });

  it("renders loading state when isLoading is true", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <OperationalTable orders={mockRecentOrders} onSelectOrder={onSelect} isLoading={true} />
    );

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error state when isError is true and handles retry callback", () => {
    const onSelect = vi.fn();
    const onRetry = vi.fn();

    render(
      <OperationalTable
        orders={mockRecentOrders}
        onSelectOrder={onSelect}
        isError={true}
        errorMessage="Custom connection failure"
        onRetry={onRetry}
      />
    );

    expect(screen.getByText("Unable to load orders")).toBeInTheDocument();
    expect(screen.getByText("Custom connection failure")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("paginates records properly based on pageSize", () => {
    const onSelect = vi.fn();
    render(<OperationalTable orders={mockRecentOrders} onSelectOrder={onSelect} pageSize={2} />);

    // Total orders: 5. Page size: 2. Total pages: 3.
    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getByText(/records/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();

    // Navigate to page 2
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
  });
});
