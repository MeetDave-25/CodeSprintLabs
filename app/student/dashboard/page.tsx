'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    BookOpen,
    CheckCircle,
    Clock,
    TrendingUp,
    Award,
    Calendar,
    Target,
    Zap,
    LogOut
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Task {
    id: string;
    title: string;
    status: string;
    points: number;
    dueDate: string;
}

interface StudentStats {
    name: string;
    currentInternship: string;
    progress: number;
    tasksCompleted: number;
    totalTasks: number;
    streak: number;
    points: number;
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [studentData, setStudentData] = useState<StudentStats>({
        name: user?.name || 'Student',
        currentInternship: 'No active internship',
        progress: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        streak: 0,
        points: 0,
    });
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
    const [currentInternshipId, setCurrentInternshipId] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch student profile stats
                const statsResponse = await api.get('/student/profile/stats');
                if (statsResponse.data.status === 'success') {
                    const stats = statsResponse.data.data;
                    setStudentData(prev => ({
                        ...prev,
                        name: user?.name || prev.name,
                        tasksCompleted: stats.tasksCompleted || 0,
                        points: stats.totalPoints || stats.points || 0,
                        streak: stats.streak || 0,
                    }));
                }

                // Fetch my internships
                const internshipsResponse = await api.get('/student/my-internships');
                if (internshipsResponse.data.status === 'success' && internshipsResponse.data.data.length > 0) {
                    const activeInternship = internshipsResponse.data.data[0];
                    setCurrentInternshipId(activeInternship.id || activeInternship._id || activeInternship.internshipId);
                    setStudentData(prev => ({
                        ...prev,
                        currentInternship: activeInternship.title || activeInternship.internshipTitle || 'Active Internship',
                        progress: activeInternship.progress || 0,
                    }));
                }

                // Fetch tasks
                const tasksResponse = await api.get('/student/tasks');
                if (tasksResponse.data.status === 'success') {
                    const tasks = tasksResponse.data.data;
                    const mappedTasks = tasks.slice(0, 4).map((t: any) => ({
                        id: t.id || t._id,
                        title: t.title,
                        status: t.status || 'pending',
                        points: t.points || 0,
                        dueDate: t.dueDate || new Date().toISOString(),
                    }));
                    setRecentTasks(mappedTasks);
                    
                    const totalTasks = tasks.length;
                    const completedTasks = tasks.filter((t: any) => t.status === 'completed' || t.status === 'approved').length;
                    
                    setStudentData(prev => ({
                        ...prev,
                        totalTasks: totalTasks,
                        tasksCompleted: completedTasks,
                        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                    }));

                    // Set upcoming deadlines from pending tasks
                    const pendingTasks = tasks.filter((t: any) => t.status === 'pending');
                    const deadlines = pendingTasks.slice(0, 3).map((t: any) => {
                        const dueDate = new Date(t.dueDate || Date.now());
                        const now = new Date();
                        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        return {
                            task: t.title,
                            dueIn: diffDays <= 0 ? 'Overdue' : diffDays === 1 ? '1 day' : `${diffDays} days`,
                            priority: diffDays <= 2 ? 'high' : diffDays <= 5 ? 'medium' : 'low'
                        };
                    });
                    setUpcomingDeadlines(deadlines);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const stats = [
        { label: 'Tasks Completed', value: studentData.tasksCompleted, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
        { label: 'Current Streak', value: `${studentData.streak} days`, icon: Zap, color: 'from-orange-500 to-red-500' },
        { label: 'Total Points', value: studentData.points, icon: Award, color: 'from-purple-600 to-pink-600' },
        { label: 'Progress', value: `${studentData.progress}%`, icon: TrendingUp, color: 'from-cyan-500 to-blue-500' },
    ];

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-400">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back, <span className="gradient-text">{studentData.name}</span>! 👋
                    </h1>
                    <p className="text-gray-400">Here's your learning progress overview</p>
                </motion.div>

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
                                        <TrendingUp size={20} className="text-green-500" />
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-400">{stat.label}</div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current Internship */}
                        <Link href={currentInternshipId ? `/student/my-internships/${currentInternshipId}` : '/internships'}>
                            <Card className="cursor-pointer hover:border-purple-500/50 transition-all">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Current Internship</CardTitle>
                                            <CardDescription>{studentData.currentInternship}</CardDescription>
                                        </div>
                                        <Badge variant="info">{currentInternshipId ? 'Active' : 'None'}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">Overall Progress</span>
                                            <span className="font-semibold">{studentData.tasksCompleted} / {studentData.totalTasks} tasks</span>
                                        </div>
                                        <ProgressBar value={studentData.progress} variant="success" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-500">{studentData.tasksCompleted}</div>
                                            <div className="text-xs text-gray-400">Completed</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-500">1</div>
                                            <div className="text-xs text-gray-400">In Progress</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-500">{studentData.totalTasks - studentData.tasksCompleted - 1}</div>
                                            <div className="text-xs text-gray-400">Remaining</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm text-center text-purple-400">
                                        Click to view all tasks →
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Recent Tasks */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Tasks</CardTitle>
                                    <Link href="/student/tasks">
                                        <Button variant="ghost" size="sm">View All</Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                    task.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-500' :
                                                        'bg-blue-500/20 text-blue-500'
                                                    }`}>
                                                    {task.status === 'completed' ? <CheckCircle size={20} /> :
                                                        task.status === 'in-progress' ? <Clock size={20} /> :
                                                            <BookOpen size={20} />}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{task.title}</div>
                                                    <div className="text-sm text-gray-400">{task.points} points</div>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={
                                                    task.status === 'completed' ? 'success' :
                                                        task.status === 'in-progress' ? 'warning' :
                                                            'info'
                                                }
                                            >
                                                {task.status === 'completed' ? 'Completed' :
                                                    task.status === 'in-progress' ? 'In Progress' :
                                                        'Pending'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href="/student/tasks">
                                    <Button variant="primary" className="w-full">
                                        <BookOpen size={18} className="mr-2" />
                                        View Today's Task
                                    </Button>
                                </Link>
                                <Link href="/student/tasks">
                                    <Button variant="secondary" className="w-full">
                                        <CheckCircle size={18} className="mr-2" />
                                        Submit Task
                                    </Button>
                                </Link>
                                <Link href="/student/my-courses">
                                    <Button variant="outline" className="w-full">
                                        <Target size={18} className="mr-2" />
                                        My Courses
                                    </Button>
                                </Link>
                                {currentInternshipId && (
                                    <Link href={`/student/my-internships/${currentInternshipId}`}>
                                        <Button variant="ghost" className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                                            <LogOut size={18} className="mr-2" />
                                            Leave Internship
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Deadlines */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Deadlines</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {upcomingDeadlines.map((deadline, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <Calendar size={18} className="text-purple-500 mt-1" />
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm">{deadline.task}</div>
                                                <div className="text-xs text-gray-400">Due in {deadline.dueIn}</div>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full mt-2 ${deadline.priority === 'high' ? 'bg-red-500' :
                                                deadline.priority === 'medium' ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }`}></div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Achievement */}
                        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
                            <CardContent className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                    <Award size={32} className="text-white" />
                                </div>
                                <h3 className="font-bold mb-2">12 Day Streak! 🔥</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    You're on fire! Keep up the great work.
                                </p>
                                <div className="text-xs text-gray-500">
                                    Complete 3 more days to unlock a badge
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
