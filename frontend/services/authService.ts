import { api } from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    role: string;
    employeeId?: string;
}

export interface LoginResponse {
    accessToken: string;
    email: string;
    userId: string;
    fullName: string;
    role: string;
    isTemporaryPassword?: boolean;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (credentials: RegisterCredentials): Promise<LoginResponse> => {
        const response = await api.post('/auth/register', credentials);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getStoredUser: () => {
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === 'undefined') return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user from localStorage', e);
            localStorage.removeItem('user');
            return null;
        }
    },

    storeAuth: (token: string, user: any) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    changePassword: async (data: { userId: string; newPassword: string }) => {
        const response = await api.post('/auth/change-password', data);
        return response.data;
    },
};
