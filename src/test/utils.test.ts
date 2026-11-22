import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatNumber, formatDateTime } from "@/lib/utils";

describe("Utility Functions", () => {
  it("cn merges class names properly and resolves conflicts", () => {
    const result = cn("px-2 py-1", "px-4", { "bg-blue-500": true, "text-white": false });
    expect(result).toBe("py-1 px-4 bg-blue-500");
  });

  it("formatCurrency formats BDT amounts with currency symbol", () => {
    const formatted = formatCurrency(15000);
    expect(formatted).toContain("15,000");
    expect(formatted).toContain("৳");
  });

  it("formatNumber formats values with thousands separator", () => {
    expect(formatNumber(1250000)).toBe("1,250,000");
  });

  it("formatDateTime formats valid date string", () => {
    const formatted = formatDateTime("2026-11-22T10:30:00Z");
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
  });
});
