"use client";

import * as React from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
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

interface TopNavProps {
  pageTitle?: string;
  breadcrumbPage?: string;
}

export function TopNav({
  pageTitle = "Operational Overview",
  breadcrumbPage = "Dashboard",
}: TopNavProps) {
  const dispatch = useAppDispatch();
  const selectedDealership = useAppSelector((state) => state.ui.selectedDealership);

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
        {/* Environment Status Indicator (Explicit UI Mock) */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span>UI Mock Shell • Phase 1</span>
        </div>

        {/* Dealership Selector Placeholder (UI Mock Only) */}
        <div className="flex items-center">
          <select
            value={selectedDealership}
            onChange={(e) => dispatch(setSelectedDealership(e.target.value))}
            className="h-8 rounded-lg border border-border bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Dealership tenant selector (UI mock for Phase 1)"
          >
            <option value="all">All Dealerships (UI Preview)</option>
            <option value="dlr-1">Dhaka Central (Mock Tenant)</option>
            <option value="dlr-2">Chittagong Port (Mock Tenant)</option>
            <option value="dlr-3">Dhaka North (Mock Tenant)</option>
            <option value="dlr-4">Sylhet Valley (Mock Tenant)</option>
          </select>
        </div>

        {/* Notification Bell Placeholder */}
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

        {/* User Profile Dropdown Placeholder */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 pl-2 pr-1 h-8 rounded-lg hover:bg-slate-100"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200">
                AD
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  Admin User
                </span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  Central Ops
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-xs">
              <p className="font-semibold text-slate-900">Operations Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">
                admin@mothercompany-erp.com
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Dealership Matrix</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Security & API Keys</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-red-600 font-medium">
              Sign Out (Session Mock)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
