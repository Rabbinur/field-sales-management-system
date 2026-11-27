"use client";

import * as React from "react";
import { KPIGrid } from "./kpi-grid";
import { OperationalTable } from "@/components/shared/operational-table";
import { OrderDetailDrawer } from "@/components/shared/order-detail-drawer";
import { MapPlaceholder } from "@/components/shared/map-placeholder";
import { DealershipPerformanceTable } from "./dealership-performance-table";
import { FieldActivitiesFeed } from "./field-activities-feed";
import { OrderStatusDistribution } from "./order-status-distribution";
import { mockRecentOrders } from "@/lib/constants/mock-data";
import { Order } from "@/types";

export function DashboardView() {
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards */}
      <section aria-label="Operational Key Metrics">
        <KPIGrid />
      </section>

      {/* 2. Dispatch Map & Field Telemetry Overview (Shipday Style) */}
      <section aria-label="Dispatch Operations Map" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapPlaceholder />
        </div>
        <div className="space-y-6">
          <OrderStatusDistribution />
          <FieldActivitiesFeed />
        </div>
      </section>

      {/* 3. Operational Orders Table & Dealership Leaderboard */}
      <section aria-label="Live Orders & Dealership Performance" className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Operational Orders Stream
              </h2>
              <p className="text-xs text-muted-foreground">
                Demonstration order stream with interactive search, status filtering, column sorting, pagination, and slide-over order drawer.
              </p>
            </div>
          </div>
          <OperationalTable
            orders={mockRecentOrders}
            onSelectOrder={handleSelectOrder}
          />
        </div>

        <DealershipPerformanceTable />
      </section>

      {/* Detailed Order View Pattern (Slide-Over Drawer) */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
