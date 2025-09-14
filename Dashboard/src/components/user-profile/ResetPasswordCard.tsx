"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function ResetPasswordCard() {
  const { isOpen, openModal, closeModal } = useModal();
  
  // Form state
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error and success messages when user starts typing
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    // Validate form
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("All fields are required");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    
    try {
      // In a real implementation, you would call an API to change the password
      // Example:
      // await axios.post('/api/users/change-password', {
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword
      // });
      
      // For now, just show success message
      setSuccess("Password changed successfully");
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Close modal after a delay
      setTimeout(() => {
        closeModal();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Failed to change password. Please try again.");
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Password & Security
            </h4>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Change your password or reset your account security settings
            </p>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-4 h-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Change Password
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Change Password
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your password to keep your account secure.
            </p>
          </div>
          <form className="flex flex-col">
            {error && (
              <div className="mb-4 px-2 py-3 bg-error-50 text-error-600 rounded-lg dark:bg-error-900/30 dark:text-error-400">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 px-2 py-3 bg-success-50 text-success-600 rounded-lg dark:bg-success-900/30 dark:text-success-400">
                {success}
              </div>
            )}
            
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-y-5">
                <div>
                  <Label>Current Password</Label>
                  <Input 
                    type="password" 
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label>New Password</Label>
                  <Input 
                    type="password" 
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label>Confirm New Password</Label>
                  <Input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}