import api from '../axios';
import { AuthResponse, LoginCommand, RefreshTokenRequest } from './types';

export async function login(data: LoginCommand): Promise<AuthResponse> {
  try {
    const res = await api.post<AuthResponse>('/Auth/login', data);
    // Store the token in local storage or a cookie
    const { accessToken, refreshToken, userId, email, roles, fullName } = res.data;

    // Store tokens in localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('roles', JSON.stringify(roles));
    return res.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Login failed');
  }
}

export async function refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
  try {
    const res = await api.post<AuthResponse>('/Auth/refresh-token', data);
    // Update stored tokens
    const { accessToken, refreshToken, userId, email, roles, fullName } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('roles', JSON.stringify(roles));
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Token refresh failed');
  }
}

export function logout(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('email');
  localStorage.removeItem('fullName');
  localStorage.removeItem('roles');
}