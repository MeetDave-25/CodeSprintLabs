'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Github, Chrome, UserCircle, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FloatingRocket } from '@/components/3d/FloatingRocket';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('student');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password, role);
            if (role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/student/dashboard');
            }
        } catch (err: any) {
            if (err.response?.data?.action === 'verify_email') {
                router.push(`/auth/verify-email?email=${encodeURIComponent(err.response.data.email)}`);
            } else {
                setError(err.response?.data?.message || 'Login failed. Please try again.');
            }
            setIsLoading(false);
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
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Home</span>
                    </Link>

                    <Link href="/" className="flex items-center space-x-2 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">CS</span>
                        </div>
                        <span className="text-xl font-bold gradient-text">CodeSprint Labs</span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
                        <p className="text-gray-400">Sign in to continue your learning journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail size={18} />}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Lock size={18} />}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[42px] text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Login As</label>
                            <div className="relative">
                                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as UserRole)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                >
                                    <option value="student" className="bg-gray-900">Student</option>
                                    <option value="admin" className="bg-gray-900">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500" />
                                <span className="text-sm text-gray-400">Remember me</span>
                            </label>
                            <Link href="/auth/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading}>
                            Sign In
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[#0a0a0f] text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`} className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all">
                                <Github size={20} />
                                <span>GitHub</span>
                            </a>
                            <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`} className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all">
                                <Chrome size={20} />
                                <span>Google</span>
                            </a>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-gray-400">
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                            Sign up for free
                        </Link>
                    </p>
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
                <div className="absolute bottom-10 left-10 right-10 text-center">
                    <h2 className="text-3xl font-bold mb-4">Start Your Journey Today</h2>
                    <p className="text-gray-300">Join thousands of students building their tech careers</p>
                </div>
            </motion.div>
        </div>
    );
}
