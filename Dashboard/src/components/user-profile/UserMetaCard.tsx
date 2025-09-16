"use client";
import React, { useState, useRef, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

export default function UserMetaCard() {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Default profile image path
  const DEFAULT_PROFILE_IMAGE = "/images/user/user-01.jpg";
  // API base URL
  const API_BASE_URL = "https://localhost:7235";
  
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
        const profilePictureUrl = localStorage.getItem('profilePictureUrl');
        
        setUserData({
          userId,
          fullName,
          email
        });
        
        // If profile picture URL exists in localStorage, use it
        if (profilePictureUrl) {
          console.log("Found profile picture URL in localStorage:", profilePictureUrl);
          // Check if it's a relative URL and handle appropriately
          if (profilePictureUrl.startsWith('/')) {
            setProfileImage(`${API_BASE_URL}${profilePictureUrl}`);
          } else {
            setProfileImage(profilePictureUrl);
          }
        } else {
          console.log("No profile picture URL found in localStorage, using default");
          setProfileImage(DEFAULT_PROFILE_IMAGE);
        }
      } catch (err) {
        console.error("Error accessing localStorage:", err);
      }
    }
  }, [isClient]);

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setIsSuccessModalOpen(true);
  };

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
        setIsLoading(true);
        
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showError("Image is too large. Please select an image under 5MB.");
          setIsLoading(false);
          return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          showError("Selected file is not an image. Please select a valid image file.");
          setIsLoading(false);
          return;
        }

        // Create a URL for the file to display as preview
        const imageUrl = URL.createObjectURL(file);
        
        // Create a FormData object to send to the server
        const formData = new FormData();
        formData.append('ProfilePicture', file);
        formData.append('UserId', userData.userId);
        
        // Get current user data to keep it intact
        const email = localStorage.getItem('email') || '';
        const fullName = localStorage.getItem('fullName') || '';
        
        // Handle roles carefully to avoid JSON parsing errors
        let roles;
        try {
          const rolesString = localStorage.getItem('roles');
          roles = rolesString ? JSON.parse(rolesString) : ['User'];
        } catch (error) {
          console.error('Error parsing roles:', error);
          roles = ['User'];
        }
        
        formData.append('Email', email);
        formData.append('FullName', fullName);
        formData.append('Role', roles[0]);
        
        console.log("Sending update with:", {
          userId: userData.userId,
          email: email,
          fullName: fullName,
          role: roles[0],
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });
        
        // Send the image to the server
        const response = await fetch(`${API_BASE_URL}/api/Users/UpdateUser`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: formData
        });
        
        if (response.ok) {
          // Get the response data
          const data = await response.json();
          console.log("Update response:", data);
          
          // If the response includes a profile picture URL, update localStorage
          if (data && data.profilePictureUrl) {
            console.log("Received profilePictureUrl from server:", data.profilePictureUrl);
            localStorage.setItem('profilePictureUrl', data.profilePictureUrl);
            
            // If it's a relative URL, prepend the base URL for display
            if (data.profilePictureUrl.startsWith('/')) {
              setProfileImage(`${API_BASE_URL}${data.profilePictureUrl}`);
            } else {
              setProfileImage(data.profilePictureUrl);
            }
            
            showSuccess("Profile picture updated successfully!");
          } else {
            
            // Use the local image URL as fallback
            setProfileImage(imageUrl);
            
            // Store the file URL temporarily
            // Note: This is not ideal as the URL will be invalidated when the page refreshes
            localStorage.setItem('profilePictureUrl', imageUrl);
            
            showSuccess("Profile picture updated successfully!");
          }
          
          setIsImageModalOpen(false);
        } else {
          // Try to get error details
          let errorDetail;
          try {
            const errorData = await response.json();
            errorDetail = errorData.title || errorData.message || response.statusText;
          } catch (parseError) {
            errorDetail = response.statusText;
          }
          
          console.error(`Failed to upload profile picture: ${response.status} ${errorDetail}`);
          showError(`Failed to upload profile picture: ${errorDetail}`);
        }
      } catch (err: any) {
        console.error("Error uploading profile image:", err);
        showError(err.message || "An unexpected error occurred while uploading the profile picture.");
      } finally {
        setIsLoading(false);
      }
    }
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
              <img
                src={profileImage}
                alt={userData.fullName || "User"}
                className="object-cover w-full h-full"
                onError={() => {
                  console.log("Error loading profile image, using default");
                  setProfileImage(DEFAULT_PROFILE_IMAGE);
                }}
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
              <img
                src={profileImage}
                alt={userData.fullName || "User"}
                className="object-cover w-full h-full"
                onError={() => {
                  console.log("Error loading profile image in modal, using default");
                  setProfileImage(DEFAULT_PROFILE_IMAGE);
                }}
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              size="sm" 
              onClick={handleUploadClick}
              disabled={isLoading}
              className="flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
              )}
              {isLoading ? "Processing..." : "Upload New Picture"}
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

      {/* Error Modal */}
      <Modal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} className="max-w-[400px] m-4">
        <div className="p-6 bg-white rounded-3xl dark:bg-gray-900">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Error
            </h4>
          </div>
          
          <p className="mb-6 text-gray-600 dark:text-gray-300">{errorMessage}</p>
          
          <div className="flex justify-end">
            <Button 
              size="sm" 
              onClick={() => setIsErrorModalOpen(false)}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} className="max-w-[400px] m-4">
        <div className="p-6 bg-white rounded-3xl dark:bg-gray-900">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Success
            </h4>
          </div>
          
          <p className="mb-6 text-gray-600 dark:text-gray-300">{successMessage}</p>
          
          <div className="flex justify-end">
            <Button 
              size="sm" 
              onClick={() => setIsSuccessModalOpen(false)}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}