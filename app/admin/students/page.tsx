'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserCheck, UserX, Mail, Phone, Calendar, Award, Eye, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    enrolledDate: string;
    enrolledInternships: string[]; // NEW: Track which internships student is enrolled in
    coursesEnrolled: number;
    coursesCompleted: number;
    tasksCompleted: number;
    totalPoints: number;
    status: 'active' | 'inactive';
}

const mockStudents: Student[] = [
    {
        id: '1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        enrolledDate: '2025-10-15',
        enrolledInternships: ['Full Stack Web Development', 'Java Backend Development'],
        coursesEnrolled: 3,
        coursesCompleted: 1,
        tasksCompleted: 24,
        totalPoints: 1250,
        status: 'active',
    },
    {
        id: '2',
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+91 98765 43211',
        enrolledDate: '2025-11-01',
        enrolledInternships: ['Python for Data Science'],
        coursesEnrolled: 2,
        coursesCompleted: 2,
        tasksCompleted: 32,
        totalPoints: 1680,
        status: 'active',
    },
    {
        id: '3',
        name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        phone: '+91 98765 43212',
        enrolledDate: '2025-09-20',
        enrolledInternships: ['Full Stack Web Development', 'Python for Data Science', 'Mobile App Development'],
        coursesEnrolled: 4,
        coursesCompleted: 3,
        tasksCompleted: 48,
        totalPoints: 2340,
        status: 'active',
    },
    {
        id: '4',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        phone: '+91 98765 43213',
        enrolledDate: '2025-11-20',
        enrolledInternships: ['Mobile App Development'],
        coursesEnrolled: 1,
        coursesCompleted: 0,
        tasksCompleted: 8,
        totalPoints: 420,
        status: 'inactive',
    },
    {
        id: '5',
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        phone: '+91 98765 43214',
        enrolledDate: '2025-10-05',
        enrolledInternships: ['Python for Data Science', 'Java Backend Development'],
        coursesEnrolled: 3,
        coursesCompleted: 2,
        tasksCompleted: 36,
        totalPoints: 1890,
        status: 'active',
    },
    {
        id: '6',
        name: 'Anjali Gupta',
        email: 'anjali.gupta@example.com',
        phone: '+91 98765 43215',
        enrolledDate: '2025-11-10',
        enrolledInternships: ['Python for Data Science'],
        coursesEnrolled: 1,
        coursesCompleted: 0,
        tasksCompleted: 12,
        totalPoints: 580,
        status: 'active',
    },
];

const availableInternships = [
    'Full Stack Web Development',
    'Python for Data Science',
    'Java Backend Development',
    'Mobile App Development',
];

export default function AdminStudentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [internshipFilter, setInternshipFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const filteredStudents = mockStudents.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
        const matchesInternship = internshipFilter === 'all' ||
            student.enrolledInternships.includes(internshipFilter);
        return matchesSearch && matchesStatus && matchesInternship;
    });

    const stats = {
        total: mockStudents.length,
        active: mockStudents.filter(s => s.status === 'active').length,
        inactive: mockStudents.filter(s => s.status === 'inactive').length,
        avgPoints: Math.round(mockStudents.reduce((sum, s) => sum + s.totalPoints, 0) / mockStudents.length),
    };

    // Count students per internship
    const internshipCounts = availableInternships.map(internship => ({
        name: internship,
        count: mockStudents.filter(s => s.enrolledInternships.includes(internship)).length
    }));

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Student Management</h1>
                    <p className="text-gray-400">View and manage all enrolled students</p>
                </div>
                <Button variant="primary" onClick={() => setShowFilters(!showFilters)}>
                    <Filter size={18} className="mr-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                        <div className="text-sm text-gray-400">Total Students</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                        <div className="text-sm text-gray-400">Active</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-400">{stats.inactive}</div>
                        <div className="text-sm text-gray-400">Inactive</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-400">{stats.avgPoints}</div>
                        <div className="text-sm text-gray-400">Avg Points</div>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Filters</CardTitle>
                            <CardDescription>Filter students by internship enrollment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Filter by Internship</label>
                                    <select
                                        value={internshipFilter}
                                        onChange={(e) => setInternshipFilter(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 [&>option]:bg-gray-900 [&>option]:text-white"
                                    >
                                        <option value="all" className="bg-gray-900 text-white">All Internships</option>
                                        {availableInternships.map((internship) => (
                                            <option key={internship} value={internship} className="bg-gray-900 text-white">
                                                {internship} ({internshipCounts.find(i => i.name === internship)?.count || 0} students)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {internshipFilter !== 'all' && (
                                    <div className="flex items-center gap-2 p-3 bg-purple-500/20 rounded-lg">
                                        <span className="text-sm">
                                            Showing <span className="font-bold">{filteredStudents.length}</span> student(s) enrolled in <span className="font-bold">{internshipFilter}</span>
                                        </span>
                                        <button
                                            onClick={() => setInternshipFilter('all')}
                                            className="ml-auto text-gray-400 hover:text-white"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Search and Status Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'active', 'inactive'] as const).map((status) => (
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

            {/* Students Table */}
            <Card glow>
                <CardHeader>
                    <CardTitle>Students ({filteredStudents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Student</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Enrolled Internships</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Progress</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Points</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student, index) => (
                                    <motion.tr
                                        key={student.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div>
                                                <div className="font-semibold">{student.name}</div>
                                                <div className="text-sm text-gray-400">{student.email}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {student.enrolledInternships.map((internship, idx) => (
                                                    <Badge key={idx} variant="default" className="text-xs">
                                                        {internship}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm">
                                                <div>{student.coursesCompleted}/{student.coursesEnrolled} Courses</div>
                                                <div className="text-gray-400">{student.tasksCompleted} Tasks</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1 text-purple-400 font-semibold">
                                                <Award size={16} />
                                                {student.totalPoints}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge variant={student.status === 'active' ? 'success' : 'default'}>
                                                {student.status === 'active' ? (
                                                    <><UserCheck size={12} className="mr-1" /> Active</>
                                                ) : (
                                                    <><UserX size={12} className="mr-1" /> Inactive</>
                                                )}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                                                <Eye size={14} />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredStudents.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                No students found matching your filters
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{selectedStudent.name}</CardTitle>
                                    <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Email</div>
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-purple-400" />
                                            {selectedStudent.email}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Phone</div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-purple-400" />
                                            {selectedStudent.phone}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Enrolled Date</div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-purple-400" />
                                            {new Date(selectedStudent.enrolledDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Total Points</div>
                                        <div className="flex items-center gap-2">
                                            <Award size={16} className="text-purple-400" />
                                            {selectedStudent.totalPoints}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-400 mb-2">Enrolled Internships</div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStudent.enrolledInternships.map((internship, idx) => (
                                            <Badge key={idx} variant="default">
                                                {internship}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">{selectedStudent.coursesEnrolled}</div>
                                        <div className="text-sm text-gray-400">Courses Enrolled</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-400">{selectedStudent.coursesCompleted}</div>
                                        <div className="text-sm text-gray-400">Courses Completed</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-400">{selectedStudent.tasksCompleted}</div>
                                        <div className="text-sm text-gray-400">Tasks Completed</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
