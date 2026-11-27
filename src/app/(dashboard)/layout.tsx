import * as React from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAuthContext } from "@/lib/auth/context";
import { AuthUserDTO } from "@/types/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/login");
  }

  const currentUser: AuthUserDTO = {
    id: auth.user.id,
    name: auth.user.name,
    email: auth.user.email,
    status: auth.user.status,
    role: auth.role,
    dealershipId: auth.membership.dealershipId,
    allowedDealershipIds: auth.membership.allowedDealershipIds,
  };

  return <AdminShell currentUser={currentUser}>{children}</AdminShell>;
}
