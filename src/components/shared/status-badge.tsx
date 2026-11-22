import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { OrderStatus, ERPSyncStatus } from "@/types";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "new":
      return (
        <Badge variant="secondary" className={className}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-slate-500" />
          Draft / New
        </Badge>
      );
    case "pending_approval":
      return (
        <Badge variant="warning" className={className}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending Review
        </Badge>
      );
    case "assigned":
      return (
        <Badge variant="info" className={className}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-sky-500" />
          Assigned to SR
        </Badge>
      );
    case "in_transit":
      return (
        <Badge variant="transit" className={className}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          En Route
        </Badge>
      );
    case "delivered":
      return (
        <Badge variant="success" className={className}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Delivered
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="destructive" className={className}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          Cancelled
        </Badge>
      );
    case "offline_queued":
      return (
        <Badge variant="offline" className={className}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500" />
          Offline Queued
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
}

export function ERPSyncBadge({ status }: { status: ERPSyncStatus }) {
  switch (status) {
    case "synced":
      return (
        <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <span className="mr-1 h-1 w-1 rounded-full bg-emerald-500" />
          ERP Synced
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <span className="mr-1 h-1 w-1 rounded-full bg-amber-500" />
          Sync Pending
        </span>
      );
    case "conflict":
      return (
        <span className="inline-flex items-center text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
          <span className="mr-1 h-1 w-1 rounded-full bg-red-500" />
          Sync Conflict
        </span>
      );
    default:
      return null;
  }
}
