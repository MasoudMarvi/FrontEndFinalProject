"use client";
import React, { useState, useRef, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Image from "next/image";

export default function UserMetaCard() {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Default profile image path
  const DEFAULT_PROFILE_IMAGE = "/images/user/user-01.jpg";
  
  // State for profile image and user data
  const [profileImage, setProfileImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [userData, setUserData] = useState({
    userId: '',
    fullName: '',
    email: '',
  });

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Get user data from localStorage when on client
  useEffect(() => {
    if (isClient) {
      try {
        const userId = localStorage.getItem('userId') || '';
        const fullName = localStorage.getItem('fullName') || '';
        const email = localStorage.getItem('email') || '';
        
        setUserData({
          userId,
          fullName,
          email
        });
      } catch (err) {
        console.error("Error accessing localStorage:", err);
      }
    }
  }, [isClient]);

  const handleImageClick = () => {
    setIsImageModalOpen(true);
  };

  const handleImageModalClose = () => {
    setIsImageModalOpen(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Create a URL for the file to display as preview
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl);
        
        // In a real implementation, you would upload the file to your server
        // For now, just close the modal
        setIsImageModalOpen(false);
        
        // Example of how you might handle this with an API:
        // const formData = new FormData();
        // formData.append('profileImage', file);
        // await axios.post('/api/users/profile-image', formData);
      } catch (err) {
        console.error("Error uploading profile image:", err);
      }
    }
  };

  const handleDeleteImage = async () => {
    // Reset to default image locally
    setProfileImage(DEFAULT_PROFILE_IMAGE);
    setIsImageModalOpen(false);
    
    // In a real implementation, you would call an API to delete the image
    // Example:
    // await axios.delete('/api/users/profile-image');
  };

  if (!isClient) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div 
              className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full cursor-pointer dark:border-gray-800 group"
              onClick={handleImageClick}
            >
              <Image
                width={80}
                height={80}
                src={profileImage}
                alt={userData.fullName || "User"}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userData.fullName || "User"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData.email || "No email specified"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Image Modal */}
      <Modal isOpen={isImageModalOpen} onClose={handleImageModalClose} className="max-w-[500px] m-4">
        <div className="p-6 bg-white rounded-3xl dark:bg-gray-900">
          <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
            Profile Picture
          </h4>
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 mb-4 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={128}
                height={128}
                src={profileImage}
                alt={userData.fullName || "User"}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button 
              size="sm" 
              onClick={handleUploadClick}
              className="flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              Upload New Picture
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDeleteImage}
              className="flex items-center justify-center gap-2 text-error-500 hover:bg-error-50 hover:border-error-300 dark:hover:bg-error-900/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Picture
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}