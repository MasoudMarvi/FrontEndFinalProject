import type { Metadata } from "next";
import React from "react";
import EventsMap from "@/components/maps/EventsMap";
import RecentEvents from "@/components/events/RecentEvents";

export const metadata: Metadata = {
  title: "User Dashboard - Event Management System",
  description: "Discover and manage events happening around you",
};

export default function UserDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
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