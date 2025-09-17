import api from '../axios';
import { CreateUserCommand, UpdateUserCommand, AuthResponse, RegisterResponse } from './types';

export interface UserResponse {
  // Define this based on what your API returns
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export async function getUsers(): Promise<UserResponse[]> {
  try {
    const res = await api.get<UserResponse[]>('/Users/GetUsers');
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to get users');
  }
}
// Get current logged-in user profile
export async function getCurrentUser(): Promise<UserProfile> {
  try {
    const res = await api.get<UserProfile>('/Users/GetCurrentUser');
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to get current user');
  }
}

// Update the changePassword function in users.ts
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{success: boolean; message: string}> {
  try {
    // Create FormData for the multipart/form-data request
    const formData = new FormData();
    formData.append('UserId', userId);
    formData.append('CurrentPassword', currentPassword);
    formData.append('NewPassword', newPassword);
    formData.append('ConfirmPassword', confirmPassword);
    
    // Make the API request
    const response = await api.put('/Users/ChangePassword', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (err: any) {
    // Handle error responses
    let errorMessage = 'Password change failed';
    
    if (err.response) {
      // Get detailed error message if available
      errorMessage = err.response.data?.message || 
                     err.response.data?.title || 
                     `Error: ${err.response.status} ${err.response.statusText}`;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    throw new Error(errorMessage);
  }
}
// Update the updateProfileImage function in users.ts
export async function updateProfileImage(userId: string, imageFile: File): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('ProfilePicture', imageFile);
    formData.append('UserId', userId);
    
    // Get current user data to keep it intact
    const email = localStorage.getItem('email') || '';
    const fullName = localStorage.getItem('fullName') || '';
    const roles = JSON.parse(localStorage.getItem('roles') || '["User"]');
    
    formData.append('Email', email);
    formData.append('FullName', fullName);
    formData.append('Role', roles[0]);
    
    const response = await api.put('/Users/UpdateUser', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // If the response includes a profile picture URL, update localStorage
    if (response.data && response.data.profilePictureUrl) {
      localStorage.setItem('profilePictureUrl', response.data.profilePictureUrl);
    } else {
      // If not, use a URL pattern based on the user ID with a timestamp to avoid caching
      const profilePictureUrl = `https://localhost:7235/uploads/users/${userId}.jpg?t=${Date.now()}`;
      localStorage.setItem('profilePictureUrl', profilePictureUrl);
    }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Profile image update failed');
  }
}

// Define the extended user profile type
export interface UserProfile extends UserResponse {
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
export async function createUser(data: CreateUserCommand): Promise<AuthResponse> {
  try {
    const res = await api.post<AuthResponse>('/Users/CreateUser', data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'User creation failed');
  }
}

export async function updateUser(data: UpdateUserCommand): Promise<UserResponse> {
  try {
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('UserId', data.userId);
    formData.append('Email', data.email || '');
    formData.append('FullName', data.fullName || '');
    formData.append('Role', data.role || '');
    
    // If there's a profile picture, add it
    if (data.profilePicture instanceof File) {
      formData.append('ProfilePicture', data.profilePicture);
    }
    
    // Make the API request
    const res = await api.put<UserResponse>('/Users/UpdateUser', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Update localStorage with new fullName
    localStorage.setItem('fullName', data.fullName || '');
    
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'User update failed');
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await api.delete(`/Users/DeleteUser/${userId}`);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'User deletion failed');
  }
}

// This function can be used for registration
export async function register(data: {
  fullName: string;
  email: string;
  password: string;
}): Promise<RegisterResponse> {
  try {
    const userData: CreateUserCommand = {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: 'User' // Default role, adjust as needed
    };
    const res = await createUser(userData);
    console.log("responseRegister: " , res);
    return res;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Registration failed');
  }

  
}