'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AuthShell from '@/components/auth/AuthShell';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; // Import api instance
import { cn } from '@/lib/utils';

function scorePassword(pw: string) {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    return score;
}

const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-400'];

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const strength = useMemo(() => scorePassword(password), [password]);
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

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
                // TEMPORARILY MODIFIED - Direct login after registration (OTP disabled)
                // If token is returned, login directly
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    // Redirect to student dashboard
                    window.location.href = '/student/dashboard';
                } else {
                    // Fallback: Redirect to verify email page (when OTP is re-enabled)
                    router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <AuthShell
            title="Create your account"
            subtitle="Start building real-world experience today."
            footer={
                <>
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-medium text-white underline-offset-4 hover:underline">
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-500/25 bg-red-500/[0.08] p-3 text-sm text-red-300">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <Input
                    label="Full name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<User size={17} />}
                    required
                    autoFocus
                />

                <Input
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail size={17} />}
                    required
                />

                <div>
                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
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
                    {password.length > 0 && (
                        <div className="mt-2 flex items-center gap-3" aria-live="polite">
                            <div className="grid flex-1 grid-cols-4 gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                    <span
                                        key={i}
                                        className={cn('h-1 rounded-full transition-colors', i < strength ? strengthColors[strength] : 'bg-white/[0.08]')}
                                    />
                                ))}
                            </div>
                            <span className="w-16 text-right text-xs text-gray-500">{strengthLabels[strength]}</span>
                        </div>
                    )}
                </div>

                <Input
                    label="Confirm password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<Lock size={17} />}
                    required
                    error={confirmPassword.length > 0 && !passwordsMatch && confirmPassword.length >= password.length ? 'Passwords do not match' : undefined}
                    rightElement={passwordsMatch ? <Check size={17} className="mr-2 text-emerald-400" aria-label="Passwords match" /> : undefined}
                />

                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-400">
                    <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded" />
                    <span>
                        I agree to the{' '}
                        <Link href="/terms" className="text-gray-200 underline-offset-4 hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-gray-200 underline-offset-4 hover:underline">Privacy Policy</Link>
                    </span>
                </label>

                <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading}>
                    Create account
                </Button>
            </form>
        </AuthShell>
    );
}
