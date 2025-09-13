"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  
  // Password reset states
  const [resetStep, setResetStep] = useState(1); // 1: Enter current password, 2: Enter new password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };

  const togglePasswordSection = () => {
    setShowPasswordSection(!showPasswordSection);
  };

  const openResetPasswordModal = () => {
    setIsResetPasswordModalOpen(true);
    closeModal(); // Close the edit profile modal
  };

  const closeResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false);
    setResetStep(1);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  };

  const handleCurrentPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, you would verify the current password against the backend
    // For demo purposes, we'll just proceed to the next step
    if (currentPassword.trim() === "") {
      setError("Please enter your current password");
      return;
    }
    
    setError("");
    setResetStep(2);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
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
    
    // In a real application, you would submit the new password to the backend
    console.log("Password reset submitted");
    
    setError("");
    setSuccess(true);
    
    // Close modal after 3 seconds
    setTimeout(() => {
      closeResetPasswordModal();
    }, 3000);
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Hossein
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Marvi
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Mr.marvi2001@gmail.com
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                +98902 338 0854
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Team Manager
              </p>
            </div>
            
            {/* New Security Section */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Security
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                ••••••••••••
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
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Linkedin</Label>
                    <Input
                      type="text"
                      defaultValue="https://www.linkedin.com"
                    />
                  </div>

                  <div>
                    <Label>Instagram</Label>
                    <Input
                      type="text"
                      defaultValue="https://instagram.com"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input type="text" defaultValue="Hossein" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input type="text" defaultValue="Marvi" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input type="text" defaultValue="Mr.marvi2001@gmail.com" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input type="text" defaultValue="+98 902 338 0854" />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input type="text" defaultValue="Team Manager" />
                  </div>
                </div>
              </div>
              
              {/* New Security Section */}
              <div className="mt-7">
                <div className="flex items-center justify-between mb-5">
                  <h5 className="text-lg font-medium text-gray-800 dark:text-white/90">
                    Security
                  </h5>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={openResetPasswordModal}
                    className="flex items-center gap-2"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-4 h-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                      />
                    </svg>
                    Reset Password
                  </Button>
                </div>
                
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For security reasons, password changes are handled separately. 
                    Click the "Reset Password" button to update your password.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      
      {/* Reset Password Modal */}
      <Modal isOpen={isResetPasswordModalOpen} onClose={closeResetPasswordModal} className="max-w-[500px] m-4">
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
                      onClick={closeResetPasswordModal}
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