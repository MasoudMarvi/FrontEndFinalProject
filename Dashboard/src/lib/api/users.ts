import api from '../axios';
import { CreateUserCommand, UpdateUserCommand, AuthResponse } from './types';

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
}): Promise<AuthResponse> {
  try {
    const userData: CreateUserCommand = {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: 'User' // Default role, adjust as needed
    };
    const res = await createUser(userData);
    return res;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Registration failed');
  }
}