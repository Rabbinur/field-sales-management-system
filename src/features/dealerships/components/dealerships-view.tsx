"use client";

import * as React from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Shield,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { IDealership } from "@/types/dealership";
import { DealershipKPIGrid } from "./dealership-kpi-grid";
import { DealershipTable } from "./dealership-table";
import { CreateDealershipDialog } from "./create-dealership-dialog";
import { EditDealershipDialog } from "./edit-dealership-dialog";
import { StatusTransitionDialog } from "./status-transition-dialog";
import { DealershipDetailsDrawer } from "./dealership-details-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DealershipsView() {
  const currentUser = useAppSelector((state) => state.ui.currentUser);

  const [dealerships, setDealerships] = React.useState<IDealership[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [pageSize] = React.useState(10);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Dialog / Drawer states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingDealership, setEditingDealership] = React.useState<IDealership | null>(null);
  const [statusModalDealership, setStatusModalDealership] = React.useState<IDealership | null>(null);
  const [selectedDrawerDealership, setSelectedDrawerDealership] = React.useState<IDealership | null>(null);

  const isSuperAdmin = currentUser?.role === "SOFTWARE_SUPER_ADMIN";
  const isMotherAdmin = currentUser?.role === "MOTHER_COMPANY_ADMIN";

  const fetchDealerships = React.useCallback(async () => {
    if (isSuperAdmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      params.set("page", currentPage.toString());
      params.set("limit", pageSize.toString());

      const res = await fetch(`/api/dealerships?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load dealerships");
      }

      setDealerships(data.data || []);
      if (data.pagination) {
        setTotalCount(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred loading distribution hubs.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, currentPage, pageSize, isSuperAdmin]);

  React.useEffect(() => {
    fetchDealerships();
  }, [fetchDealerships]);

  // Handle created dealership
  const handleDealershipCreated = (newDealer: IDealership) => {
    setDealerships((prev) => [newDealer, ...prev]);
    setTotalCount((prev) => prev + 1);
  };

  // Handle updated dealership
  const handleDealershipUpdated = (updated: IDealership) => {
    setDealerships((prev) =>
      prev.map((d) => (d.dealershipId === updated.dealershipId ? updated : d))
    );
    if (selectedDrawerDealership?.dealershipId === updated.dealershipId) {
      setSelectedDrawerDealership(updated);
    }
  };

  // If user is SOFTWARE_SUPER_ADMIN, show the strict infrastructure isolation boundary
  if (isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Dealership & Distribution Hubs
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Multi-dealership network governance and operational facility management.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-8 text-center max-w-2xl mx-auto space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mx-auto">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Infrastructure Role Isolation Boundary
            </h2>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              As a <strong>SOFTWARE_SUPER_ADMIN</strong>, your permissions are strictly limited to system diagnostics, infrastructure health, and configuration maintenance. Commercial dealership records and operational sales hubs are isolated under commercial governance (Mother Company Admin).
            </p>
          </div>
          <div className="pt-2 text-xs text-muted-foreground">
            To view or govern dealerships, sign in using an authorized <strong>MOTHER_COMPANY_ADMIN</strong> or <strong>DEALERSHIP_ADMIN</strong> account.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Dealership & Distribution Hubs
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Govern multi-dealership facilities, territorial jurisdictions, and operational contacts.
          </p>
        </div>

        {isMotherAdmin && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-9 gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            data-testid="btn-register-dealership"
          >
            <Plus className="h-4 w-4" />
            Register Dealership
          </Button>
        )}
      </div>

      {/* KPI Metrics Summary */}
      <section aria-label="Dealership Network Overview">
        <DealershipKPIGrid dealerships={dealerships} totalCount={totalCount} />
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by hub name, code (e.g. DLR-DHK-01)..."
            className="pl-9 h-9 text-xs"
            data-testid="input-dealership-search"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center rounded-lg border border-border p-1 bg-slate-50 text-xs">
            {["ALL", "ACTIVE", "INACTIVE", "SUSPENDED"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md font-semibold transition-colors text-xs ${
                  statusFilter === st
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-muted-foreground hover:text-slate-900"
                }`}
                data-testid={`filter-status-${st.toLowerCase()}`}
              >
                {st === "ALL" ? "All Hubs" : st}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDealerships()}
            disabled={isLoading}
            className="h-9 px-2.5 text-xs"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Content: Table or Loading */}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-2">
          <AlertTriangle className="h-6 w-6 text-red-600 mx-auto" />
          <h3 className="text-sm font-semibold text-red-900">
            Failed to load dealerships
          </h3>
          <p className="text-xs text-red-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDealerships()}
            className="mt-2 text-xs"
          >
            Try Again
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-border">
          <Loader2 className="h-7 w-7 text-blue-600 animate-spin mb-2" />
          <p className="text-xs font-medium text-slate-600">
            Loading distribution hubs...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <DealershipTable
            dealerships={dealerships}
            userRole={currentUser?.role}
            onViewDetails={(d) => setSelectedDrawerDealership(d)}
            onEdit={(d) => setEditingDealership(d)}
            onChangeStatus={(d) => setStatusModalDealership(d)}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 text-xs text-muted-foreground">
              <div>
                Showing page <span className="font-semibold text-slate-900">{currentPage}</span> of{" "}
                <span className="font-semibold text-slate-900">{totalPages}</span> ({totalCount} total hubs)
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className="h-8 px-2.5 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages || isLoading}
                  className="h-8 px-2.5 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Modals and Drawers */}
      <CreateDealershipDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleDealershipCreated}
      />

      <EditDealershipDialog
        isOpen={!!editingDealership}
        dealership={editingDealership}
        userRole={currentUser?.role}
        onClose={() => setEditingDealership(null)}
        onUpdated={handleDealershipUpdated}
      />

      <StatusTransitionDialog
        isOpen={!!statusModalDealership}
        dealership={statusModalDealership}
        onClose={() => setStatusModalDealership(null)}
        onStatusChanged={handleDealershipUpdated}
      />

      <DealershipDetailsDrawer
        isOpen={!!selectedDrawerDealership}
        dealership={selectedDrawerDealership}
        onClose={() => setSelectedDrawerDealership(null)}
      />
    </div>
  );
}
