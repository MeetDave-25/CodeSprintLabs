'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle, Clock, XCircle, Eye, ThumbsUp, ThumbsDown, X, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';

interface Submission {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    taskId: string;
    taskTitle: string;
    internship: string;
    internshipTitle?: string;
    submittedDate: string;
    submittedAt?: string;
    status: 'pending' | 'approved' | 'rejected';
    repositoryUrl: string;
    url?: string;
    notes: string;
    grade?: number;
    points?: number;
    feedback?: string;
}

export default function AdminSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [studentFilter, setStudentFilter] = useState<string>('all');
    const [internshipFilter, setInternshipFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [reviewGrade, setReviewGrade] = useState('');
    const [reviewFeedback, setReviewFeedback] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/admin/submissions');
            const data = response.data.submissions || response.data.data || [];
            // Normalize data format
            const normalized = data.map((s: any) => ({
                id: s.id || s._id,
                studentId: s.studentId,
                studentName: s.studentName || 'Unknown Student',
                studentEmail: s.studentEmail || '',
                taskId: s.taskId,
                taskTitle: s.taskTitle || 'Unknown Task',
                internship: s.internshipTitle || s.internship || 'Unknown Internship',
                submittedDate: s.submittedAt || s.submittedDate || s.created_at,
                status: s.status || 'pending',
                repositoryUrl: s.url || s.repositoryUrl || '',
                notes: s.notes || '',
                grade: s.points || s.grade,
                feedback: s.feedback || ''
            }));
            setSubmissions(normalized);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get unique students and internships
    const uniqueStudents = Array.from(new Set(submissions.map(s => s.studentName))).sort();
    const uniqueInternships = Array.from(new Set(submissions.map(s => s.internship))).sort();

    const filteredSubmissions = submissions.filter(submission => {
        const matchesSearch = submission.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            submission.taskTitle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
        const matchesStudent = studentFilter === 'all' || submission.studentName === studentFilter;
        const matchesInternship = internshipFilter === 'all' || submission.internship === internshipFilter;
        return matchesSearch && matchesStatus && matchesStudent && matchesInternship;
    });

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
    };

    // Count submissions per student
    const studentCounts = uniqueStudents.map(student => ({
        name: student,
        count: submissions.filter(s => s.studentName === student).length
    }));

    const handleApprove = async () => {
        if (!selectedSubmission) return;
        setIsProcessing(true);
        try {
            const response = await api.put(`/admin/submissions/${selectedSubmission.id}/review`, {
                status: 'approved',
                feedback: reviewFeedback,
                points: parseInt(reviewGrade) || 0
            });
            if (response.data.status === 'success') {
                alert('Submission approved successfully!');
                setSelectedSubmission(null);
                setReviewGrade('');
                setReviewFeedback('');
                fetchSubmissions(); // Refresh the list
            }
        } catch (error: any) {
            console.error('Failed to approve submission:', error);
            alert(error.response?.data?.message || 'Failed to approve submission');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedSubmission) return;
        if (!reviewFeedback.trim()) {
            alert('Please provide feedback for rejection');
            return;
        }
        setIsProcessing(true);
        try {
            const response = await api.put(`/admin/submissions/${selectedSubmission.id}/review`, {
                status: 'rejected',
                feedback: reviewFeedback
            });
            if (response.data.status === 'success') {
                alert('Submission rejected!');
                setSelectedSubmission(null);
                setReviewGrade('');
                setReviewFeedback('');
                fetchSubmissions(); // Refresh the list
            }
        } catch (error: any) {
            console.error('Failed to reject submission:', error);
            alert(error.response?.data?.message || 'Failed to reject submission');
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="text-green-400" size={20} />;
            case 'rejected':
                return <XCircle className="text-red-400" size={20} />;
            default:
                return <Clock className="text-yellow-400" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-500/20 text-green-400';
            case 'rejected':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-yellow-500/20 text-yellow-400';
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Submissions Review</h1>
                    <p className="text-gray-400">Review and grade student task submissions</p>
                </div>
                <Button variant="primary" onClick={() => setShowFilters(!showFilters)}>
                    <Filter size={18} className="mr-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                        <div className="text-sm text-gray-400">Total Submissions</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                        <div className="text-sm text-gray-400">Pending Review</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                        <div className="text-sm text-gray-400">Approved</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                        <div className="text-sm text-gray-400">Rejected</div>
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
                    <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle>Advanced Filters</CardTitle>
                            <CardDescription>Filter submissions by student or internship</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Student Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Filter by Student</label>
                                    <select
                                        value={studentFilter}
                                        onChange={(e) => setStudentFilter(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 [&>option]:bg-gray-900 [&>option]:text-white"
                                    >
                                        <option value="all" className="bg-gray-900 text-white">All Students</option>
                                        {uniqueStudents.map((student) => (
                                            <option key={student} value={student} className="bg-gray-900 text-white">
                                                {student} ({studentCounts.find(s => s.name === student)?.count || 0} submissions)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Internship Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Filter by Internship</label>
                                    <select
                                        value={internshipFilter}
                                        onChange={(e) => setInternshipFilter(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 [&>option]:bg-gray-900 [&>option]:text-white"
                                    >
                                        <option value="all" className="bg-gray-900 text-white">All Internships</option>
                                        {uniqueInternships.map((internship) => (
                                            <option key={internship} value={internship} className="bg-gray-900 text-white">
                                                {internship}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {(studentFilter !== 'all' || internshipFilter !== 'all') && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {studentFilter !== 'all' && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 rounded-lg text-sm">
                                            <span>Student: <strong>{studentFilter}</strong></span>
                                            <button
                                                onClick={() => setStudentFilter('all')}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                    {internshipFilter !== 'all' && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 rounded-lg text-sm">
                                            <span>Internship: <strong>{internshipFilter}</strong></span>
                                            <button
                                                onClick={() => setInternshipFilter('all')}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="px-3 py-2 bg-green-500/20 rounded-lg text-sm text-green-400">
                                        Showing <strong>{filteredSubmissions.length}</strong> submission(s)
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Search and Status Filters */}
            <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by student or task..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg capitalize transition-all ${statusFilter === status
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submissions List */}
            <div className="space-y-4">
                {filteredSubmissions.map((submission, index) => (
                    <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card hover3d glow className="bg-[#1a1a2e]/95 backdrop-blur-md border-white/20">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusIcon(submission.status)}
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(submission.status)}`}>
                                                {submission.status}
                                            </span>
                                            <Badge variant="default" className="text-xs">
                                                {submission.internship}
                                            </Badge>
                                        </div>
                                        <h3 className="text-xl font-bold mb-1">{submission.taskTitle}</h3>
                                        <div className="text-sm text-gray-400">
                                            Submitted by <span className="text-purple-400 font-semibold">{submission.studentName}</span>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-gray-400">
                                        {new Date(submission.submittedDate).toLocaleString()}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4 bg-white/5 p-4 rounded-lg">
                                    <div className="text-sm">
                                        <span className="text-gray-400">Repository:</span>{' '}
                                        <a
                                            href={submission.repositoryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-400 hover:underline"
                                        >
                                            {submission.repositoryUrl}
                                        </a>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-400">Notes:</span> {submission.notes}
                                    </div>
                                    {submission.grade && (
                                        <div className="text-sm">
                                            <span className="text-gray-400">Grade:</span>{' '}
                                            <span className="font-semibold text-purple-400">{submission.grade}/100</span>
                                        </div>
                                    )}
                                    {submission.feedback && (
                                        <div className="text-sm">
                                            <span className="text-gray-400">Feedback:</span> {submission.feedback}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedSubmission(submission);
                                            setReviewGrade(submission.grade?.toString() || '');
                                            setReviewFeedback(submission.feedback || '');
                                        }}
                                    >
                                        <Eye size={16} className="mr-2" />
                                        {submission.status === 'pending' ? 'Review' : 'View Details'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredSubmissions.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-400">No submissions found matching your filters</p>
                </div>
            )}

            {/* Review Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <Card className="bg-[#1a1a2e] border-white/20">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Review Submission</CardTitle>
                                        <CardDescription>{selectedSubmission.taskTitle}</CardDescription>
                                    </div>
                                    <button onClick={() => setSelectedSubmission(null)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Current Status */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-gray-400">Current Status:</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(selectedSubmission.status)}`}>
                                            {getStatusIcon(selectedSubmission.status)}
                                            <span className="ml-2">{selectedSubmission.status}</span>
                                        </span>
                                    </div>

                                    {/* Student Info */}
                                    <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                                        <div className="font-semibold mb-1 text-white">{selectedSubmission.studentName}</div>
                                        <div className="text-sm text-gray-400">{selectedSubmission.studentEmail}</div>
                                        <div className="text-sm text-gray-400 mt-2">
                                            Internship: <span className="text-purple-400">{selectedSubmission.internship}</span>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            Submitted: {new Date(selectedSubmission.submittedDate).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Submission Details */}
                                    <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                                        <label className="text-sm text-gray-400 font-medium">Repository URL</label>
                                        {selectedSubmission.repositoryUrl ? (
                                            <a
                                                href={selectedSubmission.repositoryUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block mt-1 text-purple-400 hover:underline break-all"
                                            >
                                                {selectedSubmission.repositoryUrl}
                                            </a>
                                        ) : (
                                            <p className="text-gray-500 mt-1">No URL provided</p>
                                        )}
                                    </div>

                                    <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                                        <label className="text-sm text-gray-400 font-medium">Student Notes</label>
                                        <div className="mt-2 text-sm text-white">
                                            {selectedSubmission.notes || 'No notes provided'}
                                        </div>
                                    </div>

                                    {selectedSubmission.status === 'pending' && (
                                        <>
                                            {/* Grade Input */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-white">Points to Award</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={reviewGrade}
                                                    onChange={(e) => setReviewGrade(e.target.value)}
                                                    placeholder="Enter points (e.g., 10)"
                                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                                />
                                            </div>

                                            {/* Feedback Input */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-white">Feedback <span className="text-gray-400">(required for rejection)</span></label>
                                                <textarea
                                                    value={reviewFeedback}
                                                    onChange={(e) => setReviewFeedback(e.target.value)}
                                                    rows={4}
                                                    placeholder="Provide feedback to the student..."
                                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                                                />
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-4">
                                                <Button
                                                    variant="primary"
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                    onClick={handleApprove}
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                                    ) : (
                                                        <ThumbsUp size={16} className="mr-2" />
                                                    )}
                                                    {isProcessing ? 'Processing...' : 'Approve'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                                                    onClick={handleReject}
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                                    ) : (
                                                        <ThumbsDown size={16} className="mr-2" />
                                                    )}
                                                    {isProcessing ? 'Processing...' : 'Reject'}
                                                </Button>
                                            </div>
                                        </>
                                    )}

                                    {selectedSubmission.status !== 'pending' && (
                                        <div className="space-y-3">
                                            {selectedSubmission.grade !== undefined && (
                                                <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                                                    <div className="text-sm text-gray-400 mb-1">Points Awarded</div>
                                                    <div className="text-2xl font-bold gradient-text">
                                                        {selectedSubmission.grade} points
                                                    </div>
                                                </div>
                                            )}
                                            {selectedSubmission.feedback && (
                                                <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                                                    <div className="text-sm text-gray-400 mb-1">Feedback</div>
                                                    <div className="text-sm text-white">{selectedSubmission.feedback}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full mt-4"
                                        onClick={() => setSelectedSubmission(null)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
