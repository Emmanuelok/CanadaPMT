import type { Metadata } from "next";
import { HostDashboard } from "@/components/host/dashboard/HostDashboard";

export const metadata: Metadata = {
  title: "Owner dashboard — MapleHaus Host",
  description:
    "A live view of your managed short-term rentals: payouts, occupancy, upcoming bookings, cleanings and maintenance — all in one place.",
};

export default function HostDashboardPage() {
  return <HostDashboard />;
}
