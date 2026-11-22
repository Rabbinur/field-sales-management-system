"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Clock,
  Sparkles,
  MapPin,
  Building2,
  Users2,
  Store,
  Package,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";
import { navigationSections } from "@/lib/constants/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/ui-slice";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ShoppingBag,
  Clock,
  Sparkles,
  MapPin,
  Building2,
  Users2,
  Store,
  Package,
  BarChart3,
  Bell,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-all duration-300 z-30 shrink-0",
        isCollapsed ? "w-18" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
              FS
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-white truncate">
                FieldSales Pro
              </span>
              <span className="text-[10px] font-medium text-slate-400 truncate">
                Mother Company Ops
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md">
            FS
          </div>
        )}

        <button
          onClick={() => dispatch(toggleSidebar())}
          className={cn(
            "rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors",
            isCollapsed && "mx-auto mt-2"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && section.title && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {section.title}
              </h4>
            )}

            {section.items.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors relative",
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )}
                  />

                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.title}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                        isActive
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 text-blue-400 border border-slate-700"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}

                  {!isCollapsed && item.isPlaceholder && (
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info Box */}
      {!isCollapsed && (
        <div className="border-t border-slate-800 p-3 m-3 rounded-xl bg-slate-800/60 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Multi-Dealership Scope</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Isolated tenant database with Central ERP synchronization.
          </p>
        </div>
      )}
    </aside>
  );
}
