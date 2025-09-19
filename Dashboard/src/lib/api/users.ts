// users.ts (Updated version)
import api from '../axios';
import { CreateUserCommand, UpdateUserCommand, AuthResponse, RegisterResponse } from './types';

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  profilePictureUrl: string | null;
}

export async function getUsers(): Promise<UserResponse[]> {
  try {
    const res = await api.get<UserResponse[]>('/Users/GetUsers');
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to get users');
  }
}

export async function getCurrentUser(): Promise<UserProfile> {
  try {
    const res = await api.get<UserProfile>('/Users/GetCurrentUser');
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to get current user');
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{success: boolean; message: string}> {
  try {
    const formData = new FormData();
    formData.append('UserId', userId);
    formData.append('CurrentPassword', currentPassword);
    formData.append('NewPassword', newPassword);
    formData.append('ConfirmPassword', confirmPassword);
    
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
    let errorMessage = 'Password change failed';
    
    if (err.response) {
      errorMessage = err.response.data?.message || 
                     err.response.data?.title || 
                     `Error: ${err.response.status} ${err.response.statusText}`;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    throw new Error(errorMessage);
  }
}

export async function updateProfileImage(userId: string, imageFile: File): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('ProfilePicture', imageFile);
    formData.append('UserId', userId);
    
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
    
    if (response.data && response.data.profilePictureUrl) {
      localStorage.setItem('profilePictureUrl', response.data.profilePictureUrl);
    } else {
      const profilePictureUrl = `https://localhost:7235/uploads/users/${userId}.jpg?t=${Date.now()}`;
      localStorage.setItem('profilePictureUrl', profilePictureUrl);
    }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Profile image update failed');
  }
}

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

export async function createUser(data: FormData): Promise<UserResponse> {
  try {
    const res = await api.post<UserResponse>('/Auth/CreateUser', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'User creation failed');
  }
}

export async function updateUser(data: UpdateUserCommand): Promise<UserResponse> {
  try {
    const formData = new FormData();
    formData.append('UserId', data.userId);
    formData.append('Email', data.email || '');
    formData.append('FullName', data.fullName || '');
    formData.append('Role', data.role || '');
    
    if (data.profilePicture instanceof File) {
      formData.append('ProfilePicture', data.profilePicture);
    }
    
    const res = await api.put<UserResponse>('/Users/UpdateUser', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId === data.userId) {
      localStorage.setItem('fullName', data.fullName || '');
      if (data.role) {
        localStorage.setItem('roles', JSON.stringify([data.role]));
      }
    }
    
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
      role: 'User' // Default role
    };
    const res = await createUser(userData);
    return res;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Registration failed');
  }
}