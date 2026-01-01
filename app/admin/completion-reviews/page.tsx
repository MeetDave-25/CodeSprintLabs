'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Award,
    CheckCircle,
    Clock,
    Star,
    Eye,
    Download,
    FileCheck,
    User,
    Calendar,
    Target,
    TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';

interface CompletionReview {
    id: string;
    _id?: string;
    userId: string;
    internshipId: string;
    studentName: string;
    studentEmail: string;
    studentCollegeName?: string;
    internshipTitle: string;
    internshipDomain: string;
    internshipDuration: string;
    completionStatus: 'pending_review' | 'reviewed' | 'certificate_issued';
    completionRequestedAt: string;
    tasksCompleted: number;
    totalTasks: number;
    totalPoints: number;
    marks?: number;
    adminFeedback?: string;
    reviewedAt?: string;
    certificateId?: string;
}

interface Stats {
    total: number;
    pending: number;
    reviewed: number;
    certificateIssued: number;
    avgMarks: number;
}

export default function AdminCompletionReviewsPage() {
    const [reviews, setReviews] = useState<CompletionReview[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, reviewed: 0, certificateIssued: 0, avgMarks: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending_review' | 'reviewed' | 'certificate_issued'>('all');
    const [selectedReview, setSelectedReview] = useState<CompletionReview | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [marks, setMarks] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [statusFilter]);

    const fetchReviews = async () => {
        try {
            const params: any = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;

            const response = await api.get('/admin/completion-reviews', { params });
            if (response.data.status === 'success') {
                setReviews(response.data.data.data || response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/completion-reviews/stats');
            if (response.data.status === 'success') {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchReviews();
    };

    const handleOpenReview = (review: CompletionReview) => {
        setSelectedReview(review);
        setMarks(review.marks || 35);
        setFeedback(review.adminFeedback || '');
        setShowReviewModal(true);
    };

    const handleSubmitReview = async () => {
        if (!selectedReview) return;
        if (marks < 0 || marks > 50) {
            alert('Marks must be between 0 and 50');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post(`/admin/completion-reviews/${selectedReview.id || selectedReview._id}/review`, {
                marks,
                feedback
            });
            if (response.data.status === 'success') {
                alert('Review submitted successfully!');
                setShowReviewModal(false);
                setSelectedReview(null);
                fetchReviews();
                fetchStats();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleIssueCertificate = async (reviewId: string) => {
        if (!confirm('Are you sure you want to issue the certificate?')) return;

        try {
            const response = await api.post(`/admin/completion-reviews/${reviewId}/issue-certificate`);
            if (response.data.status === 'success') {
                alert('Certificate issued successfully!');
                fetchReviews();
                fetchStats();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to issue certificate');
        }
    };

    const handlePreviewLetter = async (reviewId: string) => {
        try {
            const response = await api.get(`/admin/completion-reviews/${reviewId}/letter/preview`);
            if (response.data.status === 'success') {
                setPreviewData(response.data.data);
                setShowPreviewModal(true);
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to preview letter');
        }
    };

    const handleDownloadLetter = async (reviewId: string, studentName: string) => {
        try {
            const response = await api.get(`/admin/completion-reviews/${reviewId}/letter/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `completion-letter-${studentName}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download letter');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_review':
                return <Badge variant="warning"><Clock size={12} className="mr-1" /> Pending Review</Badge>;
            case 'reviewed':
                return <Badge variant="info"><FileCheck size={12} className="mr-1" /> Reviewed</Badge>;
            case 'certificate_issued':
                return <Badge variant="success"><Award size={12} className="mr-1" /> Certificate Issued</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getGrade = (marks: number): string => {
        const percentage = (marks / 50) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2">Completion Reviews</h1>
                <p className="text-gray-400">Review internship completions and issue certificates</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                        <div className="text-sm text-gray-400">Total Requests</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                        <div className="text-sm text-gray-400">Pending</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-400">{stats.reviewed}</div>
                        <div className="text-sm text-gray-400">Reviewed</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.certificateIssued}</div>
                        <div className="text-sm text-gray-400">Certificates Issued</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-400">{stats.avgMarks}/50</div>
                        <div className="text-sm text-gray-400">Avg. Marks</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by student name, email, or internship..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            />
                        </form>
                        <div className="flex gap-2 flex-wrap">
                            {(['all', 'pending_review', 'reviewed', 'certificate_issued'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg capitalize transition-all whitespace-nowrap ${
                                        statusFilter === status
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    {status === 'all' ? 'All' : status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews List */}
            {isLoading ? (
                <div className="text-center py-20 text-gray-400">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <Card className="text-center py-16">
                    <CardContent>
                        <Award size={64} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Completion Requests</h3>
                        <p className="text-gray-400">
                            No students have requested internship completion review yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id || review._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card hover3d glow>
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Student Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {review.studentName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-lg">{review.studentName}</h3>
                                                    {getStatusBadge(review.completionStatus)}
                                                </div>
                                                <p className="text-sm text-gray-400">{review.studentEmail}</p>
                                                <p className="text-sm text-purple-400 mt-1">{review.internshipTitle}</p>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <div className="text-gray-400">Tasks</div>
                                                <div className="font-bold text-green-400">
                                                    {review.tasksCompleted}/{review.totalTasks}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-gray-400">Points</div>
                                                <div className="font-bold gradient-text">{review.totalPoints}</div>
                                            </div>
                                            {review.marks !== undefined && review.marks !== null && (
                                                <div className="text-center">
                                                    <div className="text-gray-400">Marks</div>
                                                    <div className="font-bold text-yellow-400">
                                                        {review.marks}/50 ({getGrade(review.marks)})
                                                    </div>
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <div className="text-gray-400">Requested</div>
                                                <div className="font-semibold text-xs">
                                                    {new Date(review.completionRequestedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 flex-wrap">
                                            {review.completionStatus === 'pending_review' && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleOpenReview(review)}
                                                >
                                                    <Star size={14} className="mr-1" />
                                                    Review & Grade
                                                </Button>
                                            )}
                                            {review.completionStatus === 'reviewed' && (
                                                <>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handlePreviewLetter(review.id || review._id!)}
                                                    >
                                                        <Eye size={14} className="mr-1" />
                                                        Preview
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleIssueCertificate(review.id || review._id!)}
                                                    >
                                                        <Award size={14} className="mr-1" />
                                                        Issue Certificate
                                                    </Button>
                                                </>
                                            )}
                                            {review.completionStatus === 'certificate_issued' && (
                                                <>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handlePreviewLetter(review.id || review._id!)}
                                                    >
                                                        <Eye size={14} className="mr-1" />
                                                        View Letter
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownloadLetter(review.id || review._id!, review.studentName)}
                                                    >
                                                        <Download size={14} className="mr-1" />
                                                        Download
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && selectedReview && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full my-8"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                                        <Star size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>Review Internship Completion</CardTitle>
                                        <CardDescription>Assign marks and provide feedback</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Student Info */}
                                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User size={20} className="text-gray-400" />
                                        <div>
                                            <div className="font-semibold">{selectedReview.studentName}</div>
                                            <div className="text-sm text-gray-400">{selectedReview.studentEmail}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Target size={20} className="text-gray-400" />
                                        <div>
                                            <div className="font-semibold">{selectedReview.internshipTitle}</div>
                                            <div className="text-sm text-gray-400">{selectedReview.internshipDomain} • {selectedReview.internshipDuration}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-green-400">
                                            {selectedReview.tasksCompleted}/{selectedReview.totalTasks}
                                        </div>
                                        <div className="text-sm text-gray-400">Tasks Completed</div>
                                    </div>
                                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold gradient-text">
                                            {selectedReview.totalPoints}
                                        </div>
                                        <div className="text-sm text-gray-400">Total Points</div>
                                    </div>
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-400">
                                            {Math.round((selectedReview.tasksCompleted / Math.max(selectedReview.totalTasks, 1)) * 100)}%
                                        </div>
                                        <div className="text-sm text-gray-400">Completion Rate</div>
                                    </div>
                                </div>

                                {/* Marks Input */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Assign Marks (0-50) <span className="text-red-400">*</span>
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            value={marks}
                                            onChange={(e) => setMarks(parseInt(e.target.value))}
                                            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="50"
                                                value={marks}
                                                onChange={(e) => setMarks(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                                                className="w-16 bg-transparent text-center text-2xl font-bold focus:outline-none"
                                            />
                                            <span className="text-gray-400">/50</span>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                            marks >= 45 ? 'bg-green-500' :
                                            marks >= 35 ? 'bg-blue-500' :
                                            marks >= 25 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}>
                                            {getGrade(marks)}
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Feedback / Remarks (Optional)
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Provide feedback on the intern's performance..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={handleSubmitReview}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setShowReviewModal(false);
                                            setSelectedReview(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && previewData && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full my-8"
                    >
                        <Card className="max-h-[80vh] overflow-y-auto">
                            <CardHeader className="sticky top-0 bg-[#1a1a2e] z-10 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Completion Letter Preview</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowPreviewModal(false)}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="bg-white text-black rounded-lg p-8 space-y-6">
                                    {/* Letter Header */}
                                    <div className="text-center border-b-2 border-purple-600 pb-4">
                                        <h1 className="text-2xl font-bold text-purple-600">CodeSprint Labs</h1>
                                        <p className="text-gray-500 text-sm italic">Empowering Future Tech Leaders</p>
                                    </div>

                                    {/* Date */}
                                    <div className="text-right text-gray-600 text-sm">
                                        Date: {previewData.issueDate}
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-xl font-bold text-center uppercase tracking-wider">
                                        Internship Completion Letter
                                    </h2>

                                    {/* Content */}
                                    <div className="space-y-4 text-gray-800">
                                        <p>
                                            This is to certify that <strong className="text-purple-600">{previewData.studentName}</strong>
                                            {previewData.studentCollegeName !== 'N/A' && (
                                                <> from <strong>{previewData.studentCollegeName}</strong></>
                                            )} has successfully completed the internship program at CodeSprint Labs.
                                        </p>
                                        <p>
                                            During the internship period from <strong>{previewData.startDate}</strong> to{' '}
                                            <strong>{previewData.endDate}</strong>, the intern was engaged in the{' '}
                                            <strong>{previewData.internshipTitle}</strong> program under the{' '}
                                            <strong>{previewData.internshipDomain}</strong> domain.
                                        </p>
                                    </div>

                                    {/* Performance Box */}
                                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                                        <h3 className="text-center font-bold text-purple-600 mb-4 uppercase">Performance Summary</h3>
                                        <div className="text-center mb-4">
                                            <div className="inline-block w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full text-white text-3xl font-bold leading-[80px]">
                                                {previewData.grade}
                                            </div>
                                            <div className="text-xl font-bold text-purple-600 mt-2">
                                                {previewData.marks} / {previewData.maxMarks} Marks
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-gray-600">Tasks Completed</span>
                                                <span className="font-semibold">{previewData.tasksCompleted} / {previewData.totalTasks}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-gray-600">Total Points</span>
                                                <span className="font-semibold">{previewData.totalPoints}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-gray-600">Percentage</span>
                                                <span className="font-semibold">{previewData.percentage}%</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-gray-600">Review Date</span>
                                                <span className="font-semibold">{previewData.reviewedAt}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    {previewData.adminFeedback && (
                                        <div className="bg-gray-50 border-l-4 border-purple-600 p-4">
                                            <h4 className="font-bold text-purple-600 mb-2">Supervisor's Remarks</h4>
                                            <p className="text-gray-700">{previewData.adminFeedback}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowPreviewModal(false)}
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
