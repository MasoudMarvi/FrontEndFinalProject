// src/app/(admin)/admin-dashboard/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import EventsMap from "@/components/maps/EventsMap";
import RecentEvents from "@/components/events/RecentEvents";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import Link from "next/link";
import { aboutApi, AboutDto } from "@/lib/api";

export default function AdminDashboard() {
  // About Us management state
  const [isAboutUsModalOpen, setIsAboutUsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch About Us data when modal opens
  const handleOpenAboutModal = async () => {
    setIsAboutUsModalOpen(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      setIsLoading(true);
      const data = await aboutApi.getAbout();
      if (data) {
        setTitle(data.title || '');
        setContent(data.content || '');
      }
    } catch (err) {
      console.error("Failed to fetch about data:", err);
      setError("Failed to load about information. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save About Us content
  const handleSaveAbout = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      await aboutApi.createOrUpdateAbout(title, content);
      setSuccessMessage('About Us information has been updated successfully.');
      
      // Keep modal open to show success message
      setTimeout(() => {
        if (successMessage) {
          setIsAboutUsModalOpen(false);
        }
      }, 2000);
    } catch (err) {
      console.error("Failed to update about data:", err);
      setError("Failed to save about information. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Admin Header with Action Buttons */}
      <div className="col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
          <Link 
            href="/form-elements" // Link to your existing CreateEventForm
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Event
          </Link>
          <Link 
            href="/admin-dashboard/manage-events"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Manage Events
          </Link>
          <Link 
            href="/admin-dashboard/manage-categories"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Manage Categories
          </Link>
        </div>
      </div>

      {/* Admin Metrics */}
      <div className="col-span-12">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4">Dashboard Overview</h2>
        <EcommerceMetrics />
      </div>
      
      {/* Full-width Map */}
      <div className="col-span-12">
        <EventsMap />
      </div>

      {/* Admin Management Shortcuts */}
      <div className="col-span-12 md:col-span-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 h-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Quick Actions
          </h3>
          
          <div className="space-y-3">
            <Link 
              href="/admin-dashboard/manage-events"
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Manage Events</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create, edit and delete events</p>
              </div>
            </Link>
            
            <Link 
              href="/admin-dashboard/manage-categories"
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
            >
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Manage Categories</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Organize your event categories</p>
              </div>
            </Link>
            
            <Link 
              href="/admin-dashboard/manage-users"
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
            >
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Manage Users</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">View and manage user accounts</p>
              </div>
            </Link>
            
            {/* New About Us Management Button */}
            <button 
              onClick={handleOpenAboutModal}
              className="flex w-full items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
            >
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-800 dark:text-white">Manage About Us</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your about us content</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Events Component - This is the one we're keeping */}
      <div className="col-span-12 md:col-span-8">
        <RecentEvents />
      </div>

      {/* About Us Modal */}
      {isAboutUsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Manage About Us Content</h3>
              <button 
                onClick={() => setIsAboutUsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-500 dark:bg-red-900/20 dark:text-red-400">
                      {error}
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-500 dark:bg-green-900/20 dark:text-green-400">
                      {successMessage}
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-brand-500 dark:focus:ring-brand-500"
                      placeholder="About Us Title"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Content (HTML supported)
                    </label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="block h-64 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-brand-500 dark:focus:ring-brand-500"
                      placeholder="Enter about us content here..."
                      required
                    ></textarea>
                  </div>
                </>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setIsAboutUsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAbout}
                disabled={isSaving || isLoading}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-70 flex items-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}