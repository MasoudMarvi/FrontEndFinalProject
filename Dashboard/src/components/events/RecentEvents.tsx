"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { getEvents } from "@/lib/api/events";
import { EventDto, EventStatus } from "@/lib/api/types";

// Define the TypeScript interface for our formatted event data
interface FormattedEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  status: "Pending" | "Active" | "Cancelled";
  statusCode: EventStatus;
  image: string;
}

// Placeholder image for events without images
const DEFAULT_IMAGE = "/images/event/event-default.jpg";

// Base URL for event images - use the full URL to your API
const IMAGE_BASE_URL = 'https://localhost:7235/uploads/events/';

// Helper function to get the first available image from an event
function getEventImage(event: EventDto): string {
  if (event.picture1) {
    // Try to use the first picture from the event
    try {
      // Clean up the path to avoid duplication
      const cleanPath = event.picture1.replace(/^\/uploads\/events\//, '');
      return cleanPath ? `${IMAGE_BASE_URL}${cleanPath}` : DEFAULT_IMAGE;
    } catch (err) {
      return DEFAULT_IMAGE;
    }
  } else if (event.picture2) {
    try {
      const cleanPath = event.picture2.replace(/^\/uploads\/events\//, '');
      return cleanPath ? `${IMAGE_BASE_URL}${cleanPath}` : DEFAULT_IMAGE;
    } catch (err) {
      return DEFAULT_IMAGE;
    }
  } else if (event.picture3) {
    try {
      const cleanPath = event.picture3.replace(/^\/uploads\/events\//, '');
      return cleanPath ? `${IMAGE_BASE_URL}${cleanPath}` : DEFAULT_IMAGE;
    } catch (err) {
      return DEFAULT_IMAGE;
    }
  }
  return DEFAULT_IMAGE;
}

// Helper function to map EventStatus to display status
function getStatusDisplay(status: EventStatus): "Pending" | "Active" | "Cancelled" {
  switch (status) {
    case EventStatus.Pending:
      return "Pending";
    case EventStatus.Active:
      return "Active";
    case EventStatus.Cancelled:
      return "Cancelled";
    default:
      return "Pending";
  }
}

// Helper function to map status to badge color
function getStatusColor(status: EventStatus): "success" | "warning" | "info" | "error" {
  switch (status) {
    case EventStatus.Pending:
      return "warning";
    case EventStatus.Active:
      return "success";
    case EventStatus.Cancelled:
      return "error";
    default:
      return "info";
  }
}

export default function RecentEvents() {
  const [events, setEvents] = useState<FormattedEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        setLoading(true);
        // Get events from backend, limit to 5
        const eventsData = await getEvents();
        
        // Format the events data
        const formattedEvents: FormattedEvent[] = eventsData
          .map((event: EventDto) => {
            return {
              id: event.eventId,
              title: event.title || "Untitled Event",
              category: event.categoryName || "Uncategorized",
              date: new Date(event.startDateTime).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              }),
              status: getStatusDisplay(event.status),
              statusCode: event.status,
              // Use the first available image or default
              image: getEventImage(event)
            };
          })
          // Sort by date (newest first)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          // Limit to 5 events
          .slice(0, 5);
        
        setEvents(formattedEvents);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load recent events");
        setLoading(false);
      }
    };

    fetchRecentEvents();
  }, []);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Events
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-500"></div>
          <span className="ml-2 text-gray-500 dark:text-gray-400">Loading events...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Events
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 text-red-500">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Events
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          <span>No events found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Events
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Event
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Category
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {events.map((event) => (
              <TableRow key={event.id} className="">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md relative">
                      <img
                        src={DEFAULT_IMAGE}
                        className="h-[50px] w-[50px] object-cover"
                        alt={event.title}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {event.title}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {event.id}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {event.date}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.category === 'Music' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    event.category === 'Technology' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    event.category === 'Food' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    event.category === 'Art' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    event.category === 'Sports' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {event.category}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={getStatusColor(event.statusCode)}
                  >
                    {event.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}