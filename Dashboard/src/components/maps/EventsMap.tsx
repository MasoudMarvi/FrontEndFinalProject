"use client";
import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';
import { useGoogleMaps } from '@/context/GoogleMapsContext';
import { getEvents, getEventsByCategory } from '@/lib/api/events';
import { getEventCategories } from '@/lib/api/eventCategories';
import { EventDto, EventCategoryDto } from '@/lib/api/types';

// Define the type for event data
interface MapEventData {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  startDateTime: string;
  endDateTime: string;
  category: string;
  categoryId: string;
  isPublic: boolean;
}

const containerStyle = {
  width: '100%',
  height: '500px'
};

// Default center on Tehran
const defaultCenter = {
  lat: 35.7219,
  lng: 51.3347
};

// Helper function to get pin color based on category
function getCategoryPinColor(category: string): string {
  const colorMap: Record<string, string> = {
    'Music': "red",
    'Technology': "blue", 
    'Food': "green",
    'Art': "purple",
    'Sports': "orange",
    'Conference': "yellow",
    'Workshop': "pink",
    'Meetup': "ltblue",
    'Festival': "green",
    'Exhibition': "purple"
  };
  
  // First check exact match
  if (colorMap[category]) {
    return colorMap[category];
  }
  
  // Check if the category contains any of the keys
  for (const [key, value] of Object.entries(colorMap)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return "gray"; // Default to gray
}

const EventsMap = () => {
  const { isLoaded } = useGoogleMaps();
  const [selectedEvent, setSelectedEvent] = useState<MapEventData | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');
  const [events, setEvents] = useState<MapEventData[]>([]);
  const [categories, setCategories] = useState<EventCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getEventCategories();
        setCategories(categoriesData);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError('Failed to load event categories');
      }
    };

    fetchCategories();
  }, []);

  // Fetch events whenever the selected category changes
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        let eventsData: EventDto[];
        
        if (selectedCategoryId === 'all') {
          eventsData = await getEvents();
        } else {
          eventsData = await getEventsByCategory(selectedCategoryId);
        }
        
        // Transform backend event data to the format our map component expects
        const mappedEvents: MapEventData[] = eventsData.map(event => ({
          id: event.eventId,
          title: event.title || 'Untitled Event',
          description: event.description || 'No description available',
          location: {
            lat: event.latitude,
            lng: event.longitude
          },
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          category: event.categoryName || 'Uncategorized',
          categoryId: event.categoryId,
          isPublic: event.isPublic
        }));
        
        setEvents(mappedEvents);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError('Failed to load events data');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategoryId]);

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value);
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
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}
      
      {isLoaded ? (
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
          {!loading && events.map(event => (
            <Marker
              key={event.id}
              position={event.location}
              onClick={() => setSelectedEvent(event)}
              // Use Google's built-in colored markers
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
                  {!selectedEvent.isPublic && (
                    <span className="inline-block ml-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Private
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(selectedEvent.startDateTime).toLocaleDateString()} - {new Date(selectedEvent.endDateTime).toLocaleDateString()}
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
      ) : (
        <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-4 px-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Categories:</span>
        {categories.map((category) => (
          <div key={category.categoryId} className="flex items-center gap-1">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ 
                backgroundColor: 
                  getCategoryPinColor(category.categoryName || '')
              }}
            ></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">{category.categoryName}</span>
          </div>
        ))}
      </div>
      
      {/* Loading indicator for events */}
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading events...</p>
        </div>
      )}
    </div>
  );
};

export default EventsMap;