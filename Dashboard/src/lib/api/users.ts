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

// Update user password
export async function changePassword(data: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  try {
    await api.post('/Users/ChangePassword', data);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Password change failed');
  }
}

// Update user profile image
export async function updateProfileImage(userId: string, imageFile: File): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('userId', userId);
    
    await api.post('/Users/UpdateProfileImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
    const res = await api.put<UserResponse>('/Users/UpdateUser', data);
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