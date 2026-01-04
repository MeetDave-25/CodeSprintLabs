'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    UserCheck,
    UserX,
    Clock,
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    FileText,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    AlertCircle,
    Download,
    FileUp,
    Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';

interface EnrollmentRequest {
    id: string;
    userId: string;
    internshipId: string;
    status: 'pending' | 'approved' | 'rejected';
    studentName: string;
    studentEmail: string;
    studentPhone?: string;
    studentCollegeName?: string;
    studentCourse?: string;
    studentEnrollmentNumber?: string;
    studentRollNumber?: string;
    studentCity?: string;
    studentLocation?: string;
    internshipTitle: string;
    internshipDomain: string;
    internshipDuration: string;
    message?: string;
    adminNote?: string;
    approvedAt?: string;
    rejectedAt?: string;
    startDate?: string;
    endDate?: string;
    mouGenerated?: boolean;
    offerLetterGenerated?: boolean;
    resumePath?: string;
    resumeOriginalName?: string;
    resumeCloudinaryUrl?: string;
    resumeGoogleDriveUrl?: string;
    created_at: string;
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
}

// Helper function to check if a resume exists (local, Cloudinary, or Google Drive)
const hasResume = (request: EnrollmentRequest): boolean => {
    return !!(request.resumePath || request.resumeCloudinaryUrl || request.resumeGoogleDriveUrl);
};

export default function AdminEnrollmentRequestsPage() {
    const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
    const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [selectedRequest, setSelectedRequest] = useState<EnrollmentRequest | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionNote, setActionNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, [statusFilter]);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/admin/enrollment-requests', {
                params: { status: statusFilter }
            });
            if (response.data.status === 'success') {
                setRequests(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch enrollment requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/enrollment-requests/stats');
            if (response.data.status === 'success') {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleViewResume = async (id: string) => {
        try {
            // First, try to get the resume info (might be a redirect URL)
            const response = await api.get(`/admin/enrollment-requests/${id}/resume/view`);
            
            // If we get a redirect response with URL, open it directly
            if (response.data.status === 'redirect' && response.data.url) {
                window.open(response.data.url, '_blank');
                return;
            }
            
            // Otherwise, it returned an error
            if (response.data.message) {
                alert(response.data.message);
            }
        } catch (error: any) {
            // If the response is a file (blob), handle it
            if (error.response?.status === undefined) {
                // Network error or CORS issue
                alert('Failed to view resume. Network error.');
                return;
            }
            
            // For local files, try fetching as blob
            try {
                const blobResponse = await api.get(`/admin/enrollment-requests/${id}/resume/view`, {
                    responseType: 'blob'
                });
                
                const contentType = blobResponse.headers['content-type'] || 'application/pdf';
                const blob = new Blob([blobResponse.data], { type: contentType });
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                setTimeout(() => window.URL.revokeObjectURL(url), 10000);
            } catch (blobError: any) {
                console.error('Failed to view resume:', blobError);
                const errorMessage = blobError.response?.data?.message || error.response?.data?.message || 'Failed to view resume';
                alert(errorMessage);
            }
        }
    };

    const handleDownloadResume = async (id: string, studentName: string) => {
        try {
            // First, try to get the resume info (might be a redirect URL)
            const response = await api.get(`/admin/enrollment-requests/${id}/resume`);
            
            // If we get a redirect response with URL, open it directly
            if (response.data.status === 'redirect' && response.data.url) {
                // For Cloudinary/Google Drive URLs, just open in new tab
                window.open(response.data.url, '_blank');
                return;
            }
            
            // Otherwise, it returned an error
            if (response.data.message) {
                alert(response.data.message);
            }
        } catch (error: any) {
            // For local files, try fetching as blob
            try {
                const blobResponse = await api.get(`/admin/enrollment-requests/${id}/resume`, {
                    responseType: 'blob'
                });
                
                const contentType = blobResponse.headers['content-type'] || 'application/pdf';
                const blob = new Blob([blobResponse.data], { type: contentType });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Resume_${studentName.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (blobError: any) {
                console.error('Failed to download resume:', blobError);
                const errorMessage = blobError.response?.data?.message || error.response?.data?.message || 'Failed to download resume';
                alert(errorMessage);
            }
        }
    };

    const handleClearResume = async (id: string) => {
        if (!confirm('Are you sure you want to clear this resume? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await api.delete(`/admin/enrollment-requests/${id}/resume`);
            if (response.data.status === 'success') {
                alert('Resume cleared successfully');
                // Update the local state - clear all resume fields
                const clearedResumeFields = { 
                    resumePath: undefined, 
                    resumeOriginalName: undefined,
                    resumeCloudinaryUrl: undefined,
                    resumeGoogleDriveUrl: undefined
                };
                setRequests(prev => prev.map(r => 
                    r.id === id ? { ...r, ...clearedResumeFields } : r
                ));
                if (selectedRequest && selectedRequest.id === id) {
                    setSelectedRequest({ ...selectedRequest, ...clearedResumeFields });
                }
            }
        } catch (error: any) {
            console.error('Failed to clear resume:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to clear resume';
            alert(errorMessage);
        }
    };

    const handleDownloadMOU = async (id: string, studentName: string) => {
        try {
            const response = await api.get(`/admin/enrollment-requests/${id}/mou`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `MOU_${studentName.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Failed to download MOU:', error);
            alert('Failed to download MOU');
        }
    };

    const handleDownloadOfferLetter = async (id: string, studentName: string) => {
        try {
            const response = await api.get(`/admin/enrollment-requests/${id}/offer-letter`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Offer_Letter_${studentName.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Failed to download Offer Letter:', error);
            alert('Failed to download Offer Letter');
        }
    };

    const handleApprove = async (id: string) => {
        setIsProcessing(true);
        try {
            const response = await api.post(`/admin/enrollment-requests/${id}/approve`, {
                note: actionNote
            });
            if (response.data.status === 'success') {
                alert('Enrollment approved! MOU and Offer Letter have been generated.');
                setShowDetailModal(false);
                setActionNote('');
                fetchRequests();
                fetchStats();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to approve enrollment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async (id: string) => {
        setIsProcessing(true);
        try {
            const response = await api.post(`/admin/enrollment-requests/${id}/reject`, {
                note: actionNote || 'Your enrollment request was not approved at this time.'
            });
            if (response.data.status === 'success') {
                alert('Enrollment request rejected.');
                setShowDetailModal(false);
                setActionNote('');
                fetchRequests();
                fetchStats();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to reject enrollment');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = 
            req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.internshipTitle.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="warning"><Clock size={12} className="mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="success"><CheckCircle size={12} className="mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="danger"><XCircle size={12} className="mr-1" />Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return <div className="p-6 text-center text-gray-400">Loading enrollment requests...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2">Enrollment Requests</h1>
                <p className="text-gray-400">Review and approve student enrollment requests</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:border-yellow-500/50 transition-all" onClick={() => setStatusFilter('pending')}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                <Clock size={24} className="text-yellow-400" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
                                <div className="text-sm text-gray-400">Pending</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-green-500/50 transition-all" onClick={() => setStatusFilter('approved')}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <UserCheck size={24} className="text-green-400" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-green-400">{stats.approved}</div>
                                <div className="text-sm text-gray-400">Approved</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-red-500/50 transition-all" onClick={() => setStatusFilter('rejected')}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <UserX size={24} className="text-red-400" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-red-400">{stats.rejected}</div>
                                <div className="text-sm text-gray-400">Rejected</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-purple-500/50 transition-all" onClick={() => setStatusFilter('all')}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <FileText size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold gradient-text">{stats.total}</div>
                                <div className="text-sm text-gray-400">Total</div>
                            </div>
                        </div>
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
                                placeholder="Search by student name, email, or internship..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg capitalize transition-all ${
                                        statusFilter === status
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

            {/* Requests List */}
            <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <AlertCircle size={48} className="mx-auto mb-4 text-gray-600" />
                            <h3 className="text-xl font-bold mb-2">No Requests Found</h3>
                            <p className="text-gray-400">
                                {statusFilter === 'pending' 
                                    ? 'No pending enrollment requests at the moment.'
                                    : 'No enrollment requests match your filters.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredRequests.map((request, index) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card hover3d className={`${request.status === 'pending' ? 'border-yellow-500/30' : ''}`}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Student Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                                                {request.studentName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-lg">{request.studentName}</h3>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Mail size={14} />
                                                        {request.studentEmail}
                                                    </span>
                                                    {request.studentPhone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={14} />
                                                            {request.studentPhone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Internship Info */}
                                        <div className="md:text-right">
                                            <div className="flex items-center gap-2 mb-1 md:justify-end">
                                                <Briefcase size={16} className="text-purple-400" />
                                                <span className="font-semibold">{request.internshipTitle}</span>
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {request.internshipDomain} • {request.internshipDuration}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                <Calendar size={12} className="inline mr-1" />
                                                Requested: {formatDate(request.created_at)}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowDetailModal(true);
                                                }}
                                            >
                                                <Eye size={16} className="mr-1" />
                                                View
                                            </Button>
                                            {request.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setShowDetailModal(true);
                                                        }}
                                                    >
                                                        <CheckCircle size={16} className="mr-1" />
                                                        Review
                                                    </Button>
                                                </>
                                            )}
                                            {request.status === 'approved' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownloadMOU(request.id, request.studentName)}
                                                        title="Download MOU"
                                                    >
                                                        <Download size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownloadOfferLetter(request.id, request.studentName)}
                                                        title="Download Offer Letter"
                                                    >
                                                        <FileText size={16} />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message Preview */}
                                    {request.message && (
                                        <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-gray-400">
                                            <span className="font-semibold text-gray-300">Message: </span>
                                            {request.message.substring(0, 150)}
                                            {request.message.length > 150 && '...'}
                                        </div>
                                    )}

                                    {/* Resume and Documents Badges */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {hasResume(request) && (
                                            <span 
                                                className="cursor-pointer hover:opacity-80"
                                                onClick={() => handleViewResume(request.id)}
                                            >
                                                <Badge variant="info">
                                                    <FileUp size={12} className="mr-1" />
                                                    Resume Attached
                                                </Badge>
                                            </span>
                                        )}
                                        {request.status === 'approved' && request.mouGenerated && (
                                            <>
                                                <Badge variant="success">
                                                    <FileText size={12} className="mr-1" />
                                                    MOU Generated
                                                </Badge>
                                                {request.offerLetterGenerated && (
                                                    <Badge variant="success">
                                                        <FileText size={12} className="mr-1" />
                                                        Offer Letter Generated
                                                    </Badge>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f0f13] border border-white/10 rounded-xl p-6 w-full max-w-2xl my-8 max-h-[calc(100vh-4rem)] overflow-y-auto"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">Enrollment Request Details</h2>
                                <p className="text-gray-400">Review and take action on this request</p>
                            </div>
                            {getStatusBadge(selectedRequest.status)}
                        </div>

                        {/* Student Info */}
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle className="text-lg">Student Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400">Name</label>
                                        <div className="font-semibold">{selectedRequest.studentName}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Email</label>
                                        <div className="font-semibold">{selectedRequest.studentEmail}</div>
                                    </div>
                                    {selectedRequest.studentPhone && (
                                        <div>
                                            <label className="text-sm text-gray-400">Phone</label>
                                            <div className="font-semibold">{selectedRequest.studentPhone}</div>
                                        </div>
                                    )}
                                    {selectedRequest.studentCollegeName && (
                                        <div>
                                            <label className="text-sm text-gray-400">College/University</label>
                                            <div className="font-semibold">{selectedRequest.studentCollegeName}</div>
                                        </div>
                                    )}
                                    {selectedRequest.studentCourse && (
                                        <div>
                                            <label className="text-sm text-gray-400">Course/Degree</label>
                                            <div className="font-semibold">{selectedRequest.studentCourse}</div>
                                        </div>
                                    )}
                                    {selectedRequest.studentEnrollmentNumber && (
                                        <div>
                                            <label className="text-sm text-gray-400">Enrollment Number</label>
                                            <div className="font-semibold">{selectedRequest.studentEnrollmentNumber}</div>
                                        </div>
                                    )}
                                    {selectedRequest.studentRollNumber && (
                                        <div>
                                            <label className="text-sm text-gray-400">Roll Number</label>
                                            <div className="font-semibold">{selectedRequest.studentRollNumber}</div>
                                        </div>
                                    )}
                                    {(selectedRequest.studentCity || selectedRequest.studentLocation) && (
                                        <div>
                                            <label className="text-sm text-gray-400">Location</label>
                                            <div className="font-semibold">
                                                {[selectedRequest.studentCity, selectedRequest.studentLocation].filter(Boolean).join(', ')}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm text-gray-400">Requested On</label>
                                        <div className="font-semibold">{formatDate(selectedRequest.created_at)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Internship Info */}
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle className="text-lg">Internship Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400">Program</label>
                                        <div className="font-semibold">{selectedRequest.internshipTitle}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Domain</label>
                                        <div className="font-semibold">{selectedRequest.internshipDomain}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Duration</label>
                                        <div className="font-semibold">{selectedRequest.internshipDuration}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Student Message */}
                        {selectedRequest.message && (
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">Student's Message</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-300">{selectedRequest.message}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Resume Section */}
                        {hasResume(selectedRequest) && (
                            <Card className="mb-4 border-blue-500/30">
                                <CardHeader>
                                    <CardTitle className="text-lg text-blue-400">
                                        <FileUp size={18} className="inline mr-2" />
                                        Student's Resume
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText size={24} className="text-blue-400" />
                                            <div>
                                                <p className="font-semibold">{selectedRequest.resumeOriginalName || 'Resume'}</p>
                                                <p className="text-xs text-gray-400">Attached with enrollment request</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewResume(selectedRequest.id)}
                                            >
                                                <Eye size={14} className="mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleDownloadResume(selectedRequest.id, selectedRequest.studentName)}
                                            >
                                                <Download size={14} className="mr-1" />
                                                Download
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleClearResume(selectedRequest.id)}
                                                className="text-red-400 border-red-400/30 hover:bg-red-500/10"
                                            >
                                                <Trash2 size={14} className="mr-1" />
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Note: Use "Clear" if the resume file is missing or corrupt to remove the broken reference.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Admin Note for approved/rejected */}
                        {selectedRequest.adminNote && selectedRequest.status !== 'pending' && (
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">Admin Note</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-300">{selectedRequest.adminNote}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Section for Pending Requests */}
                        {selectedRequest.status === 'pending' && (
                            <Card className="mb-4 border-yellow-500/30">
                                <CardHeader>
                                    <CardTitle className="text-lg text-yellow-400">Take Action</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Note (optional - will be saved with decision)
                                        </label>
                                        <textarea
                                            value={actionNote}
                                            onChange={(e) => setActionNote(e.target.value)}
                                            placeholder="Add a note for this action..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="primary"
                                            className="flex-1"
                                            onClick={() => handleApprove(selectedRequest.id)}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                'Processing...'
                                            ) : (
                                                <>
                                                    <CheckCircle size={18} className="mr-2" />
                                                    Approve & Generate Documents
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="flex-1 text-red-400 hover:text-red-300 border border-red-500/30"
                                            onClick={() => handleReject(selectedRequest.id)}
                                            disabled={isProcessing}
                                        >
                                            <XCircle size={18} className="mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3 text-center">
                                        Approving will automatically generate MOU and Offer Letter for the student.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Approved Info */}
                        {selectedRequest.status === 'approved' && (
                            <Card className="mb-4 border-green-500/30">
                                <CardHeader>
                                    <CardTitle className="text-lg text-green-400">Approved</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {selectedRequest.startDate && (
                                            <div>
                                                <label className="text-sm text-gray-400">Start Date</label>
                                                <div className="font-semibold">{formatDate(selectedRequest.startDate)}</div>
                                            </div>
                                        )}
                                        {selectedRequest.endDate && (
                                            <div>
                                                <label className="text-sm text-gray-400">End Date</label>
                                                <div className="font-semibold">{formatDate(selectedRequest.endDate)}</div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Document Status Badges */}
                                    <div className="flex gap-2 mb-4">
                                        {selectedRequest.mouGenerated && (
                                            <Badge variant="success">
                                                <FileText size={12} className="mr-1" />
                                                MOU Generated
                                            </Badge>
                                        )}
                                        {selectedRequest.offerLetterGenerated && (
                                            <Badge variant="success">
                                                <FileText size={12} className="mr-1" />
                                                Offer Letter Generated
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Download Documents Section */}
                                    <div className="p-4 bg-white/5 rounded-lg border border-green-500/20">
                                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Download Student Documents</h4>
                                        <div className="flex flex-wrap gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadMOU(selectedRequest.id, selectedRequest.studentName)}
                                                className="border-purple-500/50 hover:bg-purple-500/20"
                                            >
                                                <Download size={14} className="mr-2" />
                                                Download MOU
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadOfferLetter(selectedRequest.id, selectedRequest.studentName)}
                                                className="border-blue-500/50 hover:bg-blue-500/20"
                                            >
                                                <Download size={14} className="mr-2" />
                                                Download Offer Letter
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Close Button */}
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedRequest(null);
                                    setActionNote('');
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
