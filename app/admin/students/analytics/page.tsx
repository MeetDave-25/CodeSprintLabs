'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, TrendingUp, BookOpen, Briefcase, Award, Star,
    BarChart2, ArrowLeft, Loader2, CheckCircle, Clock, XCircle,
    Target, Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AnalyticsData {
    overall: {
        totalStudents: number;
        activeStudents: number;
        avgPoints: number;
        avgTasksCompleted: number;
        totalTasksCompleted: number;
    };
    topCourses: { title: string; domain: string; enrollments: number }[];
    topInternships: { title: string; domain: string; enrollments: number }[];
    registrationTrend: { month: string; newStudents: number }[];
    topStudents: { id: string; name: string; email: string; avatar?: string; totalPoints: number; tasksCompleted: number; coursesCompleted: number }[];
    domainBreakdown: { domain: string; count: number }[];
    submissions: { total: number; approved: number; rejected: number; pending: number };
    retention: { completedStudents: number; completedEnrollments: number };
}

export default function StudentAnalyticsPage() {
    const router = useRouter();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/students/analytics')
            .then(res => setData(res.data.data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-brand-400" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 text-center text-gray-400">
                Failed to load analytics. Please try again.
            </div>
        );
    }

    const { overall, topCourses, topInternships, registrationTrend, topStudents, domainBreakdown, submissions, retention } = data;

    const approvalRate = submissions.total > 0
        ? Math.round((Number(submissions.approved) / Number(submissions.total)) * 100)
        : 0;

    const completionRate = overall.totalStudents > 0
        ? Math.round((Number(retention.completedStudents) / Number(overall.totalStudents)) * 100)
        : 0;

    const maxCourseEnrollment = Math.max(...topCourses.map(c => Number(c.enrollments)), 1);
    const maxInternshipEnrollment = Math.max(...topInternships.map(i => Number(i.enrollments)), 1);
    const maxDomainCount = Math.max(...domainBreakdown.map(d => Number(d.count)), 1);
    const maxTrend = Math.max(...registrationTrend.map(t => Number(t.newStudents)), 1);

    const statCards = [
        { label: 'Total Students', value: Number(overall.totalStudents), icon: Users, color: 'text-brand-400' },
        { label: 'Active Students', value: Number(overall.activeStudents), icon: TrendingUp, color: 'text-green-400' },
        { label: 'Avg Points / Student', value: Math.round(Number(overall.avgPoints)), icon: Star, color: 'text-yellow-400' },
        { label: 'Total Tasks Done', value: Number(overall.totalTasksCompleted), icon: CheckCircle, color: 'text-blue-400' },
        { label: 'Submission Approval', value: `${approvalRate}%`, icon: Target, color: 'text-emerald-400' },
        { label: 'Internship Completion', value: `${completionRate}%`, icon: Award, color: 'text-purple-400' },
    ];

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/admin/students')}>
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Students
                </Button>
            </div>
            <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <BarChart2 className="text-brand-400" size={36} />
                    Student Analytics
                </h1>
                <p className="text-gray-400">In-depth breakdown of student activity, enrollments, and performance</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <s.icon size={22} className={`mx-auto mb-2 ${s.color}`} />
                                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Registration Trend + Domain Breakdown */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Monthly Registrations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-brand-400" />
                            New Student Registrations
                        </CardTitle>
                        <CardDescription>Last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {registrationTrend.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No registration data yet</p>
                        ) : (
                            <div className="space-y-3">
                                {registrationTrend.map((item) => (
                                    <div key={item.month} className="flex items-center gap-3">
                                        <span className="text-sm text-gray-400 w-14 shrink-0">{item.month}</span>
                                        <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(4, (Number(item.newStudents) / maxTrend) * 100)}%` }}
                                                transition={{ duration: 0.6 }}
                                                className="h-full bg-gradient-to-r from-brand-400 to-brand-300 rounded-full flex items-center justify-end pr-2"
                                            >
                                                <span className="text-xs font-bold text-black">{item.newStudents}</span>
                                            </motion.div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Domain Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase size={18} className="text-purple-400" />
                            Enrollments by Domain
                        </CardTitle>
                        <CardDescription>Which domains attract most students</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {domainBreakdown.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No enrollment data yet</p>
                        ) : (
                            <div className="space-y-3">
                                {domainBreakdown.map((item, i) => {
                                    const colors = ['from-brand-400 to-brand-300', 'from-purple-500 to-purple-400', 'from-blue-500 to-blue-400', 'from-green-500 to-green-400', 'from-orange-500 to-orange-400'];
                                    return (
                                        <div key={item.domain} className="flex items-center gap-3">
                                            <span className="text-sm text-gray-300 w-28 shrink-0 truncate">{item.domain || 'Other'}</span>
                                            <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.max(4, (Number(item.count) / maxDomainCount) * 100)}%` }}
                                                    transition={{ duration: 0.6, delay: i * 0.05 }}
                                                    className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full flex items-center justify-end pr-2`}
                                                >
                                                    <span className="text-xs font-bold text-black">{item.count}</span>
                                                </motion.div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Courses + Top Internships */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Most Enrolled Courses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen size={18} className="text-blue-400" />
                            Most Enrolled Courses
                        </CardTitle>
                        <CardDescription>Courses with the highest student interest</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topCourses.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No course enrollment data yet</p>
                        ) : (
                            <div className="space-y-4">
                                {topCourses.map((course, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div>
                                                <span className="text-sm font-medium">{course.title}</span>
                                                {course.domain && <span className="ml-2 text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{course.domain}</span>}
                                            </div>
                                            <span className="text-sm font-bold text-blue-400">{course.enrollments}</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(2, (Number(course.enrollments) / maxCourseEnrollment) * 100)}%` }}
                                                transition={{ duration: 0.6, delay: i * 0.06 }}
                                                className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Most Enrolled Internships */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase size={18} className="text-green-400" />
                            Most Enrolled Internships
                        </CardTitle>
                        <CardDescription>Internships students apply to most</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topInternships.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No internship enrollment data yet</p>
                        ) : (
                            <div className="space-y-4">
                                {topInternships.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div>
                                                <span className="text-sm font-medium">{item.title}</span>
                                                {item.domain && <span className="ml-2 text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{item.domain}</span>}
                                            </div>
                                            <span className="text-sm font-bold text-green-400">{item.enrollments}</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(2, (Number(item.enrollments) / maxInternshipEnrollment) * 100)}%` }}
                                                transition={{ duration: 0.6, delay: i * 0.06 }}
                                                className="h-2 bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Submission Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target size={18} className="text-yellow-400" />
                        Submission Performance
                    </CardTitle>
                    <CardDescription>Overall task submission approval breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Submissions', value: submissions.total, icon: Zap, color: 'text-gray-300', bg: 'bg-white/10' },
                            { label: 'Approved', value: submissions.approved, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
                            { label: 'Pending Review', value: submissions.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                            { label: 'Rejected', value: submissions.rejected, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
                        ].map((item) => (
                            <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
                                <item.icon size={24} className={`mx-auto mb-2 ${item.color}`} />
                                <div className={`text-3xl font-bold ${item.color}`}>{Number(item.value)}</div>
                                <div className="text-sm text-gray-400 mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>
                    {Number(submissions.total) > 0 && (
                        <div className="mt-6">
                            <div className="text-sm text-gray-400 mb-2">Approval breakdown</div>
                            <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                                {Number(submissions.approved) > 0 && (
                                    <div
                                        className="bg-green-500 h-full transition-all"
                                        style={{ width: `${(Number(submissions.approved) / Number(submissions.total)) * 100}%` }}
                                        title={`Approved: ${submissions.approved}`}
                                    />
                                )}
                                {Number(submissions.pending) > 0 && (
                                    <div
                                        className="bg-yellow-500 h-full transition-all"
                                        style={{ width: `${(Number(submissions.pending) / Number(submissions.total)) * 100}%` }}
                                        title={`Pending: ${submissions.pending}`}
                                    />
                                )}
                                {Number(submissions.rejected) > 0 && (
                                    <div
                                        className="bg-red-500 h-full transition-all"
                                        style={{ width: `${(Number(submissions.rejected) / Number(submissions.total)) * 100}%` }}
                                        title={`Rejected: ${submissions.rejected}`}
                                    />
                                )}
                            </div>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Approved {approvalRate}%</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />Pending {Number(submissions.total) > 0 ? Math.round((Number(submissions.pending) / Number(submissions.total)) * 100) : 0}%</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Rejected {Number(submissions.total) > 0 ? Math.round((Number(submissions.rejected) / Number(submissions.total)) * 100) : 0}%</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Performing Students */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award size={18} className="text-yellow-400" />
                        Top Performing Students
                    </CardTitle>
                    <CardDescription>Ranked by total points earned</CardDescription>
                </CardHeader>
                <CardContent>
                    {topStudents.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">No student data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {topStudents.map((student, i) => (
                                <motion.div
                                    key={student.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/admin/students?highlight=${student.id}`)}
                                >
                                    {/* Rank */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                        i === 0 ? 'bg-yellow-500 text-black' :
                                        i === 1 ? 'bg-gray-400 text-black' :
                                        i === 2 ? 'bg-amber-700 text-white' :
                                        'bg-white/10 text-gray-400'
                                    }`}>
                                        {i + 1}
                                    </div>
                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-full bg-brand-400/20 flex items-center justify-center shrink-0 overflow-hidden">
                                        {student.avatar
                                            ? <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                            : <span className="text-brand-400 font-bold text-sm">{student.name.charAt(0).toUpperCase()}</span>
                                        }
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate">{student.name}</div>
                                        <div className="text-xs text-gray-500 truncate">{student.email}</div>
                                    </div>
                                    {/* Stats */}
                                    <div className="flex items-center gap-6 shrink-0 text-right">
                                        <div>
                                            <div className="text-xs text-gray-500">Points</div>
                                            <div className="font-bold text-brand-400">{Number(student.totalPoints) || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Tasks</div>
                                            <div className="font-bold text-blue-400">{Number(student.tasksCompleted) || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Courses</div>
                                            <div className="font-bold text-green-400">{Number(student.coursesCompleted) || 0}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
