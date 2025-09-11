import type { Metadata } from "next";
import React from "react";
import EventsMap from "@/components/maps/EventsMap";
import RecentEvents from "@/components/events/RecentEvents";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";

export const metadata: Metadata = {
  title: "Admin Dashboard - Event Management System",
  description: "Manage events and users in your system",
};

export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Admin Metrics - Keep some metrics for admin */}
      <div className="col-span-12">
        <EcommerceMetrics />
      </div>
      
      {/* Full-width Map */}
      <div className="col-span-12">
        <EventsMap />
      </div>

      {/* Recent Events */}
      <div className="col-span-12">
        <RecentEvents />
      </div>
    </div>
  );
}