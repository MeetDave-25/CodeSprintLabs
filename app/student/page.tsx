'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push('/student/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-400">Redirecting to dashboard...</p>
            </div>
        </div>
    );
}
