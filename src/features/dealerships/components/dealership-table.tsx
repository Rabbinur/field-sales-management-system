"use client";

import * as React from "react";
import {
  Building2,
  MapPin,
  Phone,
  User,
  ExternalLink,
  Edit2,
  ShieldAlert,
} from "lucide-react";
import { IDealership } from "@/types/dealership";
import { UserRole } from "@/types/auth";
import { DealershipStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DealershipTableProps {
  dealerships: IDealership[];
  userRole?: UserRole;
  onViewDetails: (dealership: IDealership) => void;
  onEdit: (dealership: IDealership) => void;
  onChangeStatus?: (dealership: IDealership) => void;
}

export function DealershipTable({
  dealerships,
  userRole,
  onViewDetails,
  onEdit,
  onChangeStatus,
}: DealershipTableProps) {
  const isMotherAdmin = userRole === "MOTHER_COMPANY_ADMIN";
  const isDealerAdmin = userRole === "DEALERSHIP_ADMIN";
  const canEdit = isMotherAdmin || isDealerAdmin;
  const canChangeStatus = isMotherAdmin;

  if (dealerships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-border shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <Building2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          No Dealerships Found
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          No distribution hubs match your current filter or query criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" data-testid="dealerships-table">
            <thead className="border-b border-border bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Dealership</th>
                <th className="px-4 py-3.5">Code / ERP</th>
                <th className="px-4 py-3.5">Region & City</th>
                <th className="px-4 py-3.5">Contact Person</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {dealerships.map((dealership) => (
                <tr
                  key={dealership.dealershipId}
                  className="transition-colors hover:bg-slate-50/50"
                  data-testid={`dealership-row-${dealership.dealershipId}`}
                >
                  {/* Dealership Name & Legal Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
                        {dealership.code.slice(-2)}
                      </div>
                      <div>
                        <button
                          onClick={() => onViewDetails(dealership)}
                          className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left"
                        >
                          {dealership.name}
                        </button>
                        {dealership.legalName && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {dealership.legalName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Code & ERP Reference */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <Badge variant="outline" className="font-mono text-xs font-semibold">
                        {dealership.code}
                      </Badge>
                      {dealership.erpDealershipCode ? (
                        <p className="text-[11px] text-muted-foreground font-mono">
                          ERP: {dealership.erpDealershipCode}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No ERP link</p>
                      )}
                    </div>
                  </td>

                  {/* Region & District */}
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{dealership.region}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-5">
                        {dealership.city}, {dealership.district}
                      </p>
                    </div>
                  </td>

                  {/* Contact Person & Phone */}
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{dealership.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{dealership.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <DealershipStatusBadge status={dealership.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(dealership)}
                        title="View Details"
                        className="h-8 px-2 text-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Details
                      </Button>

                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(dealership)}
                          title="Edit Dealership"
                          className="h-8 px-2 text-xs"
                          data-testid={`edit-btn-${dealership.dealershipId}`}
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}

                      {canChangeStatus && onChangeStatus && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onChangeStatus(dealership)}
                          title="Change Lifecycle Status"
                          className="h-8 px-2 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                          data-testid={`status-btn-${dealership.dealershipId}`}
                        >
                          <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                          Status
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {dealerships.map((dealership) => (
          <div
            key={dealership.dealershipId}
            className="rounded-xl border border-border bg-white p-4 shadow-xs space-y-3"
            data-testid={`dealership-card-${dealership.dealershipId}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs font-semibold">
                    {dealership.code}
                  </Badge>
                  <DealershipStatusBadge status={dealership.status} />
                </div>
                <h4 className="font-semibold text-slate-900 mt-1.5">
                  {dealership.name}
                </h4>
                {dealership.legalName && (
                  <p className="text-xs text-muted-foreground">
                    {dealership.legalName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Region
                </span>
                <span className="text-slate-800 font-medium">
                  {dealership.region} ({dealership.city})
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Contact
                </span>
                <span className="text-slate-800 font-medium truncate block">
                  {dealership.contactPerson}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(dealership)}
                className="h-8 text-xs"
              >
                Details
              </Button>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(dealership)}
                  className="h-8 text-xs"
                >
                  Edit
                </Button>
              )}
              {canChangeStatus && onChangeStatus && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChangeStatus(dealership)}
                  className="h-8 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                >
                  Status
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
