"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Checkbox from "@/components/form/input/Checkbox";
import Select from "@/components/form/Select";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { getEventCategories } from "@/lib/api/eventCategories";
import { createEvent } from "@/lib/api/events";
import { EventCategoryDto, EventStatus } from "@/lib/api/types";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";

export default function CreateEventForm() {
  const { isOpen: isNotificationOpen, openModal: openNotification, closeModal: closeNotification } = useModal();
  const { isLoaded } = useGoogleMaps();
  
  const [userRole, setUserRole] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState<EventStatus>(EventStatus.Pending);
  const [loading, setLoading] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  const [categories, setCategories] = useState<EventCategoryDto[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const mapCenter = { lat: 35.7219, lng: 51.3347 }; // Tehran center
  const [mapZoom, setMapZoom] = useState(13);
  
  const mapOptions = {
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
  };

  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  useEffect(() => {
    const userRoles = localStorage.getItem('roles');
    if (userRoles) {
      try {
        const roles = JSON.parse(userRoles);
        setUserRole(Array.isArray(roles) ? roles[0] : roles);
        const adminRole = Array.isArray(roles) ? 
          roles.some(role => typeof role === 'string' && role.toLowerCase() === 'admin') :
          (typeof roles === 'string' && roles.toLowerCase() === 'admin');
        
        setIsAdmin(adminRole);
        
        if (!adminRole) {
          setStatus(EventStatus.Pending);
        }
      } catch (error) {
        console.error("Error parsing user roles:", error);
      }
    }
  }, []);
  
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await getEventCategories();
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].categoryId);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setErrorMessage("Failed to load event categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    if (isLoaded && searchInputRef.current && window.google && window.google.maps && window.google.maps.places) {
      try {
        const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          fields: ["formatted_address", "geometry", "name"],
          types: ["geocode", "establishment"]
        });
        
        autocompleteRef.current = autocomplete;
        
        if (mapRef.current) {
          autocomplete.bindTo("bounds", mapRef.current);
        }
        
        const listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          
          if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
          }
          
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          setLocation({ lat, lng });
          setMapZoom(15);
          
          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng });
            mapRef.current.setZoom(15);
          }
          
          if (place.name) {
            setLocationName(place.name);
          }
        });
        
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
  }, [isLoaded, searchInputRef.current]);
  
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);
  
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLocation({ lat, lng });
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImagePreviews = [...imagePreviews];
        newImagePreviews[index] = reader.result as string;
        setImagePreviews(newImagePreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];
    
    newImageFiles[index] = null;
    newImagePreviews[index] = null;
    
    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
  };
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategoryId(categories.length > 0 ? categories[0].categoryId : "");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setLocation(null);
    setLocationName("");
    setIsPublic(false);
    setStatus(EventStatus.Pending);
    setImageFiles([null, null, null]);
    setImagePreviews([null, null, null]);
    setSearchQuery("");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !categoryId || !startDate || !startTime || !location) {
      setErrorMessage("Please fill in all required fields");
      return;
    }
    
    const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
    const endDateTime = endDate && endTime 
      ? new Date(`${endDate}T${endTime}`).toISOString()
      : new Date(new Date(`${startDate}T${startTime}`).getTime() + 3600000).toISOString(); // Default to 1 hour after start
    
    setLoading(true);
    
    try {
      const eventStatus = isAdmin ? status : EventStatus.Pending;
      
      const formData = new FormData();
      
      formData.append('Title', title);
      formData.append('Description', description);
      formData.append('Latitude', location.lat.toString());
      formData.append('Longitude', location.lng.toString());
      formData.append('StartDateTime', startDateTime);
      formData.append('EndDateTime', endDateTime);
      formData.append('IsPublic', isPublic.toString());
      formData.append('CategoryId', categoryId);
      formData.append('Status', eventStatus.toString());
      
      // Add images if available
      if (imageFiles[0]) {
        formData.append('Picture1', imageFiles[0]);
      }
      
      if (imageFiles[1]) {
        formData.append('Picture2', imageFiles[1]);
      }
      
      if (imageFiles[2]) {
        formData.append('Picture3', imageFiles[2]);
      }
      
      const result = await createEvent({
        title,
        description,
        latitude: location.lat,
        longitude: location.lng,
        startDateTime,
        endDateTime,
        isPublic,
        categoryId,
        status: eventStatus,
        picture1: imageFiles[0] || undefined,
        picture2: imageFiles[1] || undefined,
        picture3: imageFiles[2] || undefined
      });
      
      setNotificationMessage(`Event "${title}" created successfully!`);
      openNotification();
      
      resetForm();
    } catch (error: any) {
      console.error("Error creating event:", error);
      setErrorMessage(error.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClose = () => {
    closeNotification();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    
    if (autocompleteRef.current && map) {
      autocompleteRef.current.bindTo("bounds", map);
    }
  };

  return (
    <>
      <PageBreadCrumb title="Create Event" page="New Event" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Feedback messages */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
      
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Event Details
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fill in the details to create a new event
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Event Title */}
          <div>
            <Label htmlFor="eventTitle">
              Event Title <span className="text-error-500">*</span>
            </Label>
            <Input 
              id="eventTitle"
              type="text" 
              placeholder="Enter event title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          {/* Event Images Upload - Supporting 3 images */}
          <div>
            <Label htmlFor="eventImages">
              Event Images (Upload up to 3)
            </Label>
            <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
                  {imagePreviews[index] ? (
                    <div className="relative w-full">
                      <div className="relative h-48 w-full rounded-lg overflow-hidden">
                        <Image
                          src={imagePreviews[index] || ''}
                          alt={`Event preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1.5 text-white hover:bg-opacity-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`eventImage${index}`}
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                          <span className="font-semibold">Image {index + 1}</span>
                        </p>
                      </div>
                      <input
                        id={`eventImage${index}`}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, index)}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              SVG, PNG, JPG or GIF (Max. 2MB per image)
            </p>
          </div>
          
          {/* Event Description */}
          <div>
            <Label htmlFor="eventDescription">
              Description <span className="text-error-500">*</span>
            </Label>
            <TextArea 
              id="eventDescription"
              placeholder="Enter event description"
              value={description}
              onChange={(value) => setDescription(value)}
              rows={4}
              required
            />
          </div>
          
          {/* Event Category */}
          <div>
            <Label htmlFor="eventCategory">
              Category <span className="text-error-500">*</span>
            </Label>
            <Select
              id="eventCategory"
              className="w-full"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={loadingCategories}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </Select>
          </div>

          {/* Event Status - Only visible and editable for admin users */}
          {isAdmin && (
            <div>
              <Label htmlFor="eventStatus">
                Status
              </Label>
              <Select
                id="eventStatus"
                className="w-full"
                value={status.toString()}
                onChange={(e) => setStatus(parseInt(e.target.value) as EventStatus)}
              >
                <option value={EventStatus.Pending.toString()}>Pending</option>
                <option value={EventStatus.Active.toString()}>Active</option>
                <option value={EventStatus.Cancelled.toString()}>Cancelled</option>
              </Select>
            </div>
          )}
          {!isAdmin && (
            <div>
              <Label htmlFor="eventStatus">
                Status
              </Label>
              <div className="mt-1 flex items-center">
                <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm font-medium dark:bg-yellow-900/30 dark:text-yellow-300">
                  Pending (Requires admin approval)
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                New events are set to pending status until approved by an administrator.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Start Date */}
            <div>
              <Label htmlFor="startDate">
                Start Date <span className="text-error-500">*</span>
              </Label>
              <Input 
                id="startDate"
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            {/* Start Time */}
            <div>
              <Label htmlFor="startTime">
                Start Time <span className="text-error-500">*</span>
              </Label>
              <Input 
                id="startTime"
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* End Date */}
            <div>
              <Label htmlFor="endDate">
                End Date
              </Label>
              <Input 
                id="endDate"
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            {/* End Time */}
            <div>
              <Label htmlFor="endTime">
                End Time
              </Label>
              <Input 
                id="endTime"
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          
          {/* Search Bar for Location */}
          <div>
            <Label htmlFor="locationSearch">
              Search Location
            </Label>
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
          
          {/* Google Map for selecting location */}
          <div>
            <Label htmlFor="eventLocation">
              Event Location <span className="text-error-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Click on the map to set the event location
            </p>
            
            <div className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={location || mapCenter}
                  zoom={mapZoom}
                  options={mapOptions}
                  onClick={handleMapClick}
                  onLoad={onMapLoad}
                >
                  {location && (
                    <Marker
                      position={location}
                    />
                  )}
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Latitude - Read-only */}
            <div>
              <Label htmlFor="latitude">
                Latitude <span className="text-error-500">*</span>
              </Label>
              <Input 
                id="latitude"
                type="text" 
                placeholder="Select a location on the map"
                value={location?.lat?.toString() || ""}
                readOnly={true}
                className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"
                required
              />
            </div>
            
            {/* Longitude - Read-only */}
            <div>
              <Label htmlFor="longitude">
                Longitude <span className="text-error-500">*</span>
              </Label>
              <Input 
                id="longitude"
                type="text" 
                placeholder="Select a location on the map"
                value={location?.lng?.toString() || ""}
                readOnly={true}
                className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"
                required
              />
            </div>
          </div>
          
          {/* Location Name */}
          <div>
            <Label htmlFor="locationName">
              Location Name
            </Label>
            <Input 
              id="locationName"
              type="text" 
              placeholder="e.g. Azadi Tower"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>
          
          {/* Make this event public */}
          <div className="flex items-center">
            <Checkbox 
              id="isPublic" 
              checked={isPublic}
              onChange={(checked) => setIsPublic(checked)}
            />
            <Label htmlFor="isPublic" className="mb-0">
              Make this event public
            </Label>
          </div>
          
          {/* Submit Button */}
          <div>
            <button 
              type="submit"
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : "Create Event"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Notification Modal */}
      <Modal isOpen={isNotificationOpen} onClose={closeNotification} className="max-w-md m-4">
        <div className="no-scrollbar relative w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-2 dark:bg-green-800/30">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-300">
                Success
              </h3>
              <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                {notificationMessage}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button 
              size="sm" 
              onClick={handleNotificationClose}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Create Another Event
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}