"use client";

import * as React from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Order } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { StatusBadge, ERPSyncBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type SortField = "orderNumber" | "retailerName" | "total" | "createdAt";
type SortOrder = "asc" | "desc";

interface OperationalTableProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  pageSize?: number;
}

export function OperationalTable({
  orders,
  onSelectOrder,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  pageSize = 5,
}: OperationalTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset to page 1 whenever search, filter, or sort changes
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // 1. Filter orders
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(term) ||
        order.retailerName.toLowerCase().includes(term) ||
        order.srName.toLowerCase().includes(term) ||
        order.dealershipName.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // 2. Sort filtered orders
  const sortedOrders = React.useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "orderNumber":
          comparison = a.orderNumber.localeCompare(b.orderNumber);
          break;
        case "retailerName":
          comparison = a.retailerName.localeCompare(b.retailerName);
          break;
        case "total":
          comparison = a.total - b.total;
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredOrders, sortField, sortOrder]);

  // 3. Paginate sorted orders
  const totalItems = sortedOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrders = React.useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedOrders.slice(startIndex, startIndex + pageSize);
  }, [sortedOrders, safeCurrentPage, pageSize]);

  const startIndexDisplay = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndexDisplay = Math.min(safeCurrentPage * pageSize, totalItems);

  // Helper for column sort indicator
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-slate-400 group-hover:text-slate-700" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary font-bold" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary font-bold" />
    );
  };

  return (
    <div className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order #, retailer, SR, dealer..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs"
            disabled={isLoading || isError}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            disabled={isLoading || isError}
            className="h-9 rounded-lg border border-border bg-white px-3 py-1 text-xs text-slate-700 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="all">All Operational Statuses</option>
            <option value="new">Draft / New</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="assigned">Assigned to SR</option>
            <option value="in_transit">En Route</option>
            <option value="delivered">Delivered</option>
            <option value="offline_queued">Offline Queued</option>
          </select>

          {(searchTerm || statusFilter !== "all" || sortField !== "createdAt" || sortOrder !== "desc") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setSortField("createdAt");
                setSortOrder("desc");
                setCurrentPage(1);
              }}
              className="h-9 text-xs text-muted-foreground hover:text-slate-900"
              title="Reset all filters and sorting"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}

          <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
            Filters
          </Button>
        </div>
      </div>

      {/* Main Table Container */}
      {isError ? (
        <div className="p-8">
          <ErrorState
            title="Unable to load orders"
            message={errorMessage || "An operational error occurred while reading the order records."}
            onRetry={onRetry}
          />
        </div>
      ) : isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: pageSize }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 w-full rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop / Tablet Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/80 border-b border-border text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th
                    className="py-3 px-4 text-left cursor-pointer select-none hover:bg-slate-100/60 transition-colors group"
                    onClick={() => handleSort("orderNumber")}
                  >
                    <div className="inline-flex items-center">
                      <span>Order Number</span>
                      {renderSortIcon("orderNumber")}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer select-none hover:bg-slate-100/60 transition-colors group"
                    onClick={() => handleSort("retailerName")}
                  >
                    <div className="inline-flex items-center">
                      <span>Retailer & Location</span>
                      {renderSortIcon("retailerName")}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">Assigned SR</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">ERP Sync</th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer select-none hover:bg-slate-100/60 transition-colors group"
                    onClick={() => handleSort("total")}
                  >
                    <div className="inline-flex items-center justify-end w-full">
                      <span>Amount (BDT)</span>
                      {renderSortIcon("total")}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
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
                          aria-label={`View details for ${order.orderNumber}`}
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
                        description="No operational orders match your search criteria or active status filter."
                        actionLabel="Reset Search & Filters"
                        onAction={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setCurrentPage(1);
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
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
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
                  actionLabel="Reset Filters"
                  onAction={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>

          {/* Table Pagination Footer */}
          {totalItems > 0 && (
            <div className="px-4 py-3 border-t border-border bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <div>
                Showing <strong className="text-slate-800">{startIndexDisplay}</strong> to{" "}
                <strong className="text-slate-800">{endIndexDisplay}</strong> of{" "}
                <strong className="text-slate-800">{totalItems}</strong> records
              </div>

              {totalPages > 1 && (
                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safeCurrentPage === 1}
                        className={safeCurrentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={pageNum === safeCurrentPage}
                            onClick={() => setCurrentPage(pageNum)}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage === totalPages}
                        className={safeCurrentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
