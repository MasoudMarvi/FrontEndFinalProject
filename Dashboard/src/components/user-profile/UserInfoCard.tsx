"use client";
import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { updateUser } from "@/lib/api/users"; // Import the updateUser function

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // User data state
  const [userData, setUserData] = useState({
    userId: '',
    fullName: '',
    email: '',
    role: ''
  });
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
  });

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Get user data from localStorage when on client
  useEffect(() => {
    if (isClient) {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || '';
        const fullName = localStorage.getItem('fullName') || '';
        const email = localStorage.getItem('email') || '';
        const rolesStr = localStorage.getItem('roles') || '["User"]';
        const roles = JSON.parse(rolesStr);
        const role = Array.isArray(roles) ? roles[0] : roles;
        
        setUserData({
          userId,
          fullName,
          email,
          role
        });
        
        setFormData({
          fullName,
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error accessing localStorage:", err);
        setError("Could not load user data");
        setLoading(false);
      }
    }
  }, [isClient]);

  // Reset status messages when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setUpdateSuccess(false);
      setUpdateError(null);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      
      // Create FormData for the multipart/form-data request
      const formDataObj = new FormData();
      formDataObj.append('UserId', userData.userId);
      formDataObj.append('FullName', formData.fullName);
      formDataObj.append('Email', userData.email); // Keep the original email
      formDataObj.append('Role', userData.role); // Keep the original role
      
      // Make the API request using the updateUser function
      await updateUser({
        userId: userData.userId,
        email: userData.email,
        fullName: formData.fullName,
        role: userData.role
      });
      
      // Update localStorage with the new fullName
      localStorage.setItem('fullName', formData.fullName);
      
      // Update the displayed user data
      setUserData(prev => ({
        ...prev,
        fullName: formData.fullName
      }));
      
      setUpdateSuccess(true);
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setUpdateError(err.message || "Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading && !isClient) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
          <span className="ml-2 text-gray-500 dark:text-gray-400">Loading user information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div className="col-span-2">
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.fullName || 'Not specified'}
              </p>
            </div>

            <div className="col-span-2">
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.email || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      {/* Edit Personal Info Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your full name to keep your profile up-to-date.
            </p>
          </div>
          
          {/* Status messages */}
          {updateError && (
            <div className="mb-4 mx-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {updateError}
            </div>
          )}
          
          {updateSuccess && (
            <div className="mb-4 mx-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              Profile updated successfully!
            </div>
          )}
          
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                  <div>
                    <Label>Full Name</Label>
                    <Input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <Input 
                      type="text" 
                      value={userData.email}
                      readOnly
                      disabled
                      className="bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeModal}
                type="button"
                disabled={updateLoading}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                type="submit"
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}