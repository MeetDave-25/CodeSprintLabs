'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Github, Chrome, User, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FloatingRocket } from '@/components/3d/FloatingRocket';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api'; // Import api instance


export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                password_confirmation: confirmPassword
            });

            if (response.data) {
                // Redirect to verify email page
                router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                        <h1 className="text-4xl font-bold mb-2">Create Account</h1>
                        <p className="text-gray-400">Start your learning journey today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            icon={<User size={18} />}
                            required
                        />

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

                        <div className="relative">
                            <Input
                                label="Confirm Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                icon={<Lock size={18} />}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-[42px] text-gray-400 hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="flex items-start space-x-2">
                            <input
                                type="checkbox"
                                required
                                className="w-4 h-4 mt-1 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500"
                            />
                            <label className="text-sm text-gray-400">
                                I agree to the{' '}
                                <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                                    Terms of Service
                                </Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading}>
                            Create Account
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
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                            Sign in
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
                    <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                    <p className="text-gray-300">Get access to industry-ready internships and courses</p>
                </div>
            </motion.div>
        </div>
    );
}
