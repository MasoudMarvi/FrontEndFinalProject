"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '@/context/GoogleMapsContext';
import { getEventById } from '@/lib/api/events';
import { getEnvironmentalDataByEventId } from '@/lib/api/environmentalData';
import { EventDetailDto, EventStatus, EnvironmentalDataDto } from '@/lib/api/types';

// Default placeholder image when no images are available
const DEFAULT_IMAGE = '/images/event/event-01.jpg';

// Base URL for event images
const IMAGE_BASE_URL = 'https://localhost:7235/uploads/events/';

const containerStyle = {
  width: '100%',
  height: '300px'
};

// Environmental data type mapping
const getEnvironmentalTypeLabel = (type: number): string => {
  const typeMap: { [key: number]: string } = {
    0: 'Air Quality',
    1: 'Noise Level',
    2: 'Water Quality',
    3: 'Temperature',
    4: 'Humidity',
    5: 'Wind Speed',
    6: 'Other'
  };
  return typeMap[type] || `Type ${type}`;
};

// Get icon for environmental data type
const getEnvironmentalIcon = (type: number): string => {
  const iconMap: { [key: number]: string } = {
    0: '🌬️', // Air Quality
    1: '🔊', // Noise Level
    2: '💧', // WaterQuality
    3: '🌡️', // Temperature
    4: '💧', // Humidity
    5: '💨', // Wind Speed
    6: '📊', // Other
  };
  return iconMap[type] || '📈';
};

export default function EventDetailsPage() {
  const { isLoaded } = useGoogleMaps();
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<EventDetailDto | null>(null);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalDataDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [environmentalLoading, setEnvironmentalLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  
  // State for event images
  const [eventImages, setEventImages] = useState<string[]>([]);
  
  // Fetch event details and environmental data from backend
  useEffect(() => {
    async function fetchEventData() {
      try {
        setLoading(true);
        setError(null);
        
        // Get event details
        const eventData = await getEventById(eventId);
        setEvent(eventData);
        
        // Collect event images from backend
        const images: string[] = [];
        if (eventData.picture1) {
          images.push(`${IMAGE_BASE_URL}${eventData.picture1.replace(/^\/uploads\/events\//, '')}`);
        }
        if (eventData.picture2) {
          images.push(`${IMAGE_BASE_URL}${eventData.picture2.replace(/^\/uploads\/events\//, '')}`);
        }
        if (eventData.picture3) {
          images.push(`${IMAGE_BASE_URL}${eventData.picture3.replace(/^\/uploads\/events\//, '')}`);
        }
        
        // If no images are available, use default
        setEventImages(images.length > 0 ? images : [DEFAULT_IMAGE]);
        
      } catch (err: any) {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchEnvironmentalData() {
      try {
        setEnvironmentalLoading(true);
        const envData = await getEnvironmentalDataByEventId(eventId);
        setEnvironmentalData(envData);
      } catch (err: any) {
        console.error("Error fetching environmental data:", err);
        // Don't set error state for environmental data, just log it
      } finally {
        setEnvironmentalLoading(false);
      }
    }
    
    fetchEventData();
    fetchEnvironmentalData();
  }, [eventId]);
  
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatTimeForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const nextImage = () => {
    if (eventImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % eventImages.length);
    }
  };

  const prevImage = () => {
    if (eventImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + eventImages.length) % eventImages.length);
    }
  };

  const handleShareEvent = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 3000);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {error || "Event not found"}
        </h1>
        <Link 
          href="/events" 
          className="text-brand-500 hover:text-brand-600"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageBreadCrumb title="Event Details" page="Event" />
      
      {/* Success notification for copy */}
      {showCopySuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Event link copied to clipboard!
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">{event.title}</h1>
          </div>
          
          {/* Event Images Carousel - Using regular img tag instead of Next.js Image */}
          {eventImages.length > 0 ? (
            <div className="relative mb-6">
              <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden">
                <img
                  src={eventImages[currentImageIndex]}
                  alt={`${event.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image failed to load:", eventImages[currentImageIndex]);
                    (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                  }}
                />
                
                {/* Image navigation arrows - only show if there are multiple images */}
                {eventImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      aria-label="Next image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail indicators - only show if there are multiple images */}
              {eventImages.length > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  {eventImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 w-2 rounded-full ${
                        index === currentImageIndex 
                          ? 'bg-brand-500' 
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative h-64 w-full mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No images available</p>
            </div>
          )}
          
          {/* Event Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Description</h2>
            <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
          </div>
          
          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Category</h3>
              <p className="text-gray-800 dark:text-white/90">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  event.categoryName === 'Music' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  event.categoryName === 'Technology' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  event.categoryName === 'Food' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  event.categoryName === 'Art' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  event.categoryName === 'Sports' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {event.categoryName}
                </span>
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Date & Time</h3>
              <p className="text-gray-800 dark:text-white/90">
                {formatDateForDisplay(event.startDateTime)} • {formatTimeForDisplay(event.startDateTime)} - {formatTimeForDisplay(event.endDateTime)}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</h3>
              <p className="text-gray-800 dark:text-white/90">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  event.status === EventStatus.Active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  event.status === EventStatus.Pending ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {event.status === EventStatus.Active ? 'Active' : 
                   event.status === EventStatus.Pending ? 'Pending' : 'Cancelled'}
                </span>
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Visibility</h3>
              <p className="text-gray-800 dark:text-white/90">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  event.isPublic ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {event.isPublic ? 'Public' : 'Private'}
                </span>
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Organizer</h3>
              <p className="text-gray-800 dark:text-white/90">
                {event.creatorName || 'Unknown Organizer'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Location</h3>
              <p className="text-gray-800 dark:text-white/90">
                Coordinates: {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
              </p>
            </div>
          </div>
          
          {/* Location Map */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Location</h2>
            <div className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={{ lat: event.latitude, lng: event.longitude }}
                  zoom={14}
                >
                  <Marker position={{ lat: event.latitude, lng: event.longitude }} />
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <Link 
              href={`/events/${eventId}/chat`}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 inline-flex"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Join Chat ({event.chatMessageCount} messages)
            </Link>
          </div>
        </div>
        
        {/* Event Info Sidebar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Environmental Data Box */}
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <span className="mr-2">🌍</span>
                Environmental Data
              </h3>
              {environmentalLoading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-500"></div>
              )}
            </div>
            
            {environmentalLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
              </div>
            ) : environmentalData.length > 0 ? (
              <div className="space-y-3">
                {environmentalData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getEnvironmentalIcon(data.type)}</span>
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 block">
                          {getEnvironmentalTypeLabel(data.type)}
                        </span>
                        {data.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {data.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-800 dark:text-white">
                        {data.value}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        {data.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="text-4xl mb-2 block">🌱</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No environmental data available for this event
                </p>
              </div>
            )}
          </div>

          {/* Event Stats (Forum count removed) */}
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Event Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Chat Messages</span>
                <span className="font-medium text-gray-800 dark:text-white">{event.chatMessageCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Visibility</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  event.isPublic 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {event.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Images</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {(event.picture1 ? 1 : 0) + (event.picture2 ? 1 : 0) + (event.picture3 ? 1 : 0)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Event Actions for Regular Users */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Actions</h3>
            <div className="space-y-3">
              <Link 
                href={`/events/${eventId}/chat`}
                className="flex items-center w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Join Event Chat
              </Link>
              
              <button 
                className="flex items-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => window.print()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print Event Details
              </button>
              
              <button 
                className="flex items-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={handleShareEvent}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                Share Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out;
        }
      `}</style>
    </>
  );
}