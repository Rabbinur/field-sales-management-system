"use client";

import * as React from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Shield,
  Building,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleMobileMenu, setSelectedDealership } from "@/store/ui-slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AuthUserDTO, UserRole } from "@/types/auth";

interface TopNavProps {
  pageTitle?: string;
  breadcrumbPage?: string;
  currentUser?: AuthUserDTO | null;
}

function getRoleLabel(role?: UserRole): string {
  switch (role) {
    case "SOFTWARE_SUPER_ADMIN":
      return "Super Admin";
    case "MOTHER_COMPANY_ADMIN":
      return "Mother Co. Admin";
    case "DEALERSHIP_ADMIN":
      return "Dealer Admin";
    case "SALES_REPRESENTATIVE":
      return "Sales Rep";
    default:
      return "Central Ops";
  }
}

function getInitials(name?: string): string {
  if (!name) return "AD";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TopNav({
  pageTitle = "Operational Overview",
  breadcrumbPage = "Dashboard",
  currentUser: initialUser,
}: TopNavProps) {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.ui.currentUser);
  const selectedDealership = useAppSelector(
    (state) => state.ui.selectedDealership
  );

  const user = initialUser || reduxUser;
  const role = user?.role;
  const isSR = role === "SALES_REPRESENTATIVE";
  const isDealerAdmin = role === "DEALERSHIP_ADMIN";
  const isSuperAdmin = role === "SOFTWARE_SUPER_ADMIN";
  const isMotherAdmin = role === "MOTHER_COMPANY_ADMIN";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-white px-4 sm:px-6 shadow-2xs">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleMobileMenu())}
          className="md:hidden h-9 w-9 text-slate-700"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden sm:flex flex-col">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Field Operations</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumbPage}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Center: Global Search UI Placeholder */}
      <div className="hidden lg:flex items-center w-72 relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search orders, retailers, SRs... (Press /)"
          className="pl-8 h-8 text-xs bg-slate-50 border-slate-200 focus-visible:bg-white"
        />
      </div>

      {/* Right: Operational Status, Dealership Switcher, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Environment Status Indicator (Live Authenticated Session) */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Phase 2 • Authenticated Session</span>
        </div>

        {/* Tenant Dealership Context */}
        {isSR || isDealerAdmin ? (
          // SR & Dealership Admin: Locked to their assigned dealership
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Building className="h-3.5 w-3.5 text-blue-600" />
            <span>Dhaka Central (dlr-1)</span>
            <span className="text-[10px] text-slate-400 font-normal ml-0.5">
              [Assigned]
            </span>
          </div>
        ) : isSuperAdmin ? (
          // Super Admin: Infrastructure Diagnostics Mode (No Commercial Dealership Scope)
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
            <Shield className="h-3.5 w-3.5 text-amber-600" />
            <span>Infrastructure Scope (No Commercial Access)</span>
          </div>
        ) : isMotherAdmin ? (
          // Mother Company Admin: Can switch only among authorized dealerships
          <div className="flex items-center">
            <select
              value={selectedDealership}
              onChange={(e) => dispatch(setSelectedDealership(e.target.value))}
              className="h-8 rounded-lg border border-border bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Select authorized dealership"
            >
              <option value="all">All Authorized Hubs</option>
              <option value="dlr-1">Dhaka Central (dlr-1)</option>
              <option value="dlr-2">Chittagong Port (dlr-2)</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center">
            <select
              value={selectedDealership}
              onChange={(e) => dispatch(setSelectedDealership(e.target.value))}
              className="h-8 rounded-lg border border-border bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Dealerships</option>
              <option value="dlr-1">Dhaka Central</option>
            </select>
          </div>
        )}

        {/* Notification Bell */}
        <Button
          variant="outline"
          size="icon"
          className="relative h-8 w-8 text-slate-600 border-border"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
            3
          </span>
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 pl-2 pr-1 h-8 rounded-lg hover:bg-slate-100"
              aria-label="User account menu"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {user?.name || "Operations User"}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  {getRoleLabel(user?.role)}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-xs">
              <p className="font-semibold text-slate-900">{user?.name || "Admin User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email || "admin@field-sales.test"}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200">
                  {getRoleLabel(user?.role)}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">
              Account Security
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              Permissions & Scope
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-xs text-red-600 font-medium cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
