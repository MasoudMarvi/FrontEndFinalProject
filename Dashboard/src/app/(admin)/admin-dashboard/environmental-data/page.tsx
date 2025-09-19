"use client";
import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Link from 'next/link';

interface EnvironmentalDataPoint {
  id: number;
  location: { lat: number; lng: number };
  name: string;
  airQuality: { value: number; status: string };
  temperature: { value: number; unit: string; status: string };
  noise: { value: number; unit: string; status: string };
  lastUpdated: string;
}

export default function EnvironmentalData() {
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalDataPoint[]>([
    {
      id: 1,
      location: { lat: 35.7219, lng: 51.3347 },
      name: 'City Center',
      airQuality: { value: 42, status: 'Good' },
      temperature: { value: 28, unit: 'C', status: 'Moderate' },
      noise: { value: 76, unit: 'dB', status: 'High' },
      lastUpdated: '2023-09-11T14:32:00Z'
    },
    {
      id: 2,
      location: { lat: 35.7246, lng: 51.3853 },
      name: 'East District',
      airQuality: { value: 68, status: 'Moderate' },
      temperature: { value: 30, unit: 'C', status: 'High' },
      noise: { value: 62, unit: 'dB', status: 'Moderate' },
      lastUpdated: '2023-09-11T14:15:00Z'
    },
    {
      id: 3,
      location: { lat: 35.7007, lng: 51.3947 },
      name: 'South Park Area',
      airQuality: { value: 32, status: 'Good' },
      temperature: { value: 26, unit: 'C', status: 'Good' },
      noise: { value: 48, unit: 'dB', status: 'Low' },
      lastUpdated: '2023-09-11T14:05:00Z'
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<EnvironmentalDataPoint | null>(null);
  const [newDataPoint, setNewDataPoint] = useState({
    name: '',
    location: { lat: '', lng: '' },
    airQuality: { value: '', status: 'Good' },
    temperature: { value: '', unit: 'C', status: 'Good' },
    noise: { value: '', unit: 'dB', status: 'Low' }
  });
  
  const [mapClickLocation, setMapClickLocation] = useState<{ lat: number; lng: number } | null>(null);

  const containerStyle = {
    width: '100%',
    height: '400px'
  };

  const defaultCenter = {
    lat: 35.7219,
    lng: 51.3347
  };

  function getStatusPinColor(status: string): string {
    const colorMap: Record<string, string> = {
      Good: "green",
      Moderate: "yellow", 
      Poor: "red",
      High: "red",
      Low: "green"
    };
    
    return colorMap[status] || "blue";
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      if (subChild) {
        setNewDataPoint(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: {
              ...prev[parent as keyof typeof prev][child as keyof typeof prev[keyof typeof prev]],
              [subChild]: value
            }
          }
        }));
      } else {
        setNewDataPoint(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value
          }
        }));
      }
    } else {
      setNewDataPoint(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new data point
    const newPoint = {
      id: Date.now(),
      ...newDataPoint,
      airQuality: {
        ...newDataPoint.airQuality,
        value: Number(newDataPoint.airQuality.value)
      },
      temperature: {
        ...newDataPoint.temperature,
        value: Number(newDataPoint.temperature.value)
      },
      noise: {
        ...newDataPoint.noise,
        value: Number(newDataPoint.noise.value)
      },
      location: {
        lat: Number(newDataPoint.location.lat),
        lng: Number(newDataPoint.location.lng)
      },
      lastUpdated: new Date().toISOString()
    };
    
    setEnvironmentalData(prev => [...prev, newPoint]);
    
    setIsAddModalOpen(false);
    setNewDataPoint({
      name: '',
      location: { lat: '', lng: '' },
      airQuality: { value: '', status: 'Good' },
      temperature: { value: '', unit: 'C', status: 'Good' },
      noise: { value: '', unit: 'dB', status: 'Low' }
    });
    setMapClickLocation(null);
  };

  const deleteDataPoint = (id: number) => {
    setEnvironmentalData(prev => prev.filter(item => item.id !== id));
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setMapClickLocation({ lat, lng });
      
      // Update form with coordinates
      setNewDataPoint(prev => ({
        ...prev,
        location: {
          lat: lat.toFixed(6),
          lng: lng.toFixed(6)
        },
        name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
      }));
      
      // Open the modal
      setIsAddModalOpen(true);
    }
  };

  return (
    <>
      <PageBreadCrumb title="Environmental Data Management" page="Admin" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Environmental Data Management</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage environmental data points that can be associated with events
            </p>
          </div>
          <div className="flex">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Data Point
            </button>
          </div>
        </div>
        
        {/* Environmental Data Map */}
        <div className="mb-6">
          <div className="p-2 mb-2 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">Tip:</span> Click anywhere on the map to add a new environmental data point at that location.
            </p>
          </div>
          
          <LoadScript googleMapsApiKey="AIzaSyBhLrwCAC_nm31ET5JPCv7vw0I5nPDGeZQ">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={defaultCenter}
              zoom={12}
              options={{
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
              }}
              onClick={handleMapClick}
            >
              {/* Existing Data Points */}
              {environmentalData.map(dataPoint => (
                <Marker
                  key={dataPoint.id}
                  position={dataPoint.location}
                  onClick={() => setSelectedDataPoint(dataPoint)}
                  icon={{
                    url: `http://maps.google.com/mapfiles/ms/icons/${getStatusPinColor(dataPoint.airQuality.status)}-dot.png`
                  }}
                />
              ))}

              {/* Temporary marker for map click */}
              {mapClickLocation && (
                <Marker
                  position={mapClickLocation}
                  icon={{
                    url: `http://maps.google.com/mapfiles/ms/icons/blue-dot.png`
                  }}
                />
              )}

              {/* Info Window for Selected Data Point */}
              {selectedDataPoint && (
                <InfoWindow
                  position={selectedDataPoint.location}
                  onCloseClick={() => setSelectedDataPoint(null)}
                >
                  <div className="p-2 max-w-xs">
                    <h4 className="font-bold text-gray-900">{selectedDataPoint.name}</h4>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Air Quality:</span>
                        <span className="text-sm font-medium">
                          {selectedDataPoint.airQuality.value} AQI ({selectedDataPoint.airQuality.status})
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Temperature:</span>
                        <span className="text-sm font-medium">
                          {selectedDataPoint.temperature.value}°{selectedDataPoint.temperature.unit} ({selectedDataPoint.temperature.status})
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Noise Level:</span>
                        <span className="text-sm font-medium">
                          {selectedDataPoint.noise.value} {selectedDataPoint.noise.unit} ({selectedDataPoint.noise.status})
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 text-xs text-gray-500 border-t border-gray-100">
                      Last updated: {new Date(selectedDataPoint.lastUpdated).toLocaleString()}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => deleteDataPoint(selectedDataPoint.id)}
                        className="flex-1 text-center text-xs font-medium text-white bg-red-500 py-1.5 px-2 rounded hover:bg-red-600"
                      >
                        <span className="flex items-center justify-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </span>
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mt-4 px-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Air Quality:</span>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">Good</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">Poor/High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">New Point</span>
            </div>
          </div>
        </div>
        
        {/* Environmental Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordinates
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Air Quality
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temperature
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Noise Level
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {environmentalData.map((data) => (
                <tr key={data.id}>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-medium text-gray-800 dark:text-white/90">{data.name}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {data.location.lat.toFixed(4)}, {data.location.lng.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        data.airQuality.status === 'Good' ? 'bg-green-500' : 
                        data.airQuality.status === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-gray-700 dark:text-gray-300">{data.airQuality.value} AQI</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        data.temperature.status === 'Good' ? 'bg-green-500' : 
                        data.temperature.status === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-gray-700 dark:text-gray-300">{data.temperature.value}°{data.temperature.unit}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        data.noise.status === 'Low' ? 'bg-green-500' : 
                        data.noise.status === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-gray-700 dark:text-gray-300">{data.noise.value} {data.noise.unit}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {new Date(data.lastUpdated).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete"
                        onClick={() => deleteDataPoint(data.id)}
                      >
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

      {/* Add Data Point Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Add New Data Point</h2>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setMapClickLocation(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newDataPoint.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. City Center"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    id="lat"
                    name="location.lat"
                    value={newDataPoint.location.lat}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 35.7219"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="lng" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    id="lng"
                    name="location.lng"
                    value={newDataPoint.location.lng}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 51.3347"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="airQuality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Air Quality (AQI)
                  </label>
                  <input
                    type="number"
                    id="airQuality"
                    name="airQuality.value"
                    value={newDataPoint.airQuality.value}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 42"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    id="temperature"
                    name="temperature.value"
                    value={newDataPoint.temperature.value}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 28"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="noise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Noise Level (dB)
                  </label>
                  <input
                    type="number"
                    id="noise"
                    name="noise.value"
                    value={newDataPoint.noise.value}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 76"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="airQualityStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Air Quality Status
                  </label>
                  <select
                    id="airQualityStatus"
                    name="airQuality.status"
                    value={newDataPoint.airQuality.status}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <option value="Good">Good</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="temperatureStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Temperature Status
                  </label>
                  <select
                    id="temperatureStatus"
                    name="temperature.status"
                    value={newDataPoint.temperature.status}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <option value="Good">Good</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="noiseStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Noise Level Status
                  </label>
                  <select
                    id="noiseStatus"
                    name="noise.status"
                    value={newDataPoint.noise.status}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setMapClickLocation(null);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none"
                >
                  Add Data Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}