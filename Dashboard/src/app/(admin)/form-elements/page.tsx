import type { Metadata } from "next";
import React from "react";
import CreateEventForm from "@/components/events/CreateEventForm";

export const metadata: Metadata = {
  title: "Create Event - Event Management System",
  description: "Create a new event in the system",
};

export default function CreateEventPage() {
  return <CreateEventForm />;
}