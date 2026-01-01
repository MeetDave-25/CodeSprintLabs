'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, Award, TrendingUp, Play, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

interface EnrolledCourse {
    id: string;
    title: string;
    category: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    instructor: string;
    enrolledDate: string;
    certificateAvailable: boolean;
    gradient: string;
}

const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
];

export default function MyCoursesPage() {
    const router = useRouter();
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const response = await api.get('/student/my-courses');
                if (response.data.status === 'success') {
                    const courses = response.data.data.map((c: any, index: number) => ({
                        id: c.id || c._id || c.courseId,
                        title: c.title || c.courseTitle || 'Untitled Course',
                        category: c.level || c.category || 'General',
                        progress: c.progress || 0,
                        totalLessons: c.totalLessons || (c.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)) || 10,
                        completedLessons: c.completedLessons || Math.floor((c.progress || 0) / 10),
                        instructor: c.instructor || 'TBA',
                        enrolledDate: c.enrolledAt || c.enrolledDate || new Date().toISOString(),
                        certificateAvailable: c.certificateAvailable || c.progress >= 100,
                        gradient: gradients[index % gradients.length],
                    }));
                    setEnrolledCourses(courses);
                }
            } catch (error) {
                console.error('Failed to fetch my courses', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyCourses();
    }, []);

    const stats = {
        totalCourses: enrolledCourses.length,
        completedCourses: enrolledCourses.filter(c => c.progress === 100).length,
        inProgress: enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length,
        certificates: enrolledCourses.filter(c => c.certificateAvailable).length,
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-400">Loading your courses...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2">My Courses</h1>
                <p className="text-gray-400">Track your learning progress and access course materials</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.totalCourses}</div>
                        <div className="text-sm text-gray-400">Total Courses</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
                        <div className="text-sm text-gray-400">In Progress</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.completedCourses}</div>
                        <div className="text-sm text-gray-400">Completed</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-400">{stats.certificates}</div>
                        <div className="text-sm text-gray-400">Certificates</div>
                    </CardContent>
                </Card>
            </div>

            {/* Courses List */}
            <div className="space-y-6">
                {enrolledCourses.map((course, index) => (
                    <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card hover3d glow>
                            <div className="grid md:grid-cols-[200px_1fr] gap-6">
                                {/* Course Thumbnail */}
                                <div className={`h-48 md:h-auto bg-gradient-to-br ${course.gradient} rounded-l-xl flex items-center justify-center`}>
                                    <BookOpen size={64} className="text-white/80" />
                                </div>

                                {/* Course Details */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="text-sm text-purple-400 mb-1">{course.category}</div>
                                            <h3 className="text-2xl font-bold mb-2">{course.title}</h3>
                                            <div className="text-sm text-gray-400">
                                                Instructor: {course.instructor}
                                            </div>
                                        </div>
                                        {course.certificateAvailable && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                                                <Award size={16} />
                                                Certificate Ready
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-400">Progress</span>
                                            <span className="font-semibold">{course.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.progress}%` }}
                                                transition={{ duration: 1, delay: index * 0.2 }}
                                                className={`h-full bg-gradient-to-r ${course.gradient}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Course Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <BookOpen size={16} />
                                            <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Clock size={16} />
                                            <span>Enrolled {new Date(course.enrolledDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <TrendingUp size={16} />
                                            <span>{course.progress === 100 ? 'Completed' : 'In Progress'}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Button
                                            variant={course.progress < 100 ? "primary" : "outline"}
                                            onClick={() => router.push(`/student/my-courses/${course.id}`)}
                                        >
                                            <Play size={16} className="mr-2" />
                                            {course.progress < 100 ? 'Continue Learning' : 'Review Course'}
                                        </Button>
                                        {course.certificateAvailable && (
                                            <Button
                                                variant="outline"
                                                onClick={() => router.push(`/student/my-courses/${course.id}`)}
                                            >
                                                <Download size={16} className="mr-2" />
                                                Download Certificate
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {enrolledCourses.length === 0 && (
                <div className="text-center py-20">
                    <BookOpen size={64} className="mx-auto mb-4 text-gray-600" />
                    <h3 className="text-2xl font-bold mb-2">No Courses Yet</h3>
                    <p className="text-gray-400 mb-6">Start learning by enrolling in a course</p>
                    <Link href="/courses">
                        <Button variant="primary">Browse Courses</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}