import * as React from "react";
import { Activity, MapPin, CheckCircle, CreditCard, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockFieldActivities } from "@/lib/constants/mock-data";

export function FieldActivitiesFeed() {
  return (
    <Card>
      <CardHeader className="p-4 border-b border-border bg-slate-50/50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <CardTitle className="text-sm font-bold text-slate-900">
            Recent Field Telemetry
          </CardTitle>
        </div>
        <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          ● Live Stream
        </span>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3.5">
          {mockFieldActivities.map((act) => {
            const getIcon = () => {
              switch (act.type) {
                case "checkin":
                  return <MapPin className="h-3.5 w-3.5 text-blue-600" />;
                case "payment":
                  return <CreditCard className="h-3.5 w-3.5 text-emerald-600" />;
                case "order":
                  return <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />;
                case "alert":
                  return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
              }
            };

            return (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                  {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 leading-snug">
                    <strong className="text-slate-900 font-semibold">{act.srName}</strong>{" "}
                    {act.action}{" "}
                    <span className="font-semibold text-slate-900">{act.target}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    {act.timestamp} • {act.location}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
