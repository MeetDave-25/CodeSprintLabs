'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const role = searchParams.get('role');
        const error = searchParams.get('error');

        if (error) {
            router.push(`/auth/login?error=${encodeURIComponent(error)}`);
            return;
        }

        if (token) {
            // Direct localStorage manipulation for simplicity if setToken is complex
            localStorage.setItem('token', token);
            // Optionally set user data if passed

            // Redirect based on role
            if (role === 'admin') {
                window.location.href = '/admin/dashboard';
            } else {
                window.location.href = '/student/dashboard';
            }
        } else {
            router.push('/auth/login');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );
}
