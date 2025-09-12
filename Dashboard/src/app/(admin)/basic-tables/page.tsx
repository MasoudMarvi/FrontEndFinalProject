import type { Metadata } from "next";
import React from "react";
import MyEventsList from "@/components/events/MyEventsList";

export const metadata: Metadata = {
  title: "My Events - Event Management System",
  description: "View and manage your favorite events",
};

export default function MyEventsPage() {
  return <MyEventsList />;
}