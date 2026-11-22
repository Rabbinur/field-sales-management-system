import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* KPI Skeleton Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl bg-slate-200/80" />
        ))}
      </div>

      {/* Map & Feeds Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[340px] rounded-xl bg-slate-200/80" />
        <Skeleton className="h-[340px] rounded-xl bg-slate-200/80" />
      </div>

      {/* Table Skeleton */}
      <Skeleton className="h-80 rounded-xl bg-slate-200/80" />
    </div>
  );
}
