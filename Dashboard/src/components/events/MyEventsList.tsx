"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import axios from "axios";

// Define the TypeScript interface for the events from the API based on Swagger docs
interface EventDto {
  eventId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  startDateTime: string;
  endDateTime: string;
  isPublic: boolean;
  categoryId: string;
  categoryName: string;
  creatorUserId: string;
  creatorName: string;
  picture1: string | null;
  picture2: string | null;
  picture3: string | null;
  status: EventStatus;
}

// Interface for edit form with additional fields
interface EventEditForm extends EventDto {
  picture1File?: File | null;
  picture2File?: File | null;
  picture3File?: File | null;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  organizer?: string;
}

// Event status enum based on Swagger
enum EventStatus {
  Pending = 0,
  Active = 1,
  Completed = 2
}

// Category interface
interface EventCategoryDto {
  categoryId: string;
  categoryName: string;
  description: string | null;
}

// Status mapping for display purposes
const getStatusBadge = (status: EventStatus) => {
  switch (status) {
    case EventStatus.Pending:
      return { label: "Pending", color: "warning" };
    case EventStatus.Active:
      return { label: "Active", color: "success" };
    case EventStatus.Completed:
      return { label: "Completed", color: "info" };
    default:
      return { label: "Unknown", color: "default" };
  }
};

// Default images
const DEFAULT_IMAGE = "/images/event/event-default.jpg";

// API base URL
const API_BASE_URL = "https://localhost:7235/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL
});

// Add request interceptor to add authorization header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to get image URL
const getImageUrl = (path: string | null) => {
  if (!path) return DEFAULT_IMAGE;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return path;
};

export default function MyEventsList() {
  const { isLoaded } = useGoogleMaps();
  const [events, setEvents] = useState<EventDto[]>([]);
  const [categories, setCategories] = useState<EventCategoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });
  
  // User role state
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Map refs and state
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EventEditForm | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  
  // Check user role and fetch data on component mount
  useEffect(() => {
    // Get user info from localStorage
    const userRoles = localStorage.getItem('roles');
    const storedUserId = localStorage.getItem('userId');
    
    if (userRoles) {
      try {
        const roles = JSON.parse(userRoles);
        // Check if user is admin (case-insensitive)
        const adminRole = Array.isArray(roles) ? 
          roles.some(role => typeof role === 'string' && role.toLowerCase() === 'admin') :
          (typeof roles === 'string' && roles.toLowerCase() === 'admin');
        
        setIsAdmin(adminRole);
      } catch (error) {
        console.error("Error parsing user roles:", error);
      }
    }
    
    if (storedUserId) {
      setUserId(storedUserId);
      fetchUserEvents(storedUserId);
    }
    
    // Fetch categories for the dropdown
    fetchCategories();
  }, []);
  
  // Fetch events created by the current user
  const fetchUserEvents = async (userId: string) => {
    setLoading(true);
    try {
      // Use the official API endpoint with userId as a query parameter
      const response = await api.get('/Events', { 
        params: { 
          userId: userId,
          includePrivate: true  // Include private events since these are the user's own events
        }
      });
      
      setEvents(response.data);
    } catch (err: any) {
      console.error("Error fetching user events:", err);
      setError(err.response?.data?.message || "Failed to fetch events. Please try again later.");
      
      // Fallback to empty array if API call fails
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/EventCategories');
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Set fallback categories
      setCategories([]);
    }
  };
  
  // Initialize autocomplete when Maps API is loaded
  useEffect(() => {
    if (isLoaded && isEditModalOpen && searchInputRef.current && window.google && window.google.maps && window.google.maps.places) {
      try {
        const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          fields: ["formatted_address", "geometry", "name"],
          types: ["geocode", "establishment"]
        });
        
        autocompleteRef.current = autocomplete;
        
        // If map is already loaded, bind to it
        if (mapRef.current) {
          autocomplete.bindTo("bounds", mapRef.current);
        }
        
        // Add listener for place selection
        const listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          
          if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
          }
          
          if (!editingEvent) return;
          
          // Get location coordinates
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          // Update location in editing event
          setEditingEvent({
            ...editingEvent,
            location: {
              ...editingEvent.location,
              lat,
              lng,
              name: place.name || place.formatted_address || editingEvent.location.name
            }
          });
          
          // Update the map
          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng });
            mapRef.current.setZoom(15);
          }
        });
        
        // Clean up listener on unmount
        return () => {
          if (google && google.maps && google.maps.event && listener) {
            google.maps.event.removeListener(listener);
          }
          autocompleteRef.current = null;
        };
      } catch (error) {
        console.error("Error initializing Autocomplete:", error);
      }
    }
  }, [isLoaded, isEditModalOpen, searchInputRef.current, editingEvent]);

  // Function to handle event deletion
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      await api.delete(`/Events/${eventToDelete}`);
      
      // Update local state
      setEvents(prevEvents => prevEvents.filter(event => event.eventId !== eventToDelete));
      
      // Show success notification
      showNotification("Event deleted successfully", "success");
    } catch (err: any) {
      console.error("Error deleting event:", err);
      showNotification(err.response?.data?.message || "Failed to delete event", "error");
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  // Function to open edit modal
  const handleOpenEditModal = (eventId: string) => {
    const eventToEdit = events.find(event => event.eventId === eventId);
    if (!eventToEdit) return;
    
    // Format the date and time from the event
    const startDateTime = new Date(eventToEdit.startDateTime);
    const endDateTime = new Date(eventToEdit.endDateTime);
    
    setStartDate(startDateTime.toISOString().split('T')[0]);
    setStartTime(startDateTime.toTimeString().slice(0, 5));
    setEndDate(endDateTime.toISOString().split('T')[0]);
    setEndTime(endDateTime.toTimeString().slice(0, 5));
    
    // Create edit form with additional fields needed for the modal
    setEditingEvent({
      ...eventToEdit,
      location: {
        name: eventToEdit.description.substring(0, 30), // Using description as location name as it's not in the API
        lat: eventToEdit.latitude,
        lng: eventToEdit.longitude,
      },
      organizer: eventToEdit.creatorName,
    });
    
    setIsEditModalOpen(true);
  };

  // Function to handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editingEvent) return;
    
    const { name, value } = e.target;
    
    // Handle nested location properties
    if (name.startsWith('location.')) {
      const locationProp = name.split('.')[1];
      setEditingEvent({
        ...editingEvent,
        location: {
          ...editingEvent.location,
          [locationProp]: locationProp === 'lat' || locationProp === 'lng' ? parseFloat(value) : value
        }
      });
    } else {
      setEditingEvent({
        ...editingEvent,
        [name]: value
      });
    }
  };

  // Handle map click to set marker and update coordinates
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!editingEvent || !e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    setEditingEvent({
      ...editingEvent,
      location: {
        ...editingEvent.location,
        lat,
        lng
      }
    });
  };

  // Map load handler
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    
    // Bind autocomplete to map bounds if it exists
    if (autocompleteRef.current && map) {
      autocompleteRef.current.bindTo("bounds", map);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Function to handle form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEvent) return;
    
    try {
      // Combine date and time
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      
      // Create form data for multipart/form-data request
      const formData = new FormData();
      formData.append('EventId', editingEvent.eventId);
      formData.append('Title', editingEvent.title);
      formData.append('Description', editingEvent.description);
      formData.append('Latitude', editingEvent.location.lat.toString());
      formData.append('Longitude', editingEvent.location.lng.toString());
      formData.append('StartDateTime', startDateTime.toISOString());
      formData.append('EndDateTime', endDateTime.toISOString());
      formData.append('IsPublic', editingEvent.isPublic.toString());
      formData.append('CategoryId', editingEvent.categoryId);
      
      // Only admin can change status
      if (isAdmin) {
        formData.append('Status', editingEvent.status.toString());
      }
      
      // Add image files if they exist
      if (editingEvent.picture1File) {
        formData.append('Picture1', editingEvent.picture1File);
      }
      
      if (editingEvent.picture2File) {
        formData.append('Picture2', editingEvent.picture2File);
      }
      
      if (editingEvent.picture3File) {
        formData.append('Picture3', editingEvent.picture3File);
      }
      
      // Make API call to update the event
      const response = await api.put('/Events/UpdateEvent', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update the event in the local state
      const updatedEvent = response.data;
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.eventId === updatedEvent.eventId ? updatedEvent : event
        )
      );
      
      // Close modal and show success notification
      setIsEditModalOpen(false);
      showNotification("Event updated successfully", "success");
    } catch (err: any) {
      console.error("Error updating event:", err);
      showNotification(err.response?.data?.message || "Failed to update event", "error");
    }
  };

  // Function to show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Get the event image or use default
  const getEventImage = (event: EventDto) => {
    return getImageUrl(event.picture1) || getImageUrl(event.picture2) || getImageUrl(event.picture3);
  };

  return (
    <>
      <PageBreadCrumb title="My Events" page="My Events" />
      
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              My Events
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Events you've created
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/create-event" 
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-theme-sm font-medium text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
              </svg>
              Create New Event
            </Link>
          </div>
        </div>

        {/* Notification */}
        {notification.visible && (
          <div className={`p-4 mb-4 rounded-md ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400' 
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">You haven't created any events yet.</p>
                <Link 
                  href="/create-event" 
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  Create Your First Event
                </Link>
              </div>
            ) : (
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
                      Location
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {events.map((event) => {
                    const statusInfo = getStatusBadge(event.status);
                    const eventDate = new Date(event.startDateTime);
                    const formattedDate = `${eventDate.toLocaleDateString('en-US', { month: 'short' })} ${eventDate.getDate()}, ${eventDate.getFullYear()}`;
                    
                    return (
                      <TableRow key={event.eventId} className="">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                              <img
                                width={50}
                                height={50}
                                src={getEventImage(event)}
                                className="h-[50px] w-[50px] object-cover"
                                alt={event.title}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                                }}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {event.title}
                              </p>
                              <span className="text-gray-500 text-theme-xs dark:text-gray-400 line-clamp-1">
                                {event.description.substring(0, 50)}{event.description.length > 50 ? '...' : ''}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          {formattedDate}
                        </TableCell>
                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          {/* Display location - we'll use approximate coordinates for display */}
                          {`${event.latitude.toFixed(2)}, ${event.longitude.toFixed(2)}`}
                        </TableCell>
                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          <Badge
                            size="sm"
                            color={statusInfo.color as any}
                          >
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          <div className="flex gap-2">
                            {/* View button */}
                            <Link 
                              href={`/events/${event.eventId}`}
                              className="rounded-lg bg-info-50 p-2 text-info-500 hover:bg-info-100 dark:bg-info-500/10 dark:text-info-400 dark:hover:bg-info-500/20"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                              </svg>
                            </Link>
                            
                            {/* Edit button */}
                            <button 
                              onClick={() => handleOpenEditModal(event.eventId)}
                              className="rounded-lg bg-brand-50 p-2 text-brand-500 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                              </svg>
                            </button>
                            
                            {/* Delete button */}
                            <button 
                              onClick={() => {
                                setEventToDelete(event.eventId);
                                setShowDeleteModal(true);
                              }}
                              className="rounded-lg bg-error-50 p-2 text-error-500 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                              </svg>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Delete Event</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setEventToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                className="px-4 py-2 bg-error-500 text-white rounded-md hover:bg-error-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

              {/* Image Management - Using regular HTML img tags instead of Next.js Image */}
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
                          <img
                            src={getImageUrl(editingEvent.picture1)}
                            alt="Event preview 1"
                            className="object-cover w-full h-full"
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
                              picture1: '',
                              picture1File: null
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
                          <img
                            src={getImageUrl(editingEvent.picture2)}
                            alt="Event preview 2"
                            className="object-cover w-full h-full"
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
                              picture2: '',
                              picture2File: null
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
                          <img
                            src={getImageUrl(editingEvent.picture3)}
                            alt="Event preview 3"
                            className="object-cover w-full h-full"
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
                              picture3: '',
                              picture3File: null
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

                {/* Status dropdown - conditionally rendered based on user role */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  {isAdmin ? (
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
                      <option value={EventStatus.Pending}>Pending</option>
                      <option value={EventStatus.Active}>Active</option>
                      <option value={EventStatus.Completed}>Completed</option>
                    </select>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                      {getStatusBadge(editingEvent.status).label}
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Only administrators can change event status
                      </p>
                    </div>
                  )}
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
                  value={editingEvent.organizer || ''}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-700 cursor-not-allowed dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>

              {/* Location Search Bar */}
              <div>
                <label htmlFor="locationSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Location
                </label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input
                    ref={searchInputRef}
                    id="locationSearch"
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search for a location..."
                    className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Search for a location or click directly on the map below
                </p>
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

                <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-[300px]">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={{ 
                        lat: editingEvent.location.lat, 
                        lng: editingEvent.location.lng 
                      }}
                      zoom={15}
                      options={{
                        disableDefaultUI: false,
                        clickableIcons: true,
                        scrollwheel: true,
                      }}
                      onClick={handleMapClick}
                      onLoad={onMapLoad}
                    >
                      <Marker
                        position={{ 
                          lat: editingEvent.location.lat, 
                          lng: editingEvent.location.lng 
                        }}
                      />
                    </GoogleMap>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
                    </div>
                  )}
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
                      readOnly
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-700 cursor-not-allowed dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
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
                      readOnly
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-700 cursor-not-allowed dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}