// src/context/GoogleMapsContext.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LoadScript } from '@react-google-maps/api';

// Define the API key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBhLrwCAC_nm31ET5JPCv7vw0I5nPDGeZQ";

// Define the libraries to load
const libraries = ["places"] as ("places" | "drawing" | "geometry" | "localContext" | "visualization")[];

// Create context
type GoogleMapsContextType = {
  isLoaded: boolean;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({ isLoaded: false });

// Context provider component
export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        onLoad={() => setIsLoaded(true)}
      >
        {children}
      </LoadScript>
    </GoogleMapsContext.Provider>
  );
};

// Custom hook to use the context
export const useGoogleMaps = () => useContext(GoogleMapsContext);