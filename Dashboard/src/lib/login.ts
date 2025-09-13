import api from './axios';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    fullName: string;
    roles: string[]; // یا میتوانید نوع دلخواه دیگری برای رول‌ها انتخاب کنید
  }

export async function login(data: LoginRequest): Promise<AuthResponse> {
    try {
        const res = await api.post<AuthResponse>('/Auth/login', data);
        // Store the token in local storage or a cookie
        const { accessToken, refreshToken, userId, email, roles } = res.data;

        // ذخیره توکن‌ها در localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userId);
        localStorage.setItem('email', email);
        localStorage.setItem('roles', JSON.stringify(roles)); // ذخیره رشته‌ای لیست رول‌ها
        return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Login failed');
    }
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
    try {
        const res = await api.post<AuthResponse>('/Users/CreateUser', data);
        return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Registration failed');
    }
}