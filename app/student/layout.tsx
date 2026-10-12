'use client';

import React from 'react';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    GraduationCap,
    User,
    Briefcase,
    Compass,
    Library,
    ShieldCheck,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PortalShell, { type NavSection } from '@/components/layout/PortalShell';
import type { CommandItem } from '@/components/ui/CommandPalette';

const sections: NavSection[] = [
    {
        title: 'Workspace',
        links: [
            { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/student/my-internships', label: 'My Internships', icon: Briefcase },
            { href: '/student/tasks', label: 'Daily Tasks', icon: BookOpen },
            { href: '/student/my-courses', label: 'My Courses', icon: GraduationCap },
        ],
    },
    {
        title: 'Account',
        links: [
            { href: '/student/documents', label: 'Documents', icon: FileText },
            { href: '/student/profile', label: 'Profile', icon: User },
        ],
    },
    {
        title: 'Discover',
        links: [
            { href: '/internships', label: 'Browse Internships', icon: Compass },
            { href: '/courses', label: 'Browse Courses', icon: Library },
        ],
    },
];

const extraCommands: CommandItem[] = [
    { label: 'Verify a certificate', href: '/verify-certificate', icon: ShieldCheck, group: 'Tools', keywords: 'check validate' },
];

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute requiredRole="student">
            <PortalShell sections={sections} caption="Student portal" profileHref="/student/profile" extraCommands={extraCommands}>
                {children}
            </PortalShell>
        </ProtectedRoute>
    );
}
