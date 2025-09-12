import Calendar from "@/components/calendar/Calendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "My Event Calendar - Event Management System",
  description: "View your favorite events on a calendar",
};

export default function CalendarPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Event Calendar" />
      <div className="mb-6">
        <p className="text-gray-500 dark:text-gray-400">
          View all your favorite events on the calendar. Click on an event to see more details.
        </p>
      </div>
      <Calendar />
    </div>
  );
}