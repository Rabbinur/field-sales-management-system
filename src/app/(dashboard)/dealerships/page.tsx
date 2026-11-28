import { Metadata } from "next";
import { DealershipsView } from "@/features/dealerships/components/dealerships-view";

export const metadata: Metadata = {
  title: "Dealerships Management | Field Sales Management System",
  description:
    "Multi-dealership operational management, regional facilities, and lifecycle governance.",
};

export default function DealershipsPage() {
  return <DealershipsView />;
}
