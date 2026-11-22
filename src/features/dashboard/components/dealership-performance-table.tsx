import * as React from "react";
import { Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockDealershipPerformance } from "@/lib/constants/mock-data";
import { formatCurrency } from "@/lib/utils";

export function DealershipPerformanceTable() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-border bg-slate-50/50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-slate-900">
            Dealership Performance
          </CardTitle>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Top 5 Divisions
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/60 border-b border-border text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4 text-left">Dealership</th>
                <th className="py-2.5 px-3 text-center">Active SRs</th>
                <th className="py-2.5 px-3 text-right">Orders</th>
                <th className="py-2.5 px-4 text-right">Today Revenue</th>
                <th className="py-2.5 px-4 text-center">Target %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockDealershipPerformance.map((dlr) => (
                <tr key={dlr.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4">
                    <p className="font-semibold text-slate-900">{dlr.name}</p>
                    <p className="text-[10px] text-muted-foreground">{dlr.region}</p>
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-slate-700">
                    {dlr.activeSRs}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                    {dlr.todayOrders}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(dlr.revenue)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        dlr.completionRate >= 90
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {dlr.completionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
