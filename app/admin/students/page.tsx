'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserCheck, UserX, Mail, Phone, Calendar, Award, Eye, X, Loader2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { adminService } from '@/lib/services';

interface Student {
    id: string;
    _id?: string;
    name: string;
    email: string;
    phone?: string;
    created_at: string;
    enrolledInternships?: string[];
    coursesEnrolled?: number;
    coursesCompleted?: number;
    tasksCompleted?: number;
    totalPoints?: number;
    status: 'active' | 'inactive' | 'blocked';
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    avgPoints: number;
}

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, avgPoints: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [internshipFilter, setInternshipFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [availableInternships, setAvailableInternships] = useState<string[]>([]);

    // Fetch students and stats from API
    useEffect(() => {
        fetchStudents();
        fetchStats();
    }, [statusFilter, internshipFilter, searchQuery]);

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const params: any = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (internshipFilter !== 'all') params.internship = internshipFilter;
            if (searchQuery) params.search = searchQuery;

            const response = await adminService.getStudents(params);
            const studentsData = response.data.students || [];
            setStudents(studentsData);

            // Extract unique internships from students
            const internships = new Set<string>();
            studentsData.forEach((student: Student) => {
                student.enrolledInternships?.forEach(i => internships.add(i));
            });
            setAvailableInternships(Array.from(internships));
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminService.getStudentStats();
            setStats(response.data.stats || { total: 0, active: 0, inactive: 0, avgPoints: 0 });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleStatusChange = async (studentId: string, newStatus: string) => {
        try {
            await adminService.updateStudentStatus(studentId, newStatus);
            fetchStudents();
            fetchStats();
            setSelectedStudent(null);
        } catch (error) {
            console.error('Failed to update student status:', error);
        }
    };

    const handleDelete = async (studentId: string, studentName: string) => {
        if (window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
            try {
                await adminService.deleteStudent(studentId);
                fetchStudents();
                fetchStats();
                if (selectedStudent && (selectedStudent.id === studentId || selectedStudent._id === studentId)) {
                    setSelectedStudent(null);
                }
            } catch (error) {
                console.error('Failed to delete student:', error);
                alert('Failed to delete student');
            }
        }
    };

    const getStudentId = (student: Student) => student._id || student.id;

    // Count students per internship
    const internshipCounts = availableInternships.map(internship => ({
        name: internship,
        count: students.filter(s => s.enrolledInternships?.includes(internship)).length
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
                                        className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 [&>option]:bg-[#1a1a2e] [&>option]:text-white"
                                    >
                                        <option value="all">All Internships</option>
                                        {availableInternships.map((internship) => (
                                            <option key={internship} value={internship}>
                                                {internship} ({internshipCounts.find(i => i.name === internship)?.count || 0} students)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {internshipFilter !== 'all' && (
                                    <div className="flex items-center gap-2 p-3 bg-purple-500/20 rounded-lg">
                                        <span className="text-sm">
                                            Showing <span className="font-bold">{students.length}</span> student(s) enrolled in <span className="font-bold">{internshipFilter}</span>
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
                    <CardTitle>Students ({students.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        </div>
                    ) : (
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
                                    {students.map((student, index) => (
                                        <motion.tr
                                            key={getStudentId(student)}
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
                                                    {student.enrolledInternships?.length ? (
                                                        student.enrolledInternships.map((internship, idx) => (
                                                            <Badge key={idx} variant="default" className="text-xs">
                                                                {internship}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">No internships</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm">
                                                    <div>{student.coursesCompleted || 0}/{student.coursesEnrolled || 0} Courses</div>
                                                    <div className="text-gray-400">{student.tasksCompleted || 0} Tasks</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-1 text-purple-400 font-semibold">
                                                    <Award size={16} />
                                                    {student.totalPoints || 0}
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
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                                                        <Eye size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                        onClick={() => handleDelete(getStudentId(student), student.name)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>

                            {students.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    {searchQuery || statusFilter !== 'all' || internshipFilter !== 'all'
                                        ? 'No students found matching your filters'
                                        : 'No students registered yet'}
                                </div>
                            )}
                        </div>
                    )}
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
                                            {selectedStudent.phone || 'Not provided'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Joined Date</div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-purple-400" />
                                            {new Date(selectedStudent.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Total Points</div>
                                        <div className="flex items-center gap-2">
                                            <Award size={16} className="text-purple-400" />
                                            {selectedStudent.totalPoints || 0}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-400 mb-2">Enrolled Internships</div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStudent.enrolledInternships?.length ? (
                                            selectedStudent.enrolledInternships.map((internship, idx) => (
                                                <Badge key={idx} variant="default">
                                                    {internship}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-gray-500">No internships enrolled</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">{selectedStudent.coursesEnrolled || 0}</div>
                                        <div className="text-sm text-gray-400">Courses Enrolled</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-400">{selectedStudent.coursesCompleted || 0}</div>
                                        <div className="text-sm text-gray-400">Courses Completed</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-400">{selectedStudent.tasksCompleted || 0}</div>
                                        <div className="text-sm text-gray-400">Tasks Completed</div>
                                    </div>
                                </div>

                                {/* Status Management */}
                                <div className="pt-4 border-t border-white/10">
                                    <div className="text-sm text-gray-400 mb-2">Change Status</div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={selectedStudent.status === 'active' ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => handleStatusChange(getStudentId(selectedStudent), 'active')}
                                        >
                                            Active
                                        </Button>
                                        <Button
                                            variant={selectedStudent.status === 'inactive' ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => handleStatusChange(getStudentId(selectedStudent), 'inactive')}
                                        >
                                            Inactive
                                        </Button>
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
