"use client";
import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';

// Define the type for event data
interface EventData {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  date: string;
  category: string;
}

// Sample event data
const sampleEvents: EventData[] = [
  {
    id: '1',
    title: 'Summer Music Festival',
    description: 'Annual music festival featuring local and international artists',
    location: { lat: 35.7219, lng: 51.3347 }, // Tehran
    date: '2025-07-15',
    category: 'Music'
  },
  {
    id: '2',
    title: 'Tech Conference 2025',
    description: 'The biggest tech conference of the year',
    location: { lat: 35.7246, lng: 51.3853 }, // Another location in Tehran
    date: '2025-08-10',
    category: 'Technology'
  },
  {
    id: '3',
    title: 'Food & Wine Festival',
    description: 'Taste the best local cuisine and wines',
    location: { lat: 35.7007, lng: 51.3947 }, // Another location in Tehran
    date: '2025-09-05',
    category: 'Food'
  },
  {
    id: '4',
    title: 'Art Exhibition',
    description: 'Featuring works from contemporary local artists',
    location: { lat: 35.7137, lng: 51.3898 }, // Another location in Tehran
    date: '2025-07-25',
    category: 'Art'
  },
  {
    id: '5',
    title: 'Charity Marathon',
    description: 'Annual charity run to support local causes',
    location: { lat: 35.7437, lng: 51.3587 }, // Another location in Tehran
    date: '2025-08-30',
    category: 'Sports'
  },
];

const containerStyle = {
  width: '100%',
  height: '500px'
};

// Default center on Tehran
const defaultCenter = {
  lat: 35.7219,
  lng: 51.3347
};

// Define available categories from the static data
const eventCategories = ['All Categories', 'Music', 'Technology', 'Food', 'Art', 'Sports'];

// Helper function to get pin color based on category
function getCategoryPinColor(category: string): string {
  const colorMap: Record<string, string> = {
    Music: "red",
    Technology: "blue", 
    Food: "green",
    Art: "purple",
    Sports: "orange",
  };
  
  return colorMap[category] || "gray"; // Default to gray
}

const EventsMap = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Filter events when category changes
  const filteredEvents = selectedCategory === 'All Categories'
    ? sampleEvents
    : sampleEvents.filter(event => event.category === selectedCategory);

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] mb-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Events Map
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Discover events happening near you
          </p>
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            {eventCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <LoadScript googleMapsApiKey="AIzaSyBhLrwCAC_nm31ET5JPCv7vw0I5nPDGeZQ">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={12}
          options={{
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          }}
        >
          {filteredEvents.map(event => (
            <Marker
              key={event.id}
              position={event.location}
              onClick={() => setSelectedEvent(event)}
              // Use Google's built-in colored markers instead of custom SVG
              icon={{
                url: `http://maps.google.com/mapfiles/ms/icons/${getCategoryPinColor(event.category)}-dot.png`
              }}
            />
          ))}

          {selectedEvent && (
            <InfoWindow
              position={selectedEvent.location}
              onCloseClick={() => setSelectedEvent(null)}
            >
              <div className="p-2 max-w-xs">
                <h4 className="font-bold text-gray-900">{selectedEvent.title}</h4>
                <p className="text-sm text-gray-700 mt-1">{selectedEvent.description}</p>
                <div className="flex items-center mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {selectedEvent.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </p>
                
                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <Link 
                    href={`/events/${selectedEvent.id}`}
                    className="flex-1 text-center text-xs font-medium text-white bg-brand-500 py-1.5 px-2 rounded hover:bg-brand-600"
                  >
                    View Details
                  </Link>
                  <Link 
                    href={`/events/${selectedEvent.id}/chat`}
                    className="flex-1 text-center text-xs font-medium text-white bg-green-600 py-1.5 px-2 rounded hover:bg-green-700"
                  >
                    <span className="flex items-center justify-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      Chat
                    </span>
                  </Link>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-4 px-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Categories:</span>
        {eventCategories.filter(cat => cat !== 'All Categories').map((category) => (
          <div key={category} className="flex items-center gap-1">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ 
                backgroundColor: 
                  category === 'Music' ? 'red' :
                  category === 'Technology' ? 'blue' :
                  category === 'Food' ? 'green' :
                  category === 'Art' ? 'purple' :
                  category === 'Sports' ? 'orange' : 'gray'
              }}
            ></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsMap;