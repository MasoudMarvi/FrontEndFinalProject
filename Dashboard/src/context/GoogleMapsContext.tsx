"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LoadScript } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBhLrwCAC_nm31ET5JPCv7vw0I5nPDGeZQ";

const libraries = ["places"] as ("places" | "drawing" | "geometry" | "localContext" | "visualization")[];

type GoogleMapsContextType = {
  isLoaded: boolean;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({ isLoaded: false });

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