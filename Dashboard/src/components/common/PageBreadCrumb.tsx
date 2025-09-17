"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface BreadcrumbProps {
  pageTitle: string;
  Url?: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, Url }) => {
  const [dashboardUrl, setDashboardUrl] = useState<string>('/user-dashboard'); // Default to user dashboard

  useEffect(() => {
    // Check user role from localStorage when component mounts
    if (typeof window !== 'undefined') {
      try {
        const userRoles = JSON.parse(localStorage.getItem('roles') || '[]');
        
        // Check if the user has admin role
        const isAdmin = Array.isArray(userRoles) && 
          userRoles.some((role: string) => role.toLowerCase() === 'admin');
        
        // Set the appropriate dashboard URL based on role
        setDashboardUrl(isAdmin ? '/admin-dashboard' : '/user-dashboard');
      } catch (error) {
        console.error('Error checking user role:', error);
        setDashboardUrl('/user-dashboard'); // Fallback to user dashboard
      }
    }
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        {pageTitle}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              href={Url || dashboardUrl}
            >
              Home
              <svg
                className="stroke-current"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </li>
          <li className="text-sm text-gray-800 dark:text-white/90">
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;