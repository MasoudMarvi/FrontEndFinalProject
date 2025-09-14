"use client";
import React, { useState, useRef, useEffect } from 'react';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '@/context/GoogleMapsContext';
import { getEvents, getEventById, updateEvent, deleteEvent } from '@/lib/api/events';
import { getEventCategories } from '@/lib/api/eventCategories';
import { EventDto, EventDetailDto, EventCategoryDto, UpdateEventCommand } from '@/lib/api/types';

// Define the environmental data type
interface EnvironmentalData {
  id: string;
  type: string;  // Air Quality, Noise Level, Water Quality, etc.
  value: number;
  unit: string;  // ppm, dB, etc.
  timestamp: string;
  description?: string;
}

// Extended event data for UI (with additional fields for images and environmental data)
interface ExtendedEventData extends EventDto {
  environmentalData?: EnvironmentalData[];
  images?: string[];
  location: {
    name?: string;
    lat: number;
    lng: number;
  };
  date: string;
  time: string;
  hasEnvironmentalData: boolean;
  organizer: string;
}

// Map component
const MapComponent = ({ 
  location, 
  onLocationChange 
}: { 
  location: { lat: number; lng: number }, 
  onLocationChange: (lat: number, lng: number) => void 
}) => {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onLocationChange(lat, lng);
    }
  };

  
  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={{
        width: '100%',
        height: '300px'
      }}
      center={location}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={{
        fullscreenControl: false,
        streetViewControl: false,
      }}
    >
      <Marker position={location} />
    </GoogleMap>
  ) : <div className="h-[300px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">Loading Map...</div>;
};

export default function ManageEvents() {
  const [events, setEvents] = useState<ExtendedEventData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [isEnvDataModalOpen, setIsEnvDataModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ExtendedEventData | null>(null);
  const [editingEnvData, setEditingEnvData] = useState<EnvironmentalData | null>(null);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<EventCategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startDate, setStartDate] = useState<string>('');
const [startTime, setStartTime] = useState<string>('');
const [endDate, setEndDate] = useState<string>('');
const [endTime, setEndTime] = useState<string>('');
const [imageUrls, setImageUrls] = useState<string[]>([]);
const [removedImageIndexes, setRemovedImageIndexes] = useState<number[]>([]);
  
  // Fetch events and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch categories first
        const categoriesData = await getEventCategories();
        setCategories(categoriesData);
        
        // Then fetch all events (including private ones for admin)
        const eventsData = await getEvents(true);
        
        // Transform events to include UI-specific fields
        const transformedEvents: ExtendedEventData[] = eventsData.map(event => ({
          ...event,
          location: {
            name: 'Event Location', // Default location name
            lat: event.latitude,
            lng: event.longitude,
          },
          date: new Date(event.startDateTime).toISOString().split('T')[0],
          time: new Date(event.startDateTime).toTimeString().substring(0, 5),
          hasEnvironmentalData: false, // We don't have this info from API
          environmentalData: [],
          images: [],
          organizer: event.creatorName || 'Unknown',
        }));
        
        setEvents(transformedEvents);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load events or categories. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter events based on category and status
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'All Categories' || event.categoryName === selectedCategory;
    
    // For status filtering, map our status values to the API's boolean fields
    let statusMatch = true;
    if (selectedStatus === 'Active') {
      statusMatch = true; // All events are considered active for now
    } else if (selectedStatus === 'Pending') {
      statusMatch = false; // We don't have a pending status in the API
    } else if (selectedStatus === 'Cancelled') {
      statusMatch = false; // We don't have a cancelled status in the API
    }
    
    return matchesCategory && statusMatch;
  });
  
  // Delete event
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        setEvents(events.filter(event => event.eventId !== id));
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

const handleEdit = async (event: ExtendedEventData) => {
  try {
    setEditingEvent({...event});
    
    // Set date and time fields
    const startDateTime = new Date(event.startDateTime);
    const endDateTime = new Date(event.endDateTime);
    
    setStartDate(startDateTime.toISOString().split('T')[0]);
    setStartTime(startDateTime.toTimeString().substring(0, 5));
    setEndDate(endDateTime.toISOString().split('T')[0]);
    setEndTime(endDateTime.toTimeString().substring(0, 5));
    
    // Initialize image URLs if available
    if (event.images && event.images.length > 0) {
      setImageUrls(event.images);
    } else {
      setImageUrls([]);
    }
    
    setNewImageFiles([]);
    setRemovedImageIndexes([]);
    setIsEditModalOpen(true);
  } catch (err) {
    console.error('Error setting up event editing:', err);
    alert('Failed to load event details. Please try again.');
  }
};
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (!editingEvent) return;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      setEditingEvent({
        ...editingEvent,
        [parent]: {
          ...editingEvent[parent as keyof typeof editingEvent],
          [child]: value
        }
      });
    } else {
      setEditingEvent({
        ...editingEvent,
        [name]: value
      });
    }
  };

  // Handle location change from map
  const handleLocationChange = (lat: number, lng: number) => {
    if (!editingEvent) return;
    
    setEditingEvent({
      ...editingEvent,
      location: {
        ...editingEvent.location,
        lat,
        lng
      },
      latitude: lat,
      longitude: lng
    });
  };

const handleEditSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingEvent) return;

  try {
    // Create start and end date-times by combining date and time
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    // Create the update command
    const updateCommand: UpdateEventCommand = {
      eventId: editingEvent.eventId,
      title: editingEvent.title,
      description: editingEvent.description,
      latitude: editingEvent.latitude,
      longitude: editingEvent.longitude,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      categoryId: editingEvent.categoryId,
      isPublic: editingEvent.isPublic
      // environmentalData: {
      //   carbonFootprint: editingEvent.environmentalData?.carbonFootprint || 0,
      //   renewableEnergyUse: editingEvent.environmentalData?.renewableEnergyUse || 0,
      //   wasteReduction: editingEvent.environmentalData?.wasteReduction || 0
      // }
      // Note: We don't send images to the backend as you mentioned the backend doesn't have an image attribute
    };

    await updateEvent(editingEvent.eventId,updateCommand);
    
    // Handle image uploads if needed (client-side only)
    // You might want to add your own logic to store these images somewhere
    
    // Close modal and refresh data
    setIsEditModalOpen(false);
    
    // Reset state
    setEditingEvent(null);
    setNewImageFiles([]);
    setImageUrls([]);
    setRemovedImageIndexes([]);
    
  } catch (err) {
    console.error('Error updating event:', err);
    alert('Failed to update event. Please try again.');
  }
};
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...filesArray]);
    }
  };

  // Handle removing a new image
  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle removing an existing image
  const handleRemoveExistingImage = (index: number) => {
    if (editingEvent && editingEvent.images) {
      const updatedImages = [...editingEvent.images];
      updatedImages.splice(index, 1);
      setEditingEvent({
        ...editingEvent,
        images: updatedImages
      });
    }
  };

  // Save images
  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEvent) return;
    
    if (newImageFiles.length > 0) {
      // In a real app, you would upload the files to a server
      // For now, we'll just create object URLs
      const newImageUrls = newImageFiles.map(file => URL.createObjectURL(file));
      
      setEditingEvent({
        ...editingEvent,
        images: [...(editingEvent.images || []), ...newImageUrls]
      });
      
      setNewImageFiles([]);
      setIsImagesModalOpen(false);
    }
  };

  // Add new environmental data
  const handleAddEnvironmentalData = () => {
    if (!editingEvent) return;
    
    const newEnvData: EnvironmentalData = {
      id: `env${Date.now()}`,
      type: '',
      value: 0,
      unit: '',
      timestamp: new Date().toISOString(),
    };
    
    setEditingEnvData(newEnvData);
    setIsEnvDataModalOpen(true);
  };

  // Handle env data form changes
  const handleEnvDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingEnvData) return;
    
    const { name, value } = e.target;
    
    setEditingEnvData({
      ...editingEnvData,
      [name]: name === 'value' ? parseFloat(value) : value
    });
  };

  // Save environmental data
  const handleEnvDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEvent || !editingEnvData) return;
    
    const updatedEvent = { ...editingEvent };
    
    if (!updatedEvent.environmentalData) {
      updatedEvent.environmentalData = [];
    }
    
    // Check if we're editing an existing item or adding new
    const existingIndex = updatedEvent.environmentalData.findIndex(item => item.id === editingEnvData.id);
    
    if (existingIndex >= 0) {
      // Update existing
      updatedEvent.environmentalData[existingIndex] = editingEnvData;
    } else {
      // Add new
      updatedEvent.environmentalData.push(editingEnvData);
    }
    
    updatedEvent.hasEnvironmentalData = true;
    
    setEditingEvent(updatedEvent);
    setIsEnvDataModalOpen(false);
    setEditingEnvData(null);
  };

  // Edit existing environmental data
  const handleEditEnvData = (data: EnvironmentalData) => {
    setEditingEnvData({ ...data });
    setIsEnvDataModalOpen(true);
  };

  // Delete environmental data
  const handleDeleteEnvData = (id: string) => {
    if (!editingEvent || !editingEvent.environmentalData) return;
    
    const updatedEnvData = editingEvent.environmentalData.filter(item => item.id !== id);
    
    setEditingEvent({
      ...editingEvent,
      environmentalData: updatedEnvData,
      hasEnvironmentalData: updatedEnvData.length > 0
    });
  };
  
  // Create category options array with "All Categories" at the beginning
  const categoryOptions = ['All Categories', ...(categories.map(cat => cat.categoryName || '').filter(Boolean))];
  
  // Status options
  const statuses = ['All Status', 'Active', 'Pending', 'Cancelled'];
  const envDataTypes = ['Air Quality', 'Noise Level', 'Water Quality', 'Temperature', 'Humidity', 'Wind Speed', 'Other'];

  // Loading state
  if (isLoading) {
    return (
      <>
        <PageBreadCrumb title="Manage Events" page="Admin" />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading events...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <PageBreadCrumb title="Manage Events" page="Admin" />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-error-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="mt-4 text-error-500">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadCrumb title="Manage Events" page="Admin" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Event Management</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage all events in the system
            </p>
          </div>
          <div>
            <Link 
              href="/form-elements" // Link to your existing CreateEventForm
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Event
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Events Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organizer
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Public
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Images
                </th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredEvents.map(event => (
                <tr key={event.eventId}>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3 overflow-hidden">
                        {event.images && event.images.length > 0 ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={event.images[0]}
                              alt={event.title || ''}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-medium">{event.title?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 dark:text-white/90">{event.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {event.location.name || 'No location name'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    <div className="flex flex-col">
                     <span>{new Date(event.startDateTime).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.categoryName === 'Music' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      event.categoryName === 'Technology' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      event.categoryName === 'Food' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      event.categoryName === 'Art' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      event.categoryName === 'Sports' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {event.categoryName || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {event.creatorName || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {event.isPublic ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {event.images && event.images.length > 0 ? (
                      <div className="flex -space-x-2 overflow-hidden">
                        {event.images.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="inline-block h-6 w-6 rounded-md ring-2 ring-white dark:ring-gray-800 overflow-hidden">
                            <div className="relative h-full w-full">
                              <Image
                                src={img}
                                alt={`${event.title} thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        ))}
                        {event.images.length > 3 && (
                          <div className="inline-block h-6 w-6 rounded-md bg-gray-100 dark:bg-gray-800 ring-2 ring-white dark:ring-gray-800 text-xs flex items-center justify-center text-gray-500 dark:text-gray-400">
                            +{event.images.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">No images</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <Link 
                        href={`/events/${event.eventId}`}
                        className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleEdit(event)}
                        className="px-2 py-1 text-xs text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.eventId)}
                        className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No events found matching your filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('All Categories');
                setSelectedStatus('All Status');
              }}
              className="mt-2 text-sm text-brand-500 hover:text-brand-600"
            >
              Clear all filters
            </button>
          </div>
        )}
        
        {/* Pagination - simplified since we're loading all events at once */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{filteredEvents.length}</span> of <span className="font-medium">{events.length}</span> events
          </p>
        </div>
      </div>
      
      {/* Edit Event Modal */}
{/* Edit Event Modal */}
{isEditModalOpen && editingEvent && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 m-4">
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
            value={editingEvent.title || ''}
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
            value={editingEvent.description || ''}
            onChange={handleChange}
            required
            rows={3}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          ></textarea>
        </div>
        
        {/* Image Management - Updated to handle 3 images directly in the edit modal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Event Images (Up to 3)
          </label>
          
          {/* Display existing images with remove option */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {imageUrls.map((url, index) => (
              !removedImageIndexes.includes(index) && (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Event image ${index + 1}`} 
                    className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    onClick={() => setRemovedImageIndexes([...removedImageIndexes, index])}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )
            ))}
            
            {/* New Image Previews */}
            {newImageFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={`New event image ${index + 1}`} 
                  className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  onClick={() => {
                    const updatedFiles = [...newImageFiles];
                    updatedFiles.splice(index, 1);
                    setNewImageFiles(updatedFiles);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            
            {/* Add Image Button (only show if less than 3 total images) */}
            {(imageUrls.length - removedImageIndexes.length + newImageFiles.length) < 3 && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-40 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="block mt-1 text-sm text-gray-500">Add Image</span>
                </div>
              </div>
            )}
          </div>
          
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const totalImages = imageUrls.length - removedImageIndexes.length + newImageFiles.length;
              
              if (files.length + totalImages <= 3) {
                setNewImageFiles([...newImageFiles, ...files]);
              } else {
                alert('You can only upload up to 3 images in total.');
              }
              
              // Reset the input to allow selecting the same file again
              if (e.target) e.target.value = '';
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={editingEvent.categoryId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            >
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="isPublic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Visibility
            </label>
            <select
              id="isPublic"
              name="isPublic"
              value={editingEvent.isPublic.toString()}
              onChange={(e) => {
                setEditingEvent({
                  ...editingEvent,
                  isPublic: e.target.value === 'true'
                });
              }}
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="true">Public</option>
              <option value="false">Private</option>
            </select>
          </div>
        </div>

        {/* Updated date/time fields with separate start/end date and time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            />
          </div>
          
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            />
          </div>
        </div>

        <div>
          <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Organizer
          </label>
          <input
            type="text"
            id="organizer"
            name="organizer"
            value={editingEvent.organizer}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            disabled
          />
        </div>

        {/* Location Selection with Map */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Click on the map to set location
            </span>
          </div>
          
          <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <MapComponent 
              location={editingEvent.location} 
              onLocationChange={handleLocationChange} 
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location Name
              </label>
              <input
                type="text"
                id="locationName"
                name="location.name"
                value={editingEvent.location.name || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
            
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                id="latitude"
                name="location.lat"
                value={editingEvent.location.lat}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
            
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                id="longitude"
                name="location.lng"
                value={editingEvent.location.lng}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
          </div>
        </div>
        
        {/* Environmental Data */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Environmental Data
            </label>
            <button
              type="button"
              onClick={handleAddEnvironmentalData}
              className="text-xs px-2 py-1 bg-brand-50 text-brand-600 rounded hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
            >
              Add Data Point
            </button>
          </div>
          
          {editingEvent.environmentalData && editingEvent.environmentalData.length > 0 ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50">
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {editingEvent.environmentalData.map(data => (
                    <tr key={data.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-300">{data.type}</td>
                      <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-300">{data.value}</td>
                      <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-300">{data.unit}</td>
                      <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-300">
                        {new Date(data.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditEnvData(data)}
                            className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEnvData(data.id)}
                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">No environmental data added yet.</p>
              <button
                type="button"
                onClick={handleAddEnvironmentalData}
                className="mt-2 text-sm text-brand-500 hover:text-brand-600"
              >
                Add data point
              </button>
            </div>
          )}
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
      
      {/* Image Management Modal */}
      {isImagesModalOpen && editingEvent && (
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
              {editingEvent.images && editingEvent.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {editingEvent.images.map((image: string, index: number) => (
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

      {/* Environmental Data Modal */}
      {isEnvDataModalOpen && editingEnvData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                {editingEnvData.id.startsWith('env') && !editingEvent?.environmentalData?.find(d => d.id === editingEnvData.id) 
                  ? 'Add Environmental Data' 
                  : 'Edit Environmental Data'
                }
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
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={editingEnvData.type}
                  onChange={handleEnvDataChange}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                >
                  <option value="" disabled>Select a data type</option>
                  {envDataTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="value"
                    name="value"
                    value={editingEnvData.value}
                    onChange={handleEnvDataChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    id="unit"
                    name="unit"
                    value={editingEnvData.unit}
                    onChange={handleEnvDataChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    placeholder="e.g. ppm, dB, °C"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timestamp
                </label>
                <input
                  type="datetime-local"
                  id="timestamp"
                  name="timestamp"
                  value={editingEnvData.timestamp.substring(0, 16)}
                  onChange={handleEnvDataChange}
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
                  value={editingEnvData.description || ''}
                  onChange={handleEnvDataChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  placeholder="Optional description of measurement"
                ></textarea>
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
                  Save Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}