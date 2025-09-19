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
import { getEvents } from "@/lib/api/events";
import { EventDto, EventStatus } from "@/lib/api/types";

interface FormattedEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  status: "Pending" | "Active" | "Cancelled";
  statusCode: EventStatus;
  image: string;
}

const DEFAULT_IMAGE = "/images/event/event-default.jpg";

const IMAGE_BASE_URL = 'https://localhost:7235/uploads/events/';

function getEventImage(event: EventDto): string {
  try {
    if (event.picture1 && event.picture1.trim() !== '') {
      return `${IMAGE_BASE_URL}${event.picture1.split('/').pop()}`;
    } 
    if (event.picture2 && event.picture2.trim() !== '') {
      return `${IMAGE_BASE_URL}${event.picture2.split('/').pop()}`;
    }
    if (event.picture3 && event.picture3.trim() !== '') {
      return `${IMAGE_BASE_URL}${event.picture3.split('/').pop()}`;
    }
  } catch (err) {
    console.error("Error processing image URL:", err);
  }
  
  return DEFAULT_IMAGE;
}

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
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getEvents();
        
        const now = new Date();
        
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
              image: getEventImage(event)
            };
          })
          .filter((event) => new Date(event.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        
        setEvents(formattedEvents);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load upcoming events");
        setLoading(false);
      }
    };

    fetchRecentEvents();
  }, []);

  const handleImageError = (eventId: string) => {
    setImageLoadError(prev => ({
      ...prev,
      [eventId]: true
    }));
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Upcoming Events
          </h3>
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
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Upcoming Events
          </h3>
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
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Upcoming Events
          </h3>
        </div>
        <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          <span>No upcoming events found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Upcoming Events
        </h3>
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
                        src={imageLoadError[event.id] ? DEFAULT_IMAGE : event.image}
                        onError={() => handleImageError(event.id)}
                        className="h-[50px] w-[50px] object-cover"
                        alt={event.title}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {event.title}
                      </p>
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