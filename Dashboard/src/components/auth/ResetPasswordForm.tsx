"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  
  // Form states
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Flow control states
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: Verification Code, 3: New Password
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Step 1: Request password reset code
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send a verification code to the user's email
    console.log(`Sending verification code to ${email}`);
    
    // Move to the next step
    setCurrentStep(2);
  };
  
  // Step 2: Verify code and proceed to password reset
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would verify the code against the backend
    // For demo purposes, we'll accept any code
    if (verificationCode.trim() === "") {
      setError("Please enter the verification code");
      return;
    }
    
    setError("");
    setCurrentStep(3);
  };
  
  // Step 3: Set new password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    setError("");
    
    // In a real app, this would update the password in your backend
    console.log(`Resetting password for ${email}`);
    
    // Show success message
    setIsSuccess(true);
    
    // Redirect to sign in page after 3 seconds
    setTimeout(() => {
      router.push("/signin");
    }, 3000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col flex-1 lg:w-1/2 w-full mx-auto">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
          <Link
            href="/signin"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Back to Sign In
          </Link>
        </div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="flex flex-col items-center mb-8">
              <Image 
                src="/images/Events.png" 
                alt="Event App Logo"
                width={150}
                height={150}
                className="mb-4"
              />
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Reset Your Password
              </h1>
              {currentStep === 1 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Enter your email address and we'll send you a verification code
                </p>
              )}
              {currentStep === 2 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Enter the verification code sent to {email}
                </p>
              )}
              {currentStep === 3 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Create your new password
                </p>
              )}
            </div>
            
            <div>
              {isSuccess ? (
                <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800">
                  <p className="text-center">
                    Your password has been reset successfully! Redirecting to login...
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                      <p>{error}</p>
                    </div>
                  )}
                  
                  {/* Step 1: Email Form */}
                  {currentStep === 1 && (
                    <form onSubmit={handleRequestCode}>
                      <div className="space-y-6">
                        <div>
                          <Label>
                            Email <span className="text-error-500">*</span>{" "}
                          </Label>
                          <Input 
                            placeholder="info@gmail.com" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Button className="w-full" size="sm" type="submit">
                            Send Verification Code
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                  
                  {/* Step 2: Verification Code Form */}
                  {currentStep === 2 && (
                    <form onSubmit={handleVerifyCode}>
                      <div className="space-y-6">
                        <div>
                          <Label>
                            Verification Code <span className="text-error-500">*</span>{" "}
                          </Label>
                          <Input 
                            placeholder="Enter 6-digit code" 
                            type="text" 
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                            maxLength={6}
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            Didn't receive a code?{" "}
                            <button 
                              type="button"
                              className="text-brand-500 hover:text-brand-600"
                              onClick={() => {
                                console.log(`Resending code to ${email}`);
                                // In a real app, this would resend the verification code
                              }}
                            >
                              Resend
                            </button>
                          </p>
                        </div>
                        <div className="flex space-x-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setCurrentStep(1)}
                          >
                            Back
                          </Button>
                          <Button className="flex-1" size="sm" type="submit">
                            Verify Code
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                  
                  {/* Step 3: New Password Form */}
                  {currentStep === 3 && (
                    <form onSubmit={handleResetPassword}>
                      <div className="space-y-6">
                        <div>
                          <Label>
                            New Password <span className="text-error-500">*</span>{" "}
                          </Label>
                          <Input 
                            type="password" 
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
                            Confirm Password <span className="text-error-500">*</span>{" "}
                          </Label>
                          <Input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex space-x-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setCurrentStep(2)}
                          >
                            Back
                          </Button>
                          <Button className="flex-1" size="sm" type="submit">
                            Reset Password
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                </>
              )}

              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Remember your password? {""}
                  <Link
                    href="/signin"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}