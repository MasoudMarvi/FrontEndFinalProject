"use client";
import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

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

// Sample event data (replace with your API call later)
const sampleEvents: EventData[] = [
  {
    id: '1',
    title: 'Summer Music Festival',
    description: 'Annual music festival featuring local and international artists',
    location: { lat: 37.7749, lng: -122.4194 }, // San Francisco
    date: '2025-07-15',
    category: 'Music'
  },
  {
    id: '2',
    title: 'Tech Conference 2025',
    description: 'The biggest tech conference of the year',
    location: { lat: 37.7833, lng: -122.4167 }, // San Francisco Downtown
    date: '2025-08-10',
    category: 'Technology'
  },
  {
    id: '3',
    title: 'Food & Wine Festival',
    description: 'Taste the best local cuisine and wines',
    location: { lat: 37.8044, lng: -122.2712 }, // Oakland
    date: '2025-09-05',
    category: 'Food'
  },
];

const containerStyle = {
  width: '100%',
  height: '500px'
};

// Default center on Tehran (as per your coordinates)
const defaultCenter = {
  lat: 35.7219,
  lng: 51.3347
};

const EventsMap = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  
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
      </div>
      
      <LoadScript googleMapsApiKey="AIzaSyBhLrwCAC_nm31ET5JPCv7vw0I5nPDGeZQ">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={12} // Increased zoom level for better road visibility
        >
          {sampleEvents.map(event => (
            <Marker
              key={event.id}
              position={event.location}
              onClick={() => setSelectedEvent(event)}
            />
          ))}

          {selectedEvent && (
            <InfoWindow
              position={selectedEvent.location}
              onCloseClick={() => setSelectedEvent(null)}
            >
              <div className="p-2">
                <h4 className="font-bold text-gray-900">{selectedEvent.title}</h4>
                <p className="text-sm text-gray-700 mt-1">{selectedEvent.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.category}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default EventsMap;