"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';

// Sample event data (same as in EventChatComponent)
const sampleEvents = [
  {
    id: '1',
    title: 'Summer Music Festival',
    description: 'Annual music festival featuring local and international artists',
    location: { lat: 35.7219, lng: 51.3347 },
    date: '2025-07-15',
    category: 'Music'
  },
  // ... other events
];

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate fetching event details
    const currentEvent = sampleEvents.find(e => e.id === eventId);
    setEvent(currentEvent);
    setLoading(false);
  }, [eventId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Event not found</h1>
        <Link 
          href="/app/(admin)/user-dashboard" 
          className="text-brand-500 hover:text-brand-600"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <PageBreadCrumb title="Event Details" page="Event" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {event.title}
        </h1>
        
        <div className="mb-6">
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200 mr-2">
            {event.category}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {new Date(event.date).toLocaleDateString()}
          </span>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {event.description}
        </p>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Location
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Latitude: {event.location.lat}, Longitude: {event.location.lng}
          </p>
        </div>
        
        <div className="flex space-x-4">
          <Link 
            href={`/events/${eventId}/chat`}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            Join Chat
          </Link>
          
          <Link 
            href="/user-dashboard"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}