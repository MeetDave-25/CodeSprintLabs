'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    BookOpen,
    FileText,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
    { month: 'Jan', students: 120, revenue: 4500 },
    { month: 'Feb', students: 180, revenue: 6200 },
    { month: 'Mar', students: 240, revenue: 8100 },
    { month: 'Apr', students: 310, revenue: 10500 },
    { month: 'May', students: 380, revenue: 12800 },
    { month: 'Jun', students: 450, revenue: 15200 },
];

export default function AdminDashboard() {
    const stats = [
        {
            label: 'Total Students',
            value: '10,234',
            change: '+12.5%',
            trend: 'up',
            icon: Users,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            label: 'Active Internships',
            value: '48',
            change: '+4',
            trend: 'up',
            icon: BookOpen,
            color: 'from-purple-600 to-pink-600'
        },
        {
            label: 'Pending Submissions',
            value: '156',
            change: '-8',
            trend: 'down',
            icon: FileText,
            color: 'from-orange-500 to-red-500'
        },
        {
            label: 'Total Revenue',
            value: '$57,200',
            change: '+18.2%',
            trend: 'up',
            icon: DollarSign,
            color: 'from-green-500 to-emerald-500'
        },
    ];

    const recentSubmissions = [
        { id: '1', student: 'Alice Johnson', task: 'Build REST API', status: 'pending', time: '5 min ago' },
        { id: '2', student: 'Bob Smith', task: 'React Components', status: 'pending', time: '12 min ago' },
        { id: '3', student: 'Carol White', task: 'Database Design', status: 'pending', time: '25 min ago' },
        { id: '4', student: 'David Brown', task: 'Authentication', status: 'pending', time: '1 hour ago' },
    ];

    const recentEnrollments = [
        { student: 'Emma Wilson', internship: 'Full Stack Web Dev', date: 'Today' },
        { student: 'Frank Miller', internship: 'Python Data Science', date: 'Today' },
        { student: 'Grace Lee', internship: 'Java Backend', date: 'Yesterday' },
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    Admin <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-gray-400">Overview of platform performance and activities</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
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
                                    <div className={`flex items-center space-x-1 text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                        {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        <span>{stat.change}</span>
                                    </div>
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
                        <CardDescription>Monthly revenue from course sales</CardDescription>
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
                            <Badge variant="warning" pulse>{recentSubmissions.length} Pending</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
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
                                        <Badge variant="warning">Pending</Badge>
                                        <div className="text-xs text-gray-400 mt-1 flex items-center">
                                            <Clock size={12} className="mr-1" />
                                            {submission.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Enrollments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Enrollments</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
