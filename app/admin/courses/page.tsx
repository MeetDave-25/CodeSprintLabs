'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, BookOpen, Users, Play } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

import api from '@/lib/api';

interface Course {
    id: string;
    title: string;
    category: string;
    instructor: string;
    duration: string;
    lessons: number;
    enrolled: number;
    price: number;
    priceString?: string; // For input
    status: string;
    isActive: boolean;
    level: string;
    description: string;
}

const initialNewCourse = {
    title: '',
    category: '', // This will be saved as 'level' or similar, strict mapping needed?
    // DB has: title, description, instructor, price, duration, level, modules
    description: '',
    instructor: '',
    duration: '',
    price: '',
    level: 'Beginner',
};

export default function AdminCoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourseData, setNewCourseData] = useState(initialNewCourse);

    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/admin/courses');
                if (response.data.status === 'success') {
                    const normalized = response.data.data.map((item: any) => ({
                        id: item.id || item._id,
                        title: item.title,
                        category: item.level || 'General', // Map level to category/badge
                        instructor: item.instructor,
                        duration: item.duration,
                        lessons: (item.modules || []).reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0),
                        enrolled: item.enrolled || 0,
                        price: item.price,
                        status: item.isActive ? 'published' : 'draft',
                        isActive: item.isActive,
                        level: item.level,
                        description: item.description
                    }));
                    setCourses(normalized);
                }
            } catch (error) {
                console.error('Failed to fetch courses', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleCreateCourse = async () => {
        try {
            const response = await api.post('/admin/courses', {
                ...newCourseData,
                price: parseFloat(newCourseData.price),
                isActive: true
            });
            if (response.data.status === 'success') {
                alert('Course created successfully!');
                setShowCreateModal(false);
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to create course', error);
            alert('Failed to create course');
        }
    };

    const handleDeleteCourse = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this course?')) {
            try {
                await api.delete(`/admin/courses/${id}`);
                setCourses(courses.filter(c => c.id !== id));
            } catch (error) {
                console.error('Failed to delete course', error);
                alert('Failed to delete course');
            }
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (statusFilter !== 'all') {
            if (statusFilter === 'published') matchesStatus = course.status === 'published';
            if (statusFilter === 'draft') matchesStatus = course.status === 'draft';
        }
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: courses.length,
        published: courses.filter(c => c.status === 'published').length,
        draft: courses.filter(c => c.status === 'draft').length,
        totalEnrolled: courses.reduce((sum, c) => sum + c.enrolled, 0),
    };

    if (isLoading) return <div className="p-6 text-center text-gray-400">Loading courses...</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Course Management</h1>
                    <p className="text-gray-400">Create and manage online courses</p>
                </div>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} className="mr-2" />
                    Create Course
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                        <div className="text-sm text-gray-400">Total Courses</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.published}</div>
                        <div className="text-sm text-gray-400">Published</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-400">{stats.draft}</div>
                        <div className="text-sm text-gray-400">Draft</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-400">{stats.totalEnrolled}</div>
                        <div className="text-sm text-gray-400">Total Enrolled</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'published', 'draft'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg capitalize transition-all ${statusFilter === status
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {filteredCourses.map((course, index) => (
                    <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card hover3d glow className="h-full">
                            <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                    <Badge variant={course.status === 'published' ? 'success' : 'warning'}>
                                        {course.status}
                                    </Badge>
                                    <div className="text-sm text-gray-400">{course.category}</div>
                                </div>
                                <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                                <div className="text-sm text-gray-400">by {course.instructor}</div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-sm text-gray-400 flex items-center gap-2">
                                            <Play size={14} />
                                            Duration
                                        </div>
                                        <div className="font-semibold">{course.duration}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 flex items-center gap-2">
                                            <BookOpen size={14} />
                                            Lessons
                                        </div>
                                        <div className="font-semibold">{course.lessons}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 flex items-center gap-2">
                                            <Users size={14} />
                                            Enrolled
                                        </div>
                                        <div className="font-semibold text-purple-400">{course.enrolled}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Price</div>
                                        <div className="font-semibold text-green-400">₹{course.price}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => router.push(`/admin/courses/${course.id}`)}
                                    >
                                        <Edit size={14} className="mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300"
                                        onClick={(e) => handleDeleteCourse(course.id, e)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#0f0f13] border border-white/10 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                        value={newCourseData.title}
                                        onChange={e => setNewCourseData({ ...newCourseData, title: e.target.value })}
                                        placeholder="Course Title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Instructor</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                        value={newCourseData.instructor}
                                        onChange={e => setNewCourseData({ ...newCourseData, instructor: e.target.value })}
                                        placeholder="Instructor Name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Duration</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                            value={newCourseData.duration}
                                            onChange={e => setNewCourseData({ ...newCourseData, duration: e.target.value })}
                                            placeholder="e.g. 40 hours"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Price</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                            value={newCourseData.price}
                                            onChange={e => setNewCourseData({ ...newCourseData, price: e.target.value })}
                                            placeholder="2999"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Level</label>
                                    <select
                                        className="w-full bg-[#1a1a24] border border-white/10 rounded p-2 text-white [&>option]:bg-[#1a1a24] [&>option]:text-white"
                                        value={newCourseData.level}
                                        onChange={e => setNewCourseData({ ...newCourseData, level: e.target.value })}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                        value={newCourseData.description}
                                        onChange={e => setNewCourseData({ ...newCourseData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button variant="primary" className="flex-1" onClick={handleCreateCourse}>Create</Button>
                                    <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-20">
                    <BookOpen size={64} className="mx-auto mb-4 text-gray-600" />
                    <h3 className="text-2xl font-bold mb-2">No Courses Found</h3>
                    <p className="text-gray-400 mb-6">Create your first course</p>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} className="mr-2" />
                        Create Course
                    </Button>
                </div>
            )}
        </div>
    );
}
