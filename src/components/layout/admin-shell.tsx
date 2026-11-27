"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { AuthUserDTO } from "@/types/auth";
import { useAppDispatch } from "@/store/hooks";
import { setCurrentUser } from "@/store/ui-slice";

interface AdminShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  breadcrumbPage?: string;
  currentUser?: AuthUserDTO | null;
}

export function AdminShell({
  children,
  pageTitle,
  breadcrumbPage,
  currentUser,
}: AdminShellProps) {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (currentUser) {
      dispatch(setCurrentUser(currentUser));
    }
  }, [currentUser, dispatch]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Collapsible Left Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Navigation */}
      <MobileSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav
          pageTitle={pageTitle}
          breadcrumbPage={breadcrumbPage}
          currentUser={currentUser}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
