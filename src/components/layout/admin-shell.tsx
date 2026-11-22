"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { TopNav } from "@/components/layout/top-nav";

interface AdminShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  breadcrumbPage?: string;
}

export function AdminShell({
  children,
  pageTitle,
  breadcrumbPage,
}: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Collapsible Left Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Navigation */}
      <MobileSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav pageTitle={pageTitle} breadcrumbPage={breadcrumbPage} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
