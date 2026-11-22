import * as React from "react";
import { KPICard } from "@/components/shared/kpi-card";
import { mockKPICards } from "@/lib/constants/mock-data";

export function KPIGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {mockKPICards.map((kpi, idx) => (
        <KPICard key={idx} data={kpi} />
      ))}
    </div>
  );
}
