'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    BookOpen,
    CheckCircle,
    FileText,
    GraduationCap,
    CreditCard,
    Users,
    Settings,
    Megaphone,
    Award,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    ClipboardCheck,
    UserMinus,
    UsersRound
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const sidebarLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/enrollment-requests', label: 'Enrollment Requests', icon: UserCheck },
    { href: '/admin/withdrawal-requests', label: 'Withdrawal Requests', icon: UserMinus },
    { href: '/admin/internships', label: 'Internships', icon: BookOpen },
    { href: '/admin/tasks', label: 'Task Library', icon: CheckCircle },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/submissions', label: 'Submissions', icon: FileText },
    { href: '/admin/completion-reviews', label: 'Completion Reviews', icon: ClipboardCheck },
    { href: '/admin/courses', label: 'Courses', icon: GraduationCap },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/certificates', label: 'Certificates', icon: Award },
    { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/admin/team', label: 'Team Members', icon: UsersRound },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function AdminLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="min-h-screen flex bg-[#0a0a0f]">
            {/* Desktop Sidebar - Collapsible */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 256 : 80 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="hidden lg:flex flex-col glass-dark border-r border-white/10 relative"
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-6 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors z-50"
                >
                    {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>

                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-xl">CS</span>
                            </div>
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <span className="text-xl font-bold gradient-text block whitespace-nowrap">
                                            CodeSprint
                                        </span>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">Admin Panel</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-2">
                            {sidebarLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all relative group",
                                            isActive
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                                : "text-gray-400 hover:text-white hover:bg-white/10"
                                        )}
                                        title={!sidebarOpen ? link.label : undefined}
                                    >
                                        <link.icon size={20} className="flex-shrink-0" />
                                        <AnimatePresence>
                                            {sidebarOpen && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className="whitespace-nowrap overflow-hidden"
                                                >
                                                    {link.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>

                                        {!sidebarOpen && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                {link.label}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all w-full relative group"
                            title={!sidebarOpen ? 'Logout' : undefined}
                        >
                            <LogOut size={20} className="flex-shrink-0" />
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        Logout
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {!sidebarOpen && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Logout
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />

                        <motion.aside
                            initial={{ x: -256 }}
                            animate={{ x: 0 }}
                            exit={{ x: -256 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="fixed inset-y-0 left-0 z-50 w-64 glass-dark border-r border-white/10 lg:hidden"
                        >
                            <div className="flex flex-col h-full">
                                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                    <Link href="/" className="flex items-center space-x-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-xl">CS</span>
                                        </div>
                                        <div>
                                            <span className="text-xl font-bold gradient-text block">
                                                CodeSprint
                                            </span>
                                            <span className="text-xs text-gray-400">Admin Panel</span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => setMobileOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <nav className="flex-1 p-4 overflow-y-auto">
                                    <div className="space-y-2">
                                        {sidebarLinks.map((link) => {
                                            const isActive = pathname === link.href;
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className={cn(
                                                        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all",
                                                        isActive
                                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                                            : "text-gray-400 hover:text-white hover:bg-white/10"
                                                    )}
                                                    onClick={() => setMobileOpen(false)}
                                                >
                                                    <link.icon size={20} />
                                                    <span>{link.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </nav>

                                <div className="p-4 border-t border-white/10">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all w-full"
                                    >
                                        <LogOut size={20} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="lg:hidden glass-dark border-b border-white/10 p-4 flex items-center justify-between">
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">CS</span>
                        </div>
                        <span className="font-bold gradient-text">Admin</span>
                    </Link>
                    <div className="w-10" />
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute requiredRole="admin">
            <AdminLayoutContent>
                {children}
            </AdminLayoutContent>
        </ProtectedRoute>
    );
}
