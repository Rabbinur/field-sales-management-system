"use client";

import * as React from "react";
import { Search, SlidersHorizontal, Eye } from "lucide-react";
import { Order } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { StatusBadge, ERPSyncBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface OperationalTableProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

export function OperationalTable({
  orders,
  onSelectOrder,
}: OperationalTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.retailerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.srName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.dealershipName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  return (
    <div className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order #, retailer, SR, dealer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-white px-3 py-1 text-xs text-slate-700 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Operational Statuses</option>
            <option value="new">Draft / New</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="assigned">Assigned to SR</option>
            <option value="in_transit">En Route</option>
            <option value="delivered">Delivered</option>
            <option value="offline_queued">Offline Queued</option>
          </select>

          <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
            Filters
          </Button>
        </div>
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50/80 border-b border-border text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4 text-left">Order Number</th>
              <th className="py-3 px-4 text-left">Retailer & Location</th>
              <th className="py-3 px-4 text-left">Assigned SR</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">ERP Sync</th>
              <th className="py-3 px-4 text-right">Amount (BDT)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 group-hover:text-primary">
                    {order.orderNumber}
                    <div className="text-[10px] font-normal text-muted-foreground font-sans">
                      {formatDateTime(order.createdAt)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{order.retailerName}</p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                      {order.retailerAddress}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">{order.srName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {order.dealershipName}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 px-4">
                    <ERPSyncBadge status={order.erpSyncStatus} />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-80 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(order);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-600" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8">
                  <EmptyState
                    title="No matching orders"
                    description="No operational orders match your search criteria or active filters."
                    actionLabel="Reset Search"
                    onAction={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Presentation */}
      <div className="md:hidden divide-y divide-border">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="p-4 space-y-2.5 active:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900">
                  {order.orderNumber}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {order.retailerName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {order.retailerAddress}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-[11px] text-muted-foreground">
                  SR: <span className="text-slate-700 font-medium">{order.srName}</span>
                </span>
                <span className="font-mono font-bold text-primary">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6">
            <EmptyState
              title="No matching orders"
              description="Adjust your search filters."
            />
          </div>
        )}
      </div>
    </div>
  );
}
