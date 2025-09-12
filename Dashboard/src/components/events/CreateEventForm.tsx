"use client";
import React, { useState } from "react";
import Image from "next/image";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Checkbox from "@/components/form/input/Checkbox";
import Select from "@/components/form/Select";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function CreateEventForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <>
      <PageBreadCrumb title="Create Event" page="New Event" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Event Details
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fill in the details to create a new event
          </p>
        </div>
        
        <form className="space-y-6">
          {/* Event Title */}
          <div>
            <Label htmlFor="eventTitle">
              Event Title <span className="text-error-500">*</span>
            </Label>
            <Input 
              id="eventTitle"
              type="text" 
              placeholder="Enter event title" 
              required
            />
          </div>
          
          {/* Event Image Upload */}
          <div>
            <Label htmlFor="eventImage">
              Event Image
            </Label>
            <div className="mt-1 flex items-center justify-center w-full">
              {imagePreview ? (
                <div className="relative w-full">
                  <div className="relative h-64 w-full rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Event preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1.5 text-white hover:bg-opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="eventImage"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      SVG, PNG, JPG or GIF (Max. 2MB)
                    </p>
                  </div>
                  <input
                    id="eventImage"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>
          
          {/* Event Description */}
          <div>
            <Label htmlFor="eventDescription">
              Description <span className="text-error-500">*</span>
            </Label>
            <TextArea 
              id="eventDescription"
              placeholder="Enter event description"
              rows={4}
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
            >
              <option value="">Select a category</option>
              <option value="music">Music</option>
              <option value="technology">Technology</option>
              <option value="food">Food</option>
              <option value="art">Art</option>
              <option value="sports">Sports</option>
              <option value="education">Education</option>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Event Date */}
            <div>
              <Label htmlFor="eventDate">
                Date <span className="text-error-500">*</span>
              </Label>
              <Input 
                id="eventDate"
                type="date" 
                required
              />
            </div>
            
            {/* Event Time */}
            <div>
              <Label htmlFor="eventTime">
                Time <span className="text-error-500">*</span>
              </Label>
              <Input 
                id="eventTime"
                type="time" 
                required
              />
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
            />
          </div>
          
          {/* Public Event */}
          <div className="flex items-center gap-3">
            <Checkbox id="isPublic" />
            <Label htmlFor="isPublic" className="mb-0">
              Make this event public
            </Label>
          </div>
          
          {/* Submit Button */}
          <div>
            <button 
              type="submit"
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 sm:w-auto"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </>
  );
}