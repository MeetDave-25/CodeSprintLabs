'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import { cn, getInitials } from '@/lib/utils';

const navLinks = [
    { href: '/internships', label: 'Internships' },
    { href: '/courses', label: 'Courses' },
    { href: '/verify-certificate', label: 'Verify certificate' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
];

/** Simple brand mark + wordmark. */
export function Brand({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
    return (
        <Link href="/" className="flex items-center gap-2.5" aria-label="CodeSprint Labs home">
            <span className={cn('flex h-7 w-7 items-center justify-center rounded-[8px]', tone === 'light' ? 'bg-ink-950 text-brand-400' : 'bg-brand-400 text-ink-950')}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
                    <path d="M9 7l-5 5 5 5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13 8h7M13 12h5M13 16h3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                </svg>
            </span>
            <span className={cn('text-[15px] font-semibold tracking-[-0.01em]', tone === 'light' ? 'text-ink-950' : 'text-white')}>
                CodeSprint Labs
            </span>
        </Link>
    );
}

interface HeaderProps {
    /** Light for the marketing home page, dark for the remaining dark pages. */
    variant?: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ variant = 'dark' }) => {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated, user, logout } = useAuth();
    const light = variant === 'light';

    const isAdmin = user?.role === 'admin';
    const dashboardHref = isAdmin ? '/admin/dashboard' : '/student/dashboard';
    const settingsHref = isAdmin ? '/admin/settings' : '/student/profile';

    useEffect(() => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const linkCls = (active: boolean) =>
        cn(
            'text-[13px] transition-colors',
            light
                ? active ? 'text-ink-950' : 'text-cream-muted hover:text-ink-950'
                : active ? 'text-white' : 'text-gray-400 hover:text-white'
        );

    const menuItem = cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm',
        light ? 'text-ink-950 hover:bg-cream-2' : 'text-gray-200 hover:bg-white/[0.06]'
    );

    return (
        <>
            <header
                className={cn(
                    'fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl backdrop-saturate-150',
                    light ? 'border-black/10 bg-cream/95' : 'border-white/[0.08] bg-ink-950/75'
                )}
            >
                <nav className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5" aria-label="Primary">
                    <Brand tone={light ? 'light' : 'dark'} />

                    <div className="hidden items-center gap-8 lg:flex">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={linkCls(pathname.startsWith(link.href))} aria-current={pathname.startsWith(link.href) ? 'page' : undefined}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                <div className={light ? 'text-cream-muted' : ''}><NotificationDropdown /></div>
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold', light ? 'bg-ink-950 text-brand-400' : 'bg-white/10 text-white')}
                                        aria-label="Account menu"
                                        aria-expanded={userMenuOpen}
                                    >
                                        {getInitials(user?.name || 'U')}
                                    </button>
                                    <AnimatePresence>
                                        {userMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                                transition={{ duration: 0.12 }}
                                                className={cn(
                                                    'absolute right-0 mt-2 w-60 rounded-2xl border p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]',
                                                    light ? 'border-black/10 bg-cream' : 'border-white/10 bg-ink-850'
                                                )}
                                            >
                                                <div className="px-3 py-2">
                                                    <div className={cn('truncate text-sm font-medium', light ? 'text-ink-950' : 'text-white')}>{user?.name}</div>
                                                    <div className={cn('truncate text-xs', light ? 'text-cream-muted' : 'text-gray-500')}>{user?.email}</div>
                                                </div>
                                                <Link href={dashboardHref} className={menuItem}><LayoutDashboard size={15} /> Dashboard</Link>
                                                <Link href={settingsHref} className={menuItem}><Settings size={15} /> {isAdmin ? 'Settings' : 'Profile'}</Link>
                                                <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10">
                                                    <LogOut size={15} /> Log out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <Link href={dashboardHref} className={cn('hidden rounded-full px-4 py-1.5 text-[13px] font-medium sm:inline-flex', light ? 'bg-brand-400 text-ink-950 hover:bg-brand-300' : 'bg-white text-navy-950 hover:bg-gray-200')}>
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className={cn('hidden px-3 py-1.5 text-[13px] sm:inline-flex', light ? 'text-ink-950 hover:opacity-60' : 'text-gray-300 hover:text-white')}>
                                    Sign in
                                </Link>
                                <Link href="/auth/register" className={cn('hidden rounded-full px-4 py-1.5 text-[13px] font-medium sm:inline-flex', light ? 'bg-brand-400 text-ink-950 hover:bg-brand-300' : 'bg-white text-navy-950 hover:bg-gray-200')}>
                                    Get started
                                </Link>
                            </>
                        )}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={cn('rounded-lg p-2 lg:hidden', light ? 'text-ink-950' : 'text-gray-300')}
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </nav>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden lg:hidden"
                        >
                            <div className="mx-auto max-w-[1200px] px-5 pb-6 pt-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn('block border-b py-3.5 text-[17px] font-medium', light ? 'border-black/10 text-ink-950' : 'border-white/[0.08] text-white')}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    {isAuthenticated ? (
                                        <Link href={dashboardHref} className="col-span-2 rounded-full bg-brand-400 py-3 text-center text-sm font-semibold text-ink-950">Go to dashboard</Link>
                                    ) : (
                                        <>
                                            <Link href="/auth/login" className={cn('rounded-full border py-3 text-center text-sm font-medium', light ? 'border-black/15 text-ink-950' : 'border-white/15 text-white')}>Sign in</Link>
                                            <Link href="/auth/register" className="rounded-full bg-brand-400 py-3 text-center text-sm font-semibold text-ink-950">Get started</Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
            <div className="h-14" aria-hidden />
        </>
    );
};

export default Header;
