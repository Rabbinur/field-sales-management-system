import * as React from "react";
import { PieChart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function OrderStatusDistribution() {
  const statuses = [
    { label: "Delivered", count: 780, percentage: 61, color: "bg-emerald-500", text: "text-emerald-700" },
    { label: "En Route", count: 284, percentage: 22, color: "bg-indigo-500", text: "text-indigo-700" },
    { label: "Assigned", count: 112, percentage: 9, color: "bg-sky-500", text: "text-sky-700" },
    { label: "Pending", count: 67, percentage: 5, color: "bg-amber-500", text: "text-amber-700" },
    { label: "Offline Queued", count: 41, percentage: 3, color: "bg-cyan-500", text: "text-cyan-700" },
  ];

  return (
    <Card>
      <CardHeader className="p-4 border-b border-border bg-slate-50/50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-slate-900">
            Order Status Breakdown
          </CardTitle>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          1,284 Today
        </span>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Progress Bar Stack */}
        <div className="h-2.5 w-full rounded-full bg-slate-100 flex overflow-hidden">
          {statuses.map((s, idx) => (
            <div
              key={idx}
              className={`${s.color} h-full transition-all`}
              style={{ width: `${s.percentage}%` }}
              title={`${s.label}: ${s.percentage}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
          {statuses.map((s, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs">
              <span className={`h-2 w-2 rounded-full ${s.color}`} />
              <span className="text-slate-600 truncate">{s.label}:</span>
              <strong className="text-slate-900 font-mono">{s.count}</strong>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
