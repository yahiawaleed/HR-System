'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface User {
    sub: string;
    email: string;
    role: string;
    fullName: string;
    userId: string;
    isTemporaryPassword?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    register: (data: any) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = authService.getStoredUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        authService.storeAuth(token, userData);
        setUser(userData);
    };

    const register = async (data: any) => {
        const response = await authService.register(data);
        authService.storeAuth(response.accessToken, response);
        setUser(response);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
