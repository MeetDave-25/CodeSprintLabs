'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, User, LogOut, Settings } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import NotificationDropdown from '@/components/ui/NotificationDropdown';

const Header: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    const isLoggedIn = isAuthenticated;
    const userRole = user?.role || 'student';

    const publicLinks = [
        { href: '/', label: 'Home' },
        { href: '/internships', label: 'Internships' },
        { href: '/courses', label: 'Courses' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ];

    const studentLinks = [
        { href: '/student/dashboard', label: 'Dashboard' },
        { href: '/internships', label: 'Internships' },
        { href: '/courses', label: 'Courses' },
        { href: '/student/tasks', label: 'Tasks' },
        { href: '/student/my-courses', label: 'My Courses' },
    ];

    const adminLinks = [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/students', label: 'Students' },
        { href: '/admin/submissions', label: 'Submissions' },
    ];

    const getNavLinks = () => {
        if (!isLoggedIn) return publicLinks;
        return userRole === 'admin' ? adminLinks : studentLinks;
    };

    const navLinks = getNavLinks();

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
            <nav className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">CS</span>
                        </div>
                        <span className="text-xl font-bold gradient-text hidden sm:block">
                            CodeSprint Labs
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                {/* Notifications */}
                                <NotificationDropdown />

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                            <User size={16} />
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {userMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute right-0 mt-2 w-48 glass rounded-lg overflow-hidden"
                                            >
                                                <Link
                                                    href="/student/profile"
                                                    className="flex items-center space-x-2 px-4 py-3 hover:bg-white/10 transition-colors"
                                                >
                                                    <Settings size={16} />
                                                    <span>Profile</span>
                                                </Link>
                                                <button
                                                    onClick={logout}
                                                    className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-white/10 transition-colors text-red-400"
                                                >
                                                    <LogOut size={16} />
                                                    <span>Logout</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <div className="hidden md:flex items-center space-x-4">
                                <Button href="/auth/login" variant="ghost">Login</Button>
                                <Button href="/auth/register" variant="primary">Get Started</Button>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mt-4 space-y-2"
                        >
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!isLoggedIn && (
                                <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                                    <Button href="/auth/login" onClick={() => setMobileMenuOpen(false)} variant="ghost" className="w-full">Login</Button>
                                    <Button href="/auth/register" onClick={() => setMobileMenuOpen(false)} variant="primary" className="w-full">Get Started</Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>

        <div className="h-16 md:h-20" aria-hidden />
        </>
    );
};

export default Header;
