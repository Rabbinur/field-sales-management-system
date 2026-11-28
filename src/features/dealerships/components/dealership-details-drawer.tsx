"use client";

import * as React from "react";
import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  History,
} from "lucide-react";
import { IDealership } from "@/types/dealership";
import { DealershipStatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

interface DealershipDetailsDrawerProps {
  dealership: IDealership | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DealershipDetailsDrawer({
  dealership,
  isOpen,
  onClose,
}: DealershipDetailsDrawerProps) {
  if (!isOpen || !dealership) return null;

  const statusHistory = dealership.metadata?.statusHistory || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-border">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-slate-50/75">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {dealership.name}
                </h2>
                <Badge variant="outline" className="font-mono text-xs font-semibold">
                  {dealership.code}
                </Badge>
                <DealershipStatusBadge status={dealership.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                ID: <span className="font-mono">{dealership.dealershipId}</span> • {dealership.region} Hub
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

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Identity & Tenancy Box */}
            <div className="rounded-xl border border-border bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Tenancy & Legal Entity</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Legal Name</span>
                  <span className="font-semibold text-slate-900">
                    {dealership.legalName || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Tenant Business ID</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {dealership.businessId}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Mother ERP Code</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {dealership.erpDealershipCode || "None (Unlinked)"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Registered On</span>
                  <span className="font-semibold text-slate-900">
                    {dealership.createdAt ? formatDateTime(dealership.createdAt) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <User className="h-4 w-4 text-blue-600" />
                <span>Primary Operational Contact</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <User className="h-3.5 w-3.5" />
                    <span>Contact Name</span>
                  </div>
                  <p className="font-semibold text-slate-900">{dealership.contactPerson}</p>
                </div>

                <div className="rounded-lg border border-border p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Phone Number</span>
                  </div>
                  <p className="font-semibold text-slate-900">{dealership.phone}</p>
                </div>

                <div className="rounded-lg border border-border p-3 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Official Email</span>
                  </div>
                  <p className="font-semibold text-slate-900">{dealership.email}</p>
                </div>
              </div>
            </div>

            {/* Location & Jurisdiction */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Facility Location & Jurisdiction</span>
              </div>
              <div className="rounded-lg border border-border p-4 space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Physical Address</span>
                  <p className="font-medium text-slate-900">{dealership.address}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">City</span>
                    <span className="font-semibold text-slate-900">{dealership.city}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">District</span>
                    <span className="font-semibold text-slate-900">{dealership.district}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Region</span>
                    <span className="font-semibold text-slate-900">{dealership.region}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <History className="h-4 w-4 text-blue-600" />
                <span>Governance & Status Audit Trail</span>
              </div>

              {statusHistory.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No lifecycle transitions recorded yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {statusHistory.map((item: any, idx: number) => (
                    <div key={idx} className="relative space-y-1">
                      <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <span className="font-mono text-slate-500">{item.from}</span>
                          <span>→</span>
                          <span className="font-mono text-blue-700">{item.to}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {item.changedAt ? formatDateTime(item.changedAt) : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
                        "{item.reason || "No reason documented"}"
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Authorized by: <span className="font-mono">{item.changedBy}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
