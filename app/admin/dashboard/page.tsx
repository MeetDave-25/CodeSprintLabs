'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    BookOpen,
    FileText,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '@/lib/services';

interface DashboardStats {
    totalStudents: number;
    activeInternships: number;
    pendingSubmissions: number;
    totalRevenue: number;
    studentsGrowth?: number;
    revenueGrowth?: number;
}

interface MonthlyData {
    month: string;
    students: number;
    revenue: number;
}

interface RecentSubmission {
    id: string;
    student: string;
    studentName?: string;
    task: string;
    taskTitle?: string;
    status: string;
    time: string;
    submittedAt?: string;
}

interface RecentEnrollment {
    student: string;
    studentName?: string;
    internship: string;
    internshipTitle?: string;
    date: string;
    enrolledAt?: string;
}

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalStudents: 0,
        activeInternships: 0,
        pendingSubmissions: 0,
        totalRevenue: 0,
    });
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
    const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch all dashboard data in parallel
            const [overviewRes, analyticsRes, submissionsRes, enrollmentsRes] = await Promise.all([
                adminService.getOverview().catch(() => ({ data: {} })),
                adminService.getAnalytics(6).catch(() => ({ data: { monthlyData: [] } })),
                adminService.getRecentSubmissions(5).catch(() => ({ data: { submissions: [] } })),
                adminService.getRecentEnrollments(5).catch(() => ({ data: { enrollments: [] } })),
            ]);

            // Process overview stats
            const overview = overviewRes.data;
            setStats({
                totalStudents: overview.totalStudents || overview.students || 0,
                activeInternships: overview.activeInternships || overview.internships || 0,
                pendingSubmissions: overview.pendingSubmissions || 0,
                totalRevenue: overview.totalRevenue || overview.revenue || 0,
                studentsGrowth: overview.studentsGrowth,
                revenueGrowth: overview.revenueGrowth,
            });

            // Process analytics data
            const analytics = analyticsRes.data;
            if (analytics.monthlyData && analytics.monthlyData.length > 0) {
                setMonthlyData(analytics.monthlyData);
            } else {
                // Generate empty placeholder data if no analytics
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                setMonthlyData(months.map(month => ({ month, students: 0, revenue: 0 })));
            }

            // Process recent submissions
            const submissionsData = submissionsRes.data.submissions || submissionsRes.data.data || [];
            setRecentSubmissions(submissionsData.slice(0, 5).map((s: any) => ({
                id: s.id || s._id,
                student: s.studentName || s.student || 'Unknown',
                task: s.taskTitle || s.task || 'Unknown Task',
                status: s.status || 'pending',
                time: formatTimeAgo(s.submittedAt || s.created_at),
            })));

            // Process recent enrollments
            const enrollmentsData = enrollmentsRes.data.enrollments || enrollmentsRes.data.data || [];
            setRecentEnrollments(enrollmentsData.slice(0, 5).map((e: any) => ({
                student: e.studentName || e.student || 'Unknown',
                internship: e.internshipTitle || e.internship || 'Unknown',
                date: formatDate(e.enrolledAt || e.created_at),
            })));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        if (!dateString) return 'Just now';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Today';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const statsCards = [
        {
            label: 'Total Students',
            value: stats.totalStudents.toLocaleString(),
            change: stats.studentsGrowth ? `${stats.studentsGrowth > 0 ? '+' : ''}${stats.studentsGrowth}%` : undefined,
            trend: stats.studentsGrowth && stats.studentsGrowth > 0 ? 'up' : 'down',
            icon: Users,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            label: 'Active Internships',
            value: stats.activeInternships.toString(),
            icon: BookOpen,
            color: 'from-purple-600 to-pink-600'
        },
        {
            label: 'Pending Submissions',
            value: stats.pendingSubmissions.toString(),
            icon: FileText,
            color: 'from-orange-500 to-red-500'
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            change: stats.revenueGrowth ? `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%` : undefined,
            trend: stats.revenueGrowth && stats.revenueGrowth > 0 ? 'up' : 'down',
            icon: DollarSign,
            color: 'from-green-500 to-emerald-500'
        },
    ];

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">
                        Admin <span className="gradient-text">Dashboard</span>
                    </h1>
                    <p className="text-gray-400">Overview of platform performance and activities</p>
                </div>
                <Button variant="outline" onClick={fetchDashboardData}>
                    <RefreshCw size={18} className="mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card hover3d glow>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                        <stat.icon size={24} className="text-white" />
                                    </div>
                                    {stat.change && (
                                        <div className={`flex items-center space-x-1 text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                            {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            <span>{stat.change}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Student Growth Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Student Growth</CardTitle>
                        <CardDescription>Monthly student enrollment trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="month" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a2e',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="students"
                                    stroke="url(#lineGradient)"
                                    strokeWidth={3}
                                    dot={{ fill: '#667eea', r: 4 }}
                                />
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#667eea" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Monthly revenue from enrollments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="month" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a2e',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#059669" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Submissions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Submissions</CardTitle>
                            {recentSubmissions.filter(s => s.status === 'pending').length > 0 && (
                                <Badge variant="warning" pulse>
                                    {recentSubmissions.filter(s => s.status === 'pending').length} Pending
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentSubmissions.length > 0 ? (
                            <div className="space-y-4">
                                {recentSubmissions.map((submission) => (
                                    <div
                                        key={submission.id}
                                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                                <span className="text-sm font-bold">{submission.student[0]}</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold">{submission.student}</div>
                                                <div className="text-sm text-gray-400">{submission.task}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={submission.status === 'pending' ? 'warning' : submission.status === 'approved' ? 'success' : 'default'}>
                                                {submission.status}
                                            </Badge>
                                            <div className="text-xs text-gray-400 mt-1 flex items-center justify-end">
                                                <Clock size={12} className="mr-1" />
                                                {submission.time}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                No recent submissions
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Enrollments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Enrollments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentEnrollments.length > 0 ? (
                            <div className="space-y-4">
                                {recentEnrollments.map((enrollment, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-lg bg-white/5"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                                <span className="text-sm font-bold">{enrollment.student[0]}</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold">{enrollment.student}</div>
                                                <div className="text-sm text-gray-400">{enrollment.internship}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-green-500">
                                            <CheckCircle size={16} className="mr-1" />
                                            <span className="text-sm">{enrollment.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                No recent enrollments
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
