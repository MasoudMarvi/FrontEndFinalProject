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

// Sample events for the admin management table
const sampleEvents = [
  {
    id: '1',
    title: 'Summer Music Festival',
    date: 'Jul 15, 2025',
    category: 'Music',
    status: 'Active'
  },
  {
    id: '2',
    title: 'Tech Conference 2025',
    date: 'Aug 10, 2025',
    category: 'Technology',
    status: 'Active'
  },
  {
    id: '3',
    title: 'Food & Wine Festival',
    date: 'Sep 05, 2025',
    category: 'Food',
    status: 'Pending'
  },
  {
    id: '4',
    title: 'Art Exhibition',
    date: 'Jul 25, 2025',
    category: 'Art',
    status: 'Active'
  }
];

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

      {/* Event Management Table */}
      <div className="col-span-12 md:col-span-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Events
            </h3>
            <Link 
              href="/admin-dashboard/manage-events" // Create this page
              className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              View All Events
            </Link>
          </div>

          {/* Event Management Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {sampleEvents.map(event => (
                  <tr key={event.id}>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium">{event.title.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-gray-800 dark:text-white/90">{event.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {event.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
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
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        event.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/events/${event.id}`}
                          className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                        <Link 
                          href={`/events/${event.id}/chat`}
                          className="text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                        </Link>
                        <Link 
                          href={`/admin-dashboard/edit-event/${event.id}`}
                          className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </Link>
                        <button className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Events Component */}
      <div className="col-span-12">
        <RecentEvents />
      </div>
    </div>
  );
}