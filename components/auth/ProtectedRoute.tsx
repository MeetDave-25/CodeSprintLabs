'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                // Redirect to login with return URL
                router.push(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
            } else if (requiredRole && user?.role !== requiredRole) {
                // Redirect to appropriate dashboard if role doesn't match
                const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
                router.push(redirectPath);
            }
        }
    }, [isAuthenticated, user, isLoading, requiredRole, router, pathname]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated or wrong role
    if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        return null;
    }

    return <>{children}</>;
};
