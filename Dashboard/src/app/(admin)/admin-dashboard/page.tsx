// src/app/(admin)/admin-dashboard/page.tsx
import type { Metadata } from "next";
import React from "react";
import EventsMap from "@/components/maps/EventsMap";
import RecentEvents from "@/components/events/RecentEvents";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard - Event Management System",
  description: "Manage events and users in your system",
};

export default function AdminDashboard() {
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
          </div>
        </div>
      </div>

      {/* Recent Events Component - This is the one we're keeping */}
      <div className="col-span-12 md:col-span-8">
        <RecentEvents />
      </div>
    </div>
  );
}