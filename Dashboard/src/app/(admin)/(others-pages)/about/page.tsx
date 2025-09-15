"use client";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { getAbout } from "@/lib/api/about";
import { AboutDto } from "@/lib/api/types";
import React, { useEffect, useState } from "react";

const AboutPage = () => {
  const [aboutData, setAboutData] = useState<AboutDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setIsLoading(true);
        const data = await getAbout();
        setAboutData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch about data:", err);
        setError("Failed to load about information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  return (
    <>
      <PageBreadCrumb
        title="About Us"
        breadcrumbItems={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "About Us",
            href: "/about",
          },
        ]}
      />

      <div className="mx-auto mt-8 max-w-5xl">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-card dark:border-gray-800 dark:bg-gray-900">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : aboutData ? (
            <div className="p-8">
              <h1 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">
                {aboutData.title}
              </h1>
              
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: aboutData.content || '' }} />
              </div>
              
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                {aboutData.updatedAt && (
                  <p>Last updated: {new Date(aboutData.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No information available at this time.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AboutPage;