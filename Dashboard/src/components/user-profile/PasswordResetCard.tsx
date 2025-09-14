// src/components/user-profile/PasswordResetCard.tsx
"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "@/context/AuthContext";

export default function PasswordResetCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, updateUserPassword } = useAuth();
  
  // Password reset states
  const [resetStep, setResetStep] = useState(1); // 1: Enter current password, 2: Enter new password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCloseModal = () => {
    closeModal();
    setResetStep(1);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  };

  const handleCurrentPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentPassword.trim() === "") {
      setError("Please enter your current password");
      return;
    }
    
    setError("");
    setResetStep(2);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword.trim() === "" || confirmPassword.trim() === "") {
      setError("Please fill in all fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    try {
      const success = await updateUserPassword(currentPassword, newPassword);
      
      if (success) {
        setError("");
        setSuccess(true);
        
        // Close modal after 3 seconds
        setTimeout(() => {
          handleCloseModal();
        }, 3000);
      } else {
        setError("Failed to update password. Please check your current password.");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("An error occurred while updating your password");
    }
  };

  if (!user) {
    return null; // Don't show this component if user is not logged in
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Password & Security
          </h4>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Password
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                ••••••••••••
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Last changed: Never
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-4 h-4 fill-current" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 2a2 2 0 00-2 2v1H7a2 2 0 00-2 2v9a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-1V4a2 2 0 00-2-2zM9 4a1 1 0 112 0v1H9V4zM8 8a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          Reset Password
        </button>
      </div>

      {/* Reset Password Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          <div className="mb-6">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
              Reset Password
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {resetStep === 1 
                ? "Enter your current password to proceed." 
                : "Create a new password for your account."}
            </p>
          </div>
          
          {success ? (
            <div className="p-4 mb-6 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800">
              <p className="text-center">
                Your password has been updated successfully!
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                  <p>{error}</p>
                </div>
              )}
              
              {resetStep === 1 ? (
                <form onSubmit={handleCurrentPasswordSubmit}>
                  <div className="mb-6">
                    <Label>
                      Current Password <span className="text-error-500">*</span>
                    </Label>
                    <Input 
                      type="password" 
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      type="submit"
                    >
                      Continue
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePasswordReset}>
                  <div className="space-y-6 mb-6">
                    <div>
                      <Label>
                        New Password <span className="text-error-500">*</span>
                      </Label>
                      <Input 
                        type="password" 
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    
                    <div>
                      <Label>
                        Confirm Password <span className="text-error-500">*</span>
                      </Label>
                      <Input 
                        type="password" 
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setResetStep(1)}
                    >
                      Back
                    </Button>
                    <Button 
                      size="sm" 
                      type="submit"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}