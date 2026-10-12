'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, GraduationCap, ShieldCheck, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AuthShell from '@/components/auth/AuthShell';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const roles: { value: UserRole; label: string; icon: typeof GraduationCap }[] = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'admin', label: 'Admin', icon: ShieldCheck },
];

/** Only follow same-origin return URLs that belong to the signed-in role's area. */
function getReturnUrl(role: UserRole): string | null {
    if (typeof window === 'undefined') return null;
    const url = new URLSearchParams(window.location.search).get('returnUrl');
    if (!url || !url.startsWith('/') || url.startsWith('//')) return null;
    return url.startsWith(role === 'admin' ? '/admin' : '/student') ? url : null;
}

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
            const fallback = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
            router.push(getReturnUrl(role) ?? fallback);
        } catch (err: any) {
            if (err.response?.data?.action === 'verify_email') {
                router.push(`/auth/verify-email?email=${encodeURIComponent(err.response.data.email)}`);
            } else {
                setError(err.response?.data?.message || 'Login failed. Please check your details and try again.');
            }
            setIsLoading(false);
        }
    };

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to continue your learning journey."
            footer={
                <>
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register" className="font-medium text-white underline-offset-4 hover:underline">
                        Create one for free
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role selector */}
                <div role="radiogroup" aria-label="Sign in as" className="grid grid-cols-2 gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
                    {roles.map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            role="radio"
                            aria-checked={role === r.value}
                            onClick={() => setRole(r.value)}
                            className={cn(
                                'flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all',
                                role === r.value
                                    ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_1px_2px_rgba(0,0,0,0.4)]'
                                    : 'text-gray-500 hover:text-gray-300'
                            )}
                        >
                            <r.icon size={15} />
                            {r.label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-500/25 bg-red-500/[0.08] p-3 text-sm text-red-300">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <Input
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail size={17} />}
                    required
                    autoFocus
                />

                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label htmlFor="password" className="text-sm font-medium text-gray-200">Password</label>
                        <Link href="/contact" className="text-xs text-gray-500 transition-colors hover:text-white">
                            Forgot password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={<Lock size={17} />}
                        required
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="rounded-md p-2 text-gray-500 transition-colors hover:text-white"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        }
                    />
                </div>

                <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading}>
                    Sign in as {role === 'admin' ? 'admin' : 'student'}
                </Button>
            </form>
        </AuthShell>
    );
}
