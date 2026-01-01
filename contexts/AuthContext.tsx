'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; // Import the API client

export type UserRole = 'student' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, role: UserRole) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string, role: UserRole) => {
        try {
            // Updated to use the correct endpoint structure
            // Your API uses /auth/login for login
            const response = await api.post('/auth/login', { email, password });

            // The API returns { message, user, token, ... }
            const { user: userData, token } = response.data;

            // Ensure the user role matches the requested role for safety/UX
            // (Optional: you might want to allow it and just redirect based on actual role)
            if (userData.role !== role && role !== 'admin') {
                // Allow admin to login as student if needed, or strictly enforce:
                // if (userData.role !== role) throw new Error('Role mismatch');
            }

            // Save token and user
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);

            // Redirect based on role
            const redirectPath = userData.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

            // Check if there's a return URL
            const params = new URLSearchParams(window.location.search);
            const returnUrl = params.get('returnUrl');

            if (returnUrl && returnUrl.startsWith('/')) {
                router.push(returnUrl);
            } else {
                router.push(redirectPath);
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            router.push('/');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
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
