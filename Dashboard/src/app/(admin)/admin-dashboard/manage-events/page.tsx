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
import { 
  EventDto, 
  EventDetailDto, 
  EventCategoryDto, 
  UpdateEventCommand,
  EventStatus
} from '@/lib/api/types';
import { 
  getEnvironmentalDataByEventId, 
  createEnvironmentalData,
  updateEnvironmentalData,
  deleteEnvironmentalData
} from '@/lib/api/environmentalData';

// Define the environmental data type
interface EnvironmentalData {
  id: string;
  eventId: string;
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
  picture1?: string;
  picture2?: string;
  picture3?: string;
  picture1File?: File; // Added for file upload
  picture2File?: File; // Added for file upload
  picture3File?: File; // Added for file upload
}

// Default image for events with no images
const DEFAULT_IMAGE = "/images/event/event-default.jpg";

// Base URL for event images
const IMAGE_BASE_URL = 'https://localhost:7235/uploads/events/';

// Function to update event with images using FormData
const updateEventWithImages = async (eventId: string, formData: FormData): Promise<EventDto> => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`https://localhost:7235/api/Events/${eventId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update event');
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error in updateEventWithImages:', err);
    throw new Error(err.message || 'Failed to update event');
  }
};

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

// Helper function to get image URL from backend path
function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return DEFAULT_IMAGE;
  // If it's already a data URL (from file input preview), return it as is
  if (imagePath.startsWith('data:')) return imagePath;
  // Clean up the path to avoid duplication
  const cleanPath = imagePath.replace(/^\/uploads\/events\//, '');
  return cleanPath ? `${IMAGE_BASE_URL}${cleanPath}` : DEFAULT_IMAGE;
}

export default function ManageEvents() {
  const [events, setEvents] = useState<ExtendedEventData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEnvDataModalOpen, setIsEnvDataModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ExtendedEventData | null>(null);
  const [editingEnvData, setEditingEnvData] = useState<EnvironmentalData | null>(null);
  const [categories, setCategories] = useState<EventCategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [envDataLoading, setEnvDataLoading] = useState(false);
  
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
          hasEnvironmentalData: false, // We'll fetch this separately
          environmentalData: [],
          images: [
            event.picture1 ? getImageUrl(event.picture1) : null,
            event.picture2 ? getImageUrl(event.picture2) : null,
            event.picture3 ? getImageUrl(event.picture3) : null,
          ].filter(Boolean) as string[], // Remove null/undefined values
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
  }, [isRefreshingData]);
  
  // Filter events based on category and status
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'All Categories' || event.categoryName === selectedCategory;
    
    // For status filtering
    let statusMatch = true;
    if (selectedStatus !== 'All Status') {
      if (selectedStatus === 'Active') {
        statusMatch = event.status === EventStatus.Active;
      } else if (selectedStatus === 'Pending') {
        statusMatch = event.status === EventStatus.Pending;
      } else if (selectedStatus === 'Cancelled') {
        statusMatch = event.status === EventStatus.Cancelled;
      }
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
      
      // Fetch environmental data for this event
      setEnvDataLoading(true);
      try {
        const envData = await getEnvironmentalDataByEventId(event.eventId);
        if (envData && envData.length > 0) {
          setEditingEvent(prev => {
            if (!prev) return null;
            return {
              ...prev,
              environmentalData: envData,
              hasEnvironmentalData: true
            };
          });
        }
      } catch (envError) {
        console.error('Error fetching environmental data:', envError);
      } finally {
        setEnvDataLoading(false);
      }
      
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

      // Create form data to handle image uploads
      const formData = new FormData();
      
      // Add all non-file fields
      formData.append('eventId', editingEvent.eventId);
      formData.append('title', editingEvent.title || '');
      formData.append('description', editingEvent.description || '');
      formData.append('latitude', editingEvent.location.lat.toString());
      formData.append('longitude', editingEvent.location.lng.toString());
      formData.append('startDateTime', startDateTime.toISOString());
      formData.append('endDateTime', endDateTime.toISOString());
      formData.append('categoryId', editingEvent.categoryId);
      formData.append('isPublic', editingEvent.isPublic.toString());
      formData.append('status', editingEvent.status.toString());

      // Add image files if they exist (new uploads)
      if (editingEvent.picture1File) {
        formData.append('Picture1', editingEvent.picture1File);
      }
      
      if (editingEvent.picture2File) {
        formData.append('Picture2', editingEvent.picture2File);
      }
      
      if (editingEvent.picture3File) {
        formData.append('Picture3', editingEvent.picture3File);
      }

      // Create the update command (for non-file data)
      const updateCommand: UpdateEventCommand = {
        eventId: editingEvent.eventId,
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        latitude: editingEvent.location.lat,
        longitude: editingEvent.location.lng,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        categoryId: editingEvent.categoryId,
        isPublic: editingEvent.isPublic,
        status: editingEvent.status || EventStatus.Active
      };

      // Update event using formData if there are image files, otherwise use updateCommand
      if (editingEvent.picture1File || editingEvent.picture2File || editingEvent.picture3File) {
        await updateEventWithImages(editingEvent.eventId, formData);
      } else {
        await updateEvent(editingEvent.eventId, updateCommand);
      }
      
      // Close modal and refresh data
      setIsEditModalOpen(false);
      
      // Reset state
      setEditingEvent(null);
      
      // Refresh the events list
      setIsRefreshingData(prev => !prev);
      
    } catch (err) {
      console.error('Error updating event:', err);
      alert('Failed to update event. Please try again.');
    }
  };

  // Add new environmental data
  const handleAddEnvironmentalData = () => {
    if (!editingEvent) return;
    
    const newEnvData: EnvironmentalData = {
      id: '', // Empty ID for new records - backend will assign a real ID
      eventId: editingEvent.eventId,
      type: '',
      value: 0,
      unit: '',
      timestamp: new Date().toISOString(),
      description: ''
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
  const handleEnvDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEvent || !editingEnvData) return;
    
    try {
      // This is a new API call specifically for environmental data
      if (editingEnvData.id) {
        // Update existing environmental data
        await updateEnvironmentalData(editingEnvData.id, editingEnvData);
      } else {
        // Create new environmental data
        await createEnvironmentalData(editingEnvData);
      }
      
      // Fetch updated environmental data
      const updatedEnvData = await getEnvironmentalDataByEventId(editingEvent.eventId);
      
      // Update the editing event with new environmental data
      setEditingEvent({
        ...editingEvent,
        environmentalData: updatedEnvData,
        hasEnvironmentalData: updatedEnvData.length > 0
      });
      
      setIsEnvDataModalOpen(false);
      setEditingEnvData(null);
      
    } catch (error) {
      console.error('Error saving environmental data:', error);
      alert('Failed to save environmental data. Please try again.');
    }
  };

  // Edit existing environmental data
  const handleEditEnvData = (data: EnvironmentalData) => {
    setEditingEnvData({ ...data });
    setIsEnvDataModalOpen(true);
  };

  // Delete environmental data
  const handleDeleteEnvData = async (id: string) => {
    if (!editingEvent || !editingEvent.environmentalData) return;
    
    if (window.confirm('Are you sure you want to delete this environmental data point?')) {
      try {
        // Call the delete API
        await deleteEnvironmentalData(id);
        
        // Update the local state
        const updatedEnvData = editingEvent.environmentalData.filter(item => item.id !== id);
        
        setEditingEvent({
          ...editingEvent,
          environmentalData: updatedEnvData,
          hasEnvironmentalData: updatedEnvData.length > 0
        });
      } catch (error) {
        console.error('Error deleting environmental data:', error);
        alert('Failed to delete environmental data. Please try again.');
      }
    }
  };
  
  // Status options based on the EventStatus enum
  const getStatusDisplayName = (status: EventStatus) => {
    switch (status) {
      case EventStatus.Active:
        return 'Active';
      case EventStatus.Pending:
        return 'Pending';
      case EventStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };
  
  const getStatusColorClass = (status: EventStatus) => {
    switch (status) {
      case EventStatus.Active:
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case EventStatus.Pending:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case EventStatus.Cancelled:
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
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
                          <img 
                            src={event.images[0]} 
                            alt={event.title || ''}
                            className="h-10 w-10 object-cover"
                            onError={(e) => {
                              // Fallback to default image
                              (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                            }}
                          />
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
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColorClass(event.status)}`}>
                      {getStatusDisplayName(event.status)}
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
                            <img
                              src={img}
                              alt={`${event.title} thumbnail ${idx + 1}`}
                              className="h-6 w-6 object-cover"
                              onError={(e) => {
                                // Fallback to default image
                                (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                              }}
                            />
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
      
      {/* Edit Event Modal - Updated with the three-image upload functionality */}
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
              
              {/* Image Management - Updated to match CreateEventForm with 3 specific image slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Images (Up to 3)
                </label>
                
                <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Image Slot 1 */}
                  <div className="relative">
                    {editingEvent.picture1 ? (
                      <div className="relative w-full">
                        <div className="relative h-48 w-full rounded-lg overflow-hidden">
                          <Image
                            src={getImageUrl(editingEvent.picture1)}
                            alt="Event preview 1"
                            fill
                            className="object-cover"
                            onError={(e) => {
                              // Fallback to default image
                              (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEvent({
                              ...editingEvent,
                              picture1: undefined
                            });
                          }}
                          className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1.5 text-white hover:bg-opacity-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="eventImage0"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                            <span className="font-semibold">Image 1</span>
                          </p>
                        </div>
                        <input
                          id="eventImage0"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditingEvent({
                                ...editingEvent,
                                picture1File: file
                              });
                              
                              // Create a preview
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditingEvent(prev => ({
                                  ...prev!,
                                  picture1: reader.result as string
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Image Slot 2 */}
                  <div className="relative">
                    {editingEvent.picture2 ? (
                      <div className="relative w-full">
                        <div className="relative h-48 w-full rounded-lg overflow-hidden">
                          <Image
                            src={getImageUrl(editingEvent.picture2)}
                            alt="Event preview 2"
                            fill
                            className="object-cover"
                            onError={(e) => {
                              // Fallback to default image
                              (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEvent({
                              ...editingEvent,
                              picture2: undefined
                            });
                          }}
                          className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1.5 text-white hover:bg-opacity-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="eventImage1"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                            <span className="font-semibold">Image 2</span>
                          </p>
                        </div>
                        <input
                          id="eventImage1"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditingEvent({
                                ...editingEvent,
                                picture2File: file
                              });
                              
                              // Create a preview
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditingEvent(prev => ({
                                  ...prev!,
                                  picture2: reader.result as string
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Image Slot 3 */}
                  <div className="relative">
                    {editingEvent.picture3 ? (
                      <div className="relative w-full">
                        <div className="relative h-48 w-full rounded-lg overflow-hidden">
                          <Image
                            src={getImageUrl(editingEvent.picture3)}
                            alt="Event preview 3"
                            fill
                            className="object-cover"
                            onError={(e) => {
                              // Fallback to default image
                              (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEvent({
                              ...editingEvent,
                              picture3: undefined
                            });
                          }}
                          className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1.5 text-white hover:bg-opacity-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="eventImage2"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                            <span className="font-semibold">Image 3</span>
                          </p>
                        </div>
                        <input
                          id="eventImage2"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditingEvent({
                                ...editingEvent,
                                picture3File: file
                              });
                              
                              // Create a preview
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditingEvent(prev => ({
                                  ...prev!,
                                  picture3: reader.result as string
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG or GIF (Max. 2MB per image)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                
                {/* Added Status dropdown */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={editingEvent.status}
                    onChange={(e) => {
                      setEditingEvent({
                        ...editingEvent,
                        status: parseInt(e.target.value) as EventStatus
                      });
                    }}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <option value={EventStatus.Active}>Active</option>
                    <option value={EventStatus.Pending}>Pending</option>
                    <option value={EventStatus.Cancelled}>Cancelled</option>
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
              
              {/* Environmental Data Section */}
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
                
                {envDataLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-brand-500"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading environmental data...</span>
                  </div>
                ) : editingEvent.environmentalData && editingEvent.environmentalData.length > 0 ? (
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

      {/* Environmental Data Modal */}
      {isEnvDataModalOpen && editingEnvData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                {!editingEnvData.id ? 'Add Environmental Data' : 'Edit Environmental Data'}
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