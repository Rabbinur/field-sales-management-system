"use client";

import * as React from "react";
import {
  X,
  Store,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Circle,
  ExternalLink,
  Printer,
  Info,
} from "lucide-react";
import { Order } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { StatusBadge, ERPSyncBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailDrawer({
  order,
  isOpen,
  onClose,
}: OrderDetailDrawerProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-border">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-slate-50/75">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-mono">
                  {order.orderNumber}
                </h2>
                <StatusBadge status={order.status} />
                <Badge variant="outline" className="text-[10px] uppercase font-semibold text-slate-600 bg-white">
                  Regular Order
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Created on {formatDateTime(order.createdAt)} • {order.dealershipName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Mock Data / Visual Pattern Disclaimer Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 text-xs">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-950">Visual Design Pattern Demo</p>
                <p className="text-[11px] text-blue-800/80 mt-0.5">
                  Demonstration layout for future order details. Timeline events and ERP sync tags represent simulated fixtures and will connect to live transactional services in Phase 8.
                </p>
              </div>
            </div>

            {/* Quick Actions & Sync Status Placeholder */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">ERP Integration Status:</span>
                <ERPSyncBadge status={order.erpSyncStatus} />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Printer className="mr-1 h-3 w-3" />
                  Print Voucher
                </Button>
              </div>
            </div>

            {/* Stakeholder Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Retail Outlet */}
              <div className="rounded-lg border border-border p-3.5 space-y-2">
                <div className="flex items-center text-xs font-semibold text-slate-900 gap-1.5">
                  <Store className="h-4 w-4 text-primary" />
                  <span>Retailer / Outlet</span>
                </div>
                <div className="text-xs space-y-1 text-slate-600">
                  <p className="font-semibold text-slate-900">{order.retailerName}</p>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{order.retailerAddress}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{order.retailerPhone}</span>
                  </p>
                </div>
              </div>

              {/* Sales Representative */}
              <div className="rounded-lg border border-border p-3.5 space-y-2">
                <div className="flex items-center text-xs font-semibold text-slate-900 gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  <span>Sales Representative (SR)</span>
                </div>
                <div className="text-xs space-y-1 text-slate-600">
                  <p className="font-semibold text-slate-900">{order.srName}</p>
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{order.srPhone}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Assigned Field Route • Beat Schedule
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Order Items ({order.itemCount} items)
              </h3>
              {order.items.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-border text-slate-500">
                      <tr>
                        <th className="py-2 px-3 text-left font-medium">SKU / Product</th>
                        <th className="py-2 px-3 text-right font-medium">Qty</th>
                        <th className="py-2 px-3 text-right font-medium">Wholesale Price</th>
                        <th className="py-2 px-3 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {order.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3">
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {item.sku}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-medium">{item.quantity}</td>
                          <td className="py-2 px-3 text-right text-slate-600 font-mono">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-900 font-mono">
                            {formatCurrency(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground p-3 bg-slate-50 rounded-lg border border-dashed">
                  No line items currently attached to this order.
                </p>
              )}

              {/* Financial Totals */}
              <div className="mt-3 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax / VAT:</span>
                    <span className="font-mono">{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-border pt-1.5">
                    <span>Total Amount:</span>
                    <span className="font-mono text-primary">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipday-Inspired Vertical Order Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Operational Milestone Timeline
                </h3>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Simulated Lifecycle
                </span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {order.timeline.map((event, idx) => (
                  <div key={idx} className="relative group">
                    <span
                      className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-4 ring-white ${
                        event.completed
                          ? "text-emerald-600"
                          : event.active
                          ? "text-blue-600 animate-pulse"
                          : "text-slate-300"
                      }`}
                    >
                      {event.completed ? (
                        <CheckCircle2 className="h-5 w-5 fill-emerald-100" />
                      ) : (
                        <Circle className="h-4 w-4 stroke-[2.5]" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-slate-900">
                            {event.title}
                          </p>
                          {event.completed && (
                            <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">
                              Completed
                            </span>
                          )}
                          {event.active && (
                            <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1 rounded">
                              Current
                            </span>
                          )}
                          {!event.completed && !event.active && (
                            <span className="text-[9px] font-medium text-slate-400">
                              Pending
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {event.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border px-6 py-3.5 bg-slate-50/75 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Dismiss
            </Button>
            <Button size="sm" variant="outline">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Full Order View (Phase 8)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
