import * as React from "react";
import {
  Building2,
  Users,
  Store,
  ShoppingBag,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { KPICardData } from "@/types";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Users,
  Store,
  ShoppingBag,
  Clock,
  TrendingUp,
};

interface KPICardProps {
  data: KPICardData;
}

export function KPICard({ data }: KPICardProps) {
  const Icon = iconMap[data.iconName] || TrendingUp;

  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {data.title}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-primary">
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {data.value}
          </div>
          <div className="flex items-center text-xs">
            <span
              className={cn(
                "inline-flex items-center font-medium mr-1.5",
                data.isPositive ? "text-emerald-600" : "text-amber-600"
              )}
            >
              {data.isPositive ? (
                <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
              )}
              {data.change}
            </span>
            <span className="text-muted-foreground truncate">{data.trendText}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
