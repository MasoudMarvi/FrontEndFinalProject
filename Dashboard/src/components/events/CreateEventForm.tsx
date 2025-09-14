"use client";
import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { EventCategoryDto } from "@/lib/api/types";
// Removed toast import

export default function CreateEventForm() {
  const router = useRouter();
  const { isLoaded } = useGoogleMaps();
  
  // State for images (now supporting 3 images)
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);
  
  // Form data state
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
  const [loading, setLoading] = useState(false);
  
  // Form feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Categories from API
  const [categories, setCategories] = useState<EventCategoryDto[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Map center (default location)
  const mapCenter = { lat: 35.7219, lng: 51.3347 }; // Tehran center
  
  // Map options
  const mapOptions = {
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
  };
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await getEventCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setErrorMessage("Failed to load event categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Clear messages after 5 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);
  
  // Handle map click to set marker and update coordinates
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLocation({ lat, lng });
    }
  }, []);

  // Handle image upload for multiple images
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a new array with the updated file
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);
      
      // Create a preview for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImagePreviews = [...imagePreviews];
        newImagePreviews[index] = reader.result as string;
        setImagePreviews(newImagePreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];
    
    newImageFiles[index] = null;
    newImagePreviews[index] = null;
    
    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
  };
  
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title || !description || !categoryId || !startDate || !startTime || !location) {
      setErrorMessage("Please fill in all required fields");
      return;
    }
    
    // Format the dates correctly for the API
    const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
    const endDateTime = endDate && endTime 
      ? new Date(`${endDate}T${endTime}`).toISOString()
      : new Date(new Date(`${startDate}T${startTime}`).getTime() + 3600000).toISOString(); // Default to 1 hour after start
    
    setLoading(true);
    
    try {
      // Prepare the event data according to your API schema
      const eventData = {
        title,
        description,
        latitude: location.lat,
        longitude: location.lng,
        startDateTime,
        endDateTime,
        isPublic,
        categoryId,
      };
      
      // Call the API to create the event using your existing function
      const result = await createEvent(eventData);
      
      // Note: We're not handling the images upload since the backend doesn't support it yet
      
      setSuccessMessage("Event created successfully!");
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin-dashboard/manage-events");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating event:", error);
      setErrorMessage(error.message || "Failed to create event");
    } finally {
      setLoading(false);
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
          
          {/* Event Images Upload - Now supporting 3 images */}
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
    onChange={(value) => setDescription(value)} // Change this line
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
                  zoom={13}
                  options={mapOptions}
                  onClick={handleMapClick}
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
            {/* Latitude */}
            <div>
              <Label htmlFor="latitude">
                Latitude <span className="text-error-500">*</span>
              </Label>
              <Input 
                id="latitude"
                type="text" 
                placeholder="e.g. 37.7749"
                value={location?.lat?.toString() || ""}
                onChange={(e) => setLocation(prev => ({ lat: parseFloat(e.target.value), lng: prev?.lng || 0 }))}
                required
              />
            </div>
            
            {/* Longitude */}
            <div>
              <Label htmlFor="longitude">
                Longitude <span className="text-error-500">*</span>
              </Label>
              <Input 
                id="longitude"
                type="text" 
                placeholder="e.g. -122.4194"
                value={location?.lng?.toString() || ""}
                onChange={(e) => setLocation(prev => ({ lat: prev?.lat || 0, lng: parseFloat(e.target.value) }))}
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
              placeholder="e.g. Golden Gate Park"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>
          
          {/* Make this event public */}
<div className="flex items-center">
  <Checkbox 
    id="isPublic" 
    checked={isPublic}
    onChange={(checked) => setIsPublic(checked)} // Change this line
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
    </>
  );
}