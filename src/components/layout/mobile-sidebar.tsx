"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
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
  LucideIcon,
} from "lucide-react";
import { navigationSections } from "@/lib/constants/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileMenuOpen } from "@/store/ui-slice";
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

export function MobileSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.mobileMenuOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-300 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200 border-r border-slate-800">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md">
              FS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">FieldSales Pro</span>
              <span className="text-[10px] text-slate-400">Mother Company Ops</span>
            </div>
          </div>

          <button
            onClick={() => dispatch(setMobileMenuOpen(false))}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
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
                    onClick={() => dispatch(setMobileMenuOpen(false))}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 text-slate-400" />
                    <span className="flex-1 truncate">{item.title}</span>
                    {item.badge && (
                      <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
