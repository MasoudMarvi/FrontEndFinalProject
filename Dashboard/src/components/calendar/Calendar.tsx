"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    location?: string;
    description?: string;
    category?: string;
    isFavorite: boolean;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const eventCategories = {
    Music: "danger",
    Technology: "success",
    Food: "primary",
    Art: "warning",
    Sports: "info",
    Education: "secondary",
  };

  useEffect(() => {
    setEvents([
      {
        id: "1",
        title: "Summer Music Festival",
        start: "2025-07-15",
        end: "2025-07-15",
        allDay: true,
        extendedProps: { 
          calendar: "Music", 
          location: "San Francisco",
          description: "Annual music festival featuring local and international artists",
          category: "Music",
          isFavorite: true
        },
      },
      {
        id: "2",
        title: "Tech Conference 2025",
        start: "2025-08-10",
        end: "2025-08-12",
        allDay: true,
        extendedProps: { 
          calendar: "Technology", 
          location: "San Francisco",
          description: "The biggest tech conference of the year",
          category: "Technology",
          isFavorite: true
        },
      },
      {
        id: "3",
        title: "Food & Wine Festival",
        start: "2025-09-05",
        end: "2025-09-07",
        allDay: true,
        extendedProps: { 
          calendar: "Food", 
          location: "Oakland",
          description: "Taste the best local cuisine and wines",
          category: "Food",
          isFavorite: true
        },
      },
      {
        id: "4",
        title: "Art Exhibition",
        start: "2025-06-20",
        end: "2025-06-25",
        allDay: true,
        extendedProps: { 
          calendar: "Art", 
          location: "San Jose",
          description: "Featuring works from local artists",
          category: "Art",
          isFavorite: true
        },
      },
      {
        id: "5",
        title: "Charity Marathon",
        start: "2025-05-30",
        end: "2025-05-30",
        allDay: true,
        extendedProps: { 
          calendar: "Sports", 
          location: "Berkeley",
          description: "Annual charity run supporting local causes",
          category: "Sports",
          isFavorite: true
        },
      },
    ]);
  }, []);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      extendedProps: {
        calendar: event.extendedProps.calendar,
        location: event.extendedProps.location,
        description: event.extendedProps.description,
        category: event.extendedProps.category,
        isFavorite: event.extendedProps.isFavorite
      }
    });
    openModal();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
        />
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          {selectedEvent && (
            <>
              <div>
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  {selectedEvent.title}
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedEvent.extendedProps.description}
                </p>
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(selectedEvent.start as string).toLocaleDateString()} 
                    {selectedEvent.end && selectedEvent.start !== selectedEvent.end && 
                      ` - ${new Date(selectedEvent.end as string).toLocaleDateString()}`
                    }
                  </span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedEvent.extendedProps.location}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedEvent.extendedProps.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end mt-6 gap-3">
                <button
                  onClick={closeModal}
                  type="button"
                  className="flex w-auto justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                  Close
                </button>
                <a
                  href={`/basic-tables`} // Link to My Events page
                  className="flex w-auto justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                >
                  View All Events
                </a>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  // Map category names to color classes
  const categoryColorMap: {[key: string]: string} = {
    'Music': 'danger',
    'Technology': 'success',
    'Food': 'primary',
    'Art': 'warning',
    'Sports': 'info',
    'Education': 'secondary'
  };
  
  const category = eventInfo.event.extendedProps.calendar;
  const colorClass = `fc-bg-${categoryColorMap[category]?.toLowerCase() || 'primary'}`;
  
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;