'use client';

import React from 'react';
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
    UserCheck,
    ClipboardCheck,
    UserMinus,
    UsersRound,
    ShieldCheck,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PortalShell, { type NavSection } from '@/components/layout/PortalShell';
import type { CommandItem } from '@/components/ui/CommandPalette';

const sections: NavSection[] = [
    {
        title: 'Overview',
        links: [
            { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ],
    },
    {
        title: 'Requests',
        links: [
            { href: '/admin/enrollment-requests', label: 'Enrollment Requests', icon: UserCheck },
            { href: '/admin/withdrawal-requests', label: 'Withdrawal Requests', icon: UserMinus },
            { href: '/admin/completion-reviews', label: 'Completion Reviews', icon: ClipboardCheck },
        ],
    },
    {
        title: 'Programs',
        links: [
            { href: '/admin/internships', label: 'Internships', icon: BookOpen },
            { href: '/admin/tasks', label: 'Task Library', icon: CheckCircle },
            { href: '/admin/submissions', label: 'Submissions', icon: FileText },
            { href: '/admin/courses', label: 'Courses', icon: GraduationCap },
        ],
    },
    {
        title: 'People',
        links: [
            { href: '/admin/students', label: 'Students', icon: Users },
            { href: '/admin/team', label: 'Team Members', icon: UsersRound },
        ],
    },
    {
        title: 'Operations',
        links: [
            { href: '/admin/payments', label: 'Payments', icon: CreditCard },
            { href: '/admin/certificates', label: 'Certificates', icon: Award },
            { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
            { href: '/admin/settings', label: 'Settings', icon: Settings },
        ],
    },
];

const extraCommands: CommandItem[] = [
    { label: 'Verify a certificate', href: '/verify-certificate', icon: ShieldCheck, group: 'Tools', keywords: 'check validate' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute requiredRole="admin">
            <PortalShell sections={sections} caption="Admin console" profileHref="/admin/settings" extraCommands={extraCommands}>
                {children}
            </PortalShell>
        </ProtectedRoute>
    );
}
