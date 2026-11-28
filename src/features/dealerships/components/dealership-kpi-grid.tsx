"use client";

import * as React from "react";
import { KPICard } from "@/components/shared/kpi-card";
import { KPICardData } from "@/types";
import { IDealership } from "@/types/dealership";

interface DealershipKPIGridProps {
  dealerships: IDealership[];
  totalCount?: number;
}

export function DealershipKPIGrid({
  dealerships,
  totalCount,
}: DealershipKPIGridProps) {
  const total = totalCount ?? dealerships.length;
  const activeCount = dealerships.filter((d) => d.status === "ACTIVE").length;
  const inactiveCount = dealerships.filter((d) => d.status === "INACTIVE").length;
  const suspendedCount = dealerships.filter((d) => d.status === "SUSPENDED").length;

  const kpis: KPICardData[] = [
    {
      title: "Total Dealerships",
      value: total.toString(),
      change: "100%",
      isPositive: true,
      trendText: "Registered Hubs",
      iconName: "Building2",
    },
    {
      title: "Active Hubs",
      value: activeCount.toString(),
      change: total > 0 ? `${Math.round((activeCount / total) * 100)}%` : "0%",
      isPositive: true,
      trendText: "Operational",
      iconName: "Store",
    },
    {
      title: "Inactive Hubs",
      value: inactiveCount.toString(),
      change: "0%",
      isPositive: true,
      trendText: "Dormant",
      iconName: "Clock",
    },
    {
      title: "Suspended Hubs",
      value: suspendedCount.toString(),
      change: suspendedCount > 0 ? `${suspendedCount}` : "0",
      isPositive: false,
      trendText: "Governance lock",
      iconName: "Users",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KPICard key={kpi.title} data={kpi} />
      ))}
    </div>
  );
}
