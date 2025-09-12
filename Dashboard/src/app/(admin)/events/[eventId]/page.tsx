"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Image from 'next/image';

// Enhanced sample event data with multiple images
const sampleEvents = [
  {
    id: '1',
    title: 'Summer Music Festival',
    description: 'Annual music festival featuring local and international artists across multiple stages. Join us for a day of great music, food, and fun activities for all ages.',
    location: { 
      name: 'City Park',
      lat: 35.7219, 
      lng: 51.3347 
    },
    date: '2025-07-15',
    time: '14:00',
    endTime: '23:00',
    category: 'Music',
    images: [
      '/images/event/event-01.jpg',
      '/images/event/event-01.jpg',
      '/images/event/event-01.jpg',
    ],
    isPublic: true,
    organizer: 'John Smith',
    environmentalData: {
      airQuality: {
        value: 42,
        status: 'Good'
      },
      temperature: {
        value: 28,
        unit: 'C',
        status: 'Moderate'
      },
      noise: {
        value: 76,
        unit: 'dB',
        status: 'High'
      },
      lastUpdated: '2023-09-11T14:32:00Z'
    }
  },
  {
    id: '2',
    title: 'Tech Conference 2025',
    description: 'The biggest tech conference of the year featuring industry leaders, workshops, and networking opportunities.',
    location: { 
      name: 'Convention Center',
      lat: 35.7246, 
      lng: 51.3853 
    },
    date: '2025-08-10',
    time: '09:00',
    endTime: '18:00',
    category: 'Technology',
    images: [
      '/images/event/event-02.jpg',
      '/images/event/event-02.jpg',
    ],
    isPublic: true,
    organizer: 'Sarah Johnson',
    environmentalData: null
  },
];

// Placeholder images for development (you can replace these with your actual images)
const placeholderImages = [
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80',
];

const containerStyle = {
  width: '100%',
  height: '300px'
};

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEnvDataModalOpen, setIsEnvDataModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Simulate fetching event details
    const currentEvent = sampleEvents.find(e => e.id === eventId);
    
    // Use the actual event data if found, otherwise create a placeholder with ID
    const eventData = currentEvent || {
      id: eventId,
      title: 'Event not found',
      description: 'This event may have been deleted or does not exist.',
      location: { lat: 0, lng: 0 },
      date: new Date().toISOString().split('T')[0],
      category: 'Unknown',
      images: [],
    };
    
    // If we're in development and the event has no images, use placeholders
    if (process.env.NODE_ENV === 'development' && (!eventData.images || eventData.images.length === 0)) {
      eventData.images = placeholderImages;
    }
    
    setEvent(eventData);
    setEditForm(eventData);
    setLoading(false);
  }, [eventId]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm) {
      // In a real app, you would upload the images to a server here
      // For now, we'll just update the local state
      setEvent({
        ...editForm,
        // Only update images if new ones were selected
        images: newImageFiles.length > 0 
          ? newImageFiles.map(file => URL.createObjectURL(file)) 
          : editForm.images
      });
      setIsEditModalOpen(false);
      setNewImageFiles([]);
    }
  };

  const handleEnvDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm && editForm.environmentalData) {
      setEvent({
        ...event,
        environmentalData: editForm.environmentalData
      });
      setIsEnvDataModalOpen(false);
    }
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newImageFiles.length > 0) {
      // In a real app, you would upload the images to a server here
      // For now, we'll just update the local state with object URLs
      const newImageUrls = newImageFiles.map(file => URL.createObjectURL(file));
      
      setEvent({
        ...event,
        images: [...(event.images || []), ...newImageUrls]
      });
      
      setIsImagesModalOpen(false);
      setNewImageFiles([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    if (editForm && editForm.images) {
      const updatedImages = [...editForm.images];
      updatedImages.splice(index, 1);
      setEditForm({
        ...editForm,
        images: updatedImages
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      
      if (subChild) {
        setEditForm(prev => {
          if (!prev) return null;
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: {
                ...prev[parent][child],
                [subChild]: value
              }
            }
          };
        });
      } else {
        setEditForm(prev => {
          if (!prev) return null;
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: value
            }
          };
        });
      }
    } else {
      setEditForm(prev => {
        if (!prev) return null;
        return { ...prev, [name]: value };
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const nextImage = () => {
    if (event?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }
  };

  const prevImage = () => {
    if (event?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
    }
  };
  
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
          href="/admin-dashboard" 
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">{event.title}</h1>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-sm px-3 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
              >
                Edit Event
              </button>
              <button 
                onClick={() => setIsEnvDataModalOpen(true)}
                className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {event.environmentalData ? 'Edit Environmental Data' : 'Add Environmental Data'}
              </button>
            </div>
          </div>
          
          {/* Event Images Carousel */}
          {event.images && event.images.length > 0 ? (
            <div className="relative mb-6">
              <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden">
                <Image
                  src={event.images[currentImageIndex]}
                  alt={`${event.title} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                />
                
                {/* Image navigation arrows */}
                {event.images.length > 1 && (
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
              
              {/* Thumbnail indicators */}
              {event.images.length > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  {event.images.map((_, index) => (
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
              
              {/* Manage Images Button */}
              <button
                onClick={() => setIsImagesModalOpen(true)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-lg text-xs flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Manage Images
              </button>
            </div>
          ) : (
            <div className="relative h-64 w-full mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No images available</p>
              <button
                onClick={() => setIsImagesModalOpen(true)}
                className="px-3 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm"
              >
                Add Images
              </button>
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
                  event.category === 'Music' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  event.category === 'Technology' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  event.category === 'Food' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  event.category === 'Art' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  event.category === 'Sports' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {event.category}
                </span>
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Date & Time</h3>
              <p className="text-gray-800 dark:text-white/90">
                {new Date(event.date).toLocaleDateString()} • {event.time || '00:00'} - {event.endTime || '00:00'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Location</h3>
              <p className="text-gray-800 dark:text-white/90">
                {event.location.name || 'Unnamed Location'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Organizer</h3>
              <p className="text-gray-800 dark:text-white/90">
                {event.organizer || 'Unknown Organizer'}
              </p>
            </div>
          </div>
          
          {/* Location Map */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Location</h2>
            <LoadScript googleMapsApiKey="AIzaSyBhLrwCAC_nm31ET5JPCv7vw0I5nPDGeZQ">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={{ lat: event.location.lat, lng: event.location.lng }}
                zoom={14}
              >
                <Marker position={{ lat: event.location.lat, lng: event.location.lng }} />
              </GoogleMap>
            </LoadScript>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Coordinates: {event.location.lat}, {event.location.lng}
            </p>
          </div>
          
          <div className="mt-6 flex space-x-4">
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
              href="/admin-dashboard"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        {/* Environmental Data Sidebar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Environmental Data</h2>
            <button 
              onClick={() => setIsEnvDataModalOpen(true)}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {event.environmentalData ? 'Edit' : 'Add'}
            </button>
          </div>
          
          {event.environmentalData ? (
            <div className="space-y-4">
              {/* Air Quality */}
              {event.environmentalData.airQuality && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Air Quality Index</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.environmentalData.airQuality.status === 'Good' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      event.environmentalData.airQuality.status === 'Moderate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {event.environmentalData.airQuality.status}
                    </span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white/90">
                      {event.environmentalData.airQuality.value}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">AQI</span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        event.environmentalData.airQuality.status === 'Good' ? 'bg-green-500' :
                        event.environmentalData.airQuality.status === 'Moderate' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} 
                      style={{ width: `${Math.min(event.environmentalData.airQuality.value, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Temperature */}
              {event.environmentalData.temperature && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.environmentalData.temperature.status === 'Good' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      event.environmentalData.temperature.status === 'Moderate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {event.environmentalData.temperature.status}
                    </span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white/90">
                      {event.environmentalData.temperature.value}°{event.environmentalData.temperature.unit}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">Current</span>
                  </div>
                </div>
              )}
              
              {/* Noise Level */}
              {event.environmentalData.noise && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Noise Level</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.environmentalData.noise.status === 'Low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      event.environmentalData.noise.status === 'Moderate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {event.environmentalData.noise.status}
                    </span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white/90">
                      {event.environmentalData.noise.value} {event.environmentalData.noise.unit}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        event.environmentalData.noise.status === 'Low' ? 'bg-green-500' :
                        event.environmentalData.noise.status === 'Moderate' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} 
                      style={{ width: `${Math.min((event.environmentalData.noise.value / 120) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Last Updated */}
              {event.environmentalData.lastUpdated && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(event.environmentalData.lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No environmental data available for this event</p>
              <button 
                onClick={() => setIsEnvDataModalOpen(true)}
                className="px-3 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm"
              >
                Add Environmental Data
              </button>
            </div>
          )}
          
          {/* Event Actions */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Admin Actions</h3>
            <div className="space-y-2">
              <button 
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium transition rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete Event
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Event Modal */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Edit Event</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editForm.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editForm.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={editForm.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                >
                  <option value="Music">Music</option>
                  <option value="Technology">Technology</option>
                  <option value="Food">Food</option>
                  <option value="Art">Art</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={editForm.time}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={editForm.endTime || ''}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    id="locationName"
                    name="location.name"
                    value={editForm.location.name || ''}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    id="lat"
                    name="location.lat"
                    value={editForm.location.lat}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="lng" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    id="lng"
                    name="location.lng"
                    value={editForm.location.lng}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Images
                </label>
                <div className="mt-1 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {editForm.images?.length || 0} image(s) available
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsImagesModalOpen(true)}
                    className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Manage Images
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={editForm.isPublic || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Make this event public (visible to all users)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Environmental Data Modal */}
      {isEnvDataModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                {event.environmentalData ? 'Edit Environmental Data' : 'Add Environmental Data'}
              </h2>
              <button 
                onClick={() => setIsEnvDataModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEnvDataSubmit} className="space-y-4">
              {/* Initialize environmentalData if it doesn't exist */}
              {!editForm.environmentalData && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    You're about to add environmental data for this event. This information will be displayed to users viewing the event.
                  </p>
                </div>
              )}

              {/* Prepare the environmentalData object structure if it doesn't exist */}
              {!editForm.environmentalData && (
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      document.addEventListener('DOMContentLoaded', function() {
                        ${JSON.stringify({
                          ...editForm,
                          environmentalData: {
                            airQuality: { value: '', status: 'Good' },
                            temperature: { value: '', unit: 'C', status: 'Good' },
                            noise: { value: '', unit: 'dB', status: 'Low' },
                            lastUpdated: new Date().toISOString()
                          }
                        })}
                      });
                    `
                  }}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="airQuality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Air Quality (AQI)
                  </label>
                  <input
                    type="number"
                    id="airQuality"
                    name="environmentalData.airQuality.value"
                    value={editForm.environmentalData?.airQuality?.value || ''}
                    onChange={handleChange}
                    placeholder="e.g. 42"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="airQualityStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Air Quality Status
                  </label>
                  <select
                    id="airQualityStatus"
                    name="environmentalData.airQuality.status"
                    value={editForm.environmentalData?.airQuality?.status || 'Good'}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <option value="Good">Good</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Temperature Value
                  </label>
                  <input
                    type="number"
                    id="temperature"
                    name="environmentalData.temperature.value"
                    value={editForm.environmentalData?.temperature?.value || ''}
                    onChange={handleChange}
                    placeholder="e.g. 28"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="temperatureUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Temperature Unit
                  </label>
                  <select
                    id="temperatureUnit"
                    name="environmentalData.temperature.unit"
                    value={editForm.environmentalData?.temperature?.unit || 'C'}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <option value="C">Celsius (°C)</option>
                    <option value="F">Fahrenheit (°F)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="temperatureStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Temperature Status
                  </label>
                  <select
                    id="temperatureStatus"
                    name="environmentalData.temperature.status"
                    value={editForm.environmentalData?.temperature?.status || 'Good'}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <option value="Good">Good</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="noise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Noise Level
                  </label>
                  <input
                    type="number"
                    id="noise"
                    name="environmentalData.noise.value"
                    value={editForm.environmentalData?.noise?.value || ''}
                    onChange={handleChange}
                    placeholder="e.g. 76"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="noiseUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Noise Unit
                  </label>
                  <select
                    id="noiseUnit"
                    name="environmentalData.noise.unit"
                    value={editForm.environmentalData?.noise?.unit || 'dB'}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <option value="dB">Decibels (dB)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="noiseStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Noise Status
                  </label>
                  <select
                    id="noiseStatus"
                    name="environmentalData.noise.status"
                    value={editForm.environmentalData?.noise?.status || 'Low'}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEnvDataModalOpen(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none"
                >
                  Save Environmental Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Image Management Modal */}
      {isImagesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Manage Event Images</h2>
              <button 
                onClick={() => setIsImagesModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleImageSubmit} className="space-y-4">
              {/* Current Images */}
              {editForm.images && editForm.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {editForm.images.map((image: string, index: number) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <Image 
                            src={image} 
                            alt={`Event image ${index + 1}`}
                            width={200}
                            height={120}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload New Images */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload New Images</h3>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      <span className="font-medium text-brand-500">Click to upload</span> or drag and drop
                      <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              </div>
              
              {/* Preview New Images */}
              {newImageFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Images to Upload</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {newImageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <Image 
                            src={URL.createObjectURL(file)} 
                            alt={`New image ${index + 1}`}
                            width={200}
                            height={120}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-1 left-1 right-1 text-xs text-white bg-black/50 px-1 py-0.5 truncate rounded">
                          {file.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsImagesModalOpen(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none"
                  disabled={newImageFiles.length === 0}
                >
                  Save Images
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}