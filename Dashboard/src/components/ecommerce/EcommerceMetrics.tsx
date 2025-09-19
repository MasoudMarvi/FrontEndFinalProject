"use client";
import React, { useEffect, useState } from "react";
import { GroupIcon } from "@/icons";
import { getStats } from "@/lib/api/stats";

interface Stats {
  totalEvents: number;
  totalEventsPending: number;
  totalEventsActive: number;
  totalEventsCancelled: number;
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  totalCategories: number;
  topCategories: {
    categoryId: string;
    categoryName: string;
    description: string;
    events: any[];
  }[];
  totalChatMessages: number;
  totalChatMessagesToday: number;
  totalChatMessagesThisWeek: number;
  totalChatMessagesThisMonth: number;
}

export const EcommerceMetrics = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const categoryColors = ["bg-red-500", "bg-blue-500", "bg-green-500"];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load statistics");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="w-full p-6 text-center">Loading statistics...</div>;
  }

  if (error) {
    return <div className="w-full p-6 text-center text-red-500">{error}</div>;
  }

  const getTopCategories = () => {
    if (!stats || !stats.topCategories || stats.topCategories.length === 0) {
      return [];
    }
    
    return stats.topCategories.slice(0, 3).map((category, index) => ({
      name: category.categoryName || "Unknown",
      color: categoryColors[index] || "bg-gray-500"
    }));
  };

  const topCategories = getTopCategories();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
      {/* <!-- User Metrics Item --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Users
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats?.totalUsers || 0}
            </h4>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Admins</span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {stats?.totalAdmins || 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Regular Users</span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {stats?.totalRegularUsers || 0}
            </span>
          </div>
        </div>
      </div>
      
      {/* <!-- Events Metrics Item --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-6 text-gray-800 dark:text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Events
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats?.totalEvents || 0}
            </h4>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Pending</span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {stats?.totalEventsPending || 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Active</span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {stats?.totalEventsActive || 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Cancelled</span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {stats?.totalEventsCancelled || 0}
            </span>
          </div>
        </div>
      </div>

      {/* <!-- Category Distribution Item --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-6 text-gray-800 dark:text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7h-9"></path>
            <path d="M14 17H5"></path>
            <circle cx="17" cy="17" r="3"></circle>
            <circle cx="7" cy="7" r="3"></circle>
          </svg>
        </div>

        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Top Categories
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            Top 3 Categories
          </h4>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          {topCategories.length > 0 ? (
            topCategories.map((category, index) => (
              <div className="flex items-center gap-2" key={index}>
                <span className={`block h-3 w-3 rounded-full ${category.color}`}></span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {category.name}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">No categories available</div>
          )}
        </div>
      </div>

      {/* <!-- Chat Messages Item --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-6 text-gray-800 dark:text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Chat Messages
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats?.totalChatMessages || 0}
            </h4>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Today</span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {stats?.totalChatMessagesToday || 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">This Week</span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {stats?.totalChatMessagesThisWeek || 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">This Month</span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {stats?.totalChatMessagesThisMonth || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};