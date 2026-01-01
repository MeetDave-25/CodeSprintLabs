'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FloatingRocket } from '@/components/3d/FloatingRocket';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const email = searchParams.get('email') || '';
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!email) {
            router.push('/auth/login');
        }
    }, [email, router]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/verify-otp', {
                email,
                code: otp
            });

            if (response.data.token) {
                // Manually setting token in localStorage for now as AuthContext might not expose a direct 'setToken'
                // Ideally, AuthContext should have a method for this.
                localStorage.setItem('token', response.data.token);
                // Force reload or redirect to dashboard which will pick up the token
                window.location.href = '/student/dashboard';
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Verification failed. Please check the code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError('');
        setMessage('');

        try {
            await api.post('/auth/resend-otp', { email });
            setMessage('Verification code resent successfully. Please check your email.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend code.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Login</span>
                    </Link>

                    <div className="mb-8">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 text-purple-400">
                            <Mail size={32} />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
                        <p className="text-gray-400">
                            We've sent a 6-digit verification code to <span className="text-white font-medium">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                                {message}
                            </div>
                        )}

                        <div>
                            <Input
                                label="Verification Code"
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-2xl tracking-widest"
                                required
                            />
                        </div>

                        <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading}>
                            Verify Email
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending}
                                className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                            >
                                <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
                                {isResending ? 'Resending...' : 'Resend Code'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30"></div>
                <div className="relative z-10 w-full h-full">
                    <FloatingRocket />
                </div>
            </motion.div>
        </div>
    );
}
