"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

export const EcommerceMetrics = () => {
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
              3,782
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            11.01%
          </Badge>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Online</span>
            <span className="font-medium text-gray-800 dark:text-white/90">248</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Guest Users</span>
            <span className="font-medium text-gray-800 dark:text-white/90">1,253</span>
          </div>
        </div>
      </div>
      
      {/* <!-- Events Metrics Item --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          {/* Using inline SVG for calendar icon */}
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
              5,359
            </h4>
          </div>

          <Badge color="success">
            <ArrowUpIcon />
            15.25%
          </Badge>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Upcoming</span>
            <span className="font-medium text-gray-800 dark:text-white/90">3,124</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Cancelled</span>
            <span className="font-medium text-gray-800 dark:text-white/90">247</span>
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
            5 Categories
          </h4>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="block h-3 w-3 rounded-full bg-red-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">Music</span>
            </div>
            <span className="text-sm font-medium">35%</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="block h-3 w-3 rounded-full bg-blue-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">Technology</span>
            </div>
            <span className="text-sm font-medium">25%</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="block h-3 w-3 rounded-full bg-green-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">Food</span>
            </div>
            <span className="text-sm font-medium">15%</span>
          </div>
        </div>
      </div>

      {/* <!-- User Engagement Item --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          {/* Using inline SVG for chat icon */}
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
              12,845
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            23.9%
          </Badge>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Today</span>
            <span className="font-medium text-gray-800 dark:text-white/90">843</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Active Chats</span>
            <span className="font-medium text-gray-800 dark:text-white/90">32</span>
          </div>
        </div>
      </div>
    </div>
  );
};