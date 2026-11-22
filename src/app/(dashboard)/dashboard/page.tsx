import { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard Overview",
  description: "Real-time field operations, live orders, and dealership performance",
};

export default function DashboardPage() {
  return <DashboardView />;
}
