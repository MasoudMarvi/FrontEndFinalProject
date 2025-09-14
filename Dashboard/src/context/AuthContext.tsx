// src/context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { UserResponse, updateUser } from '@/lib/api/users';

// Define a more complete user profile type that extends the basic UserResponse
export interface UserProfile extends UserResponse {
  // Add additional profile fields that might be needed
  phone?: string;
  bio?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  taxId?: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateUserProfile: (updatedUser: Partial<UserProfile>) => Promise<boolean>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateUserProfileImage: (imageFile: File) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Get the current user data from your API
      // You may need to create this endpoint if it doesn't exist
      const response = await api.get<UserProfile>('/Users/GetCurrentUser');
      setUser(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user information');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    await fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const updateProfile = async (updatedUser: Partial<UserProfile>): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (!user) {
        setError('User not authenticated');
        return false;
      }
      
      // Use your existing updateUser function but adapt it to your needs
      await updateUser({
        userId: user.userId,
        ...updatedUser
      });
      
      // Refresh user data
      await fetchUserData();
      return true;
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      setError('Failed to update profile information');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (!user) {
        setError('User not authenticated');
        return false;
      }
      
      // You need to create this API endpoint if it doesn't exist
      await api.post('/Users/ChangePassword', {
        userId: user.userId,
        currentPassword,
        newPassword
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError('Failed to update password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileImage = async (imageFile: File): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (!user) {
        setError('User not authenticated');
        return false;
      }
      
      // You need to create this API endpoint if it doesn't exist
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('userId', user.userId);
      
      await api.post('/Users/UpdateProfileImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh user data
      await fetchUserData();
      return true;
    } catch (err: any) {
      console.error('Error updating profile image:', err);
      setError('Failed to update profile image');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    updateUserProfile: updateProfile,
    updateUserPassword: updatePassword,
    updateUserProfileImage: updateProfileImage,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};