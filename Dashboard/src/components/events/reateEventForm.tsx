"use client";
import React from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Checkbox from "@/components/form/input/Checkbox";
import Select from "@/components/form/Select";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function CreateEventForm() {
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