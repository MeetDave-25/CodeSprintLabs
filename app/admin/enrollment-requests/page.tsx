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
                
                const contentType = String(blobResponse.headers['content-type'] || 'application/pdf');
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
                
                const contentType = String(blobResponse.headers['content-type'] || 'application/pdf');
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
        return <div className="p-4 text-center text-gray-400">Loading enrollment requests...</div>;
    }

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">Enrollment Requests</h1>
                <p className="text-sm text-gray-400">Review and approve student enrollment requests</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Pending', value: stats.pending, color: 'yellow', icon: <Clock size={20} className="text-yellow-400" />, filter: 'pending' as const },
                    { label: 'Approved', value: stats.approved, color: 'green', icon: <UserCheck size={20} className="text-green-400" />, filter: 'approved' as const },
                    { label: 'Rejected', value: stats.rejected, color: 'red', icon: <UserX size={20} className="text-red-400" />, filter: 'rejected' as const },
                    { label: 'Total', value: stats.total, color: 'brand', icon: <FileText size={20} className="text-brand-400" />, filter: 'all' as const },
                ].map(({ label, value, color, icon, filter }) => (
                    <Card key={label} className={`cursor-pointer hover:border-${color}-500/50 transition-all`} onClick={() => setStatusFilter(filter)}>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center shrink-0`}>
                                    {icon}
                                </div>
                                <div>
                                    <div className={`text-xl sm:text-2xl font-bold ${color === 'brand' ? 'gradient-text' : `text-${color}-400`}`}>{value}</div>
                                    <div className="text-xs text-gray-400">{label}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-3 sm:p-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search student name, email or internship..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-brand-500"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`py-2 rounded-lg capitalize text-xs sm:text-sm font-medium transition-all ${
                                    statusFilter === status
                                        ? 'bg-brand-400 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Requests List */}
            <div className="space-y-3">
                {filteredRequests.length === 0 ? (
                    <Card>
                        <CardContent className="p-10 text-center">
                            <AlertCircle size={40} className="mx-auto mb-3 text-gray-600" />
                            <h3 className="text-lg font-bold mb-1">No Requests Found</h3>
                            <p className="text-gray-400 text-sm">
                                {statusFilter === 'pending'
                                    ? 'No pending enrollment requests at the moment.'
                                    : 'No enrollment requests match your filters.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredRequests.map((request, index) => (
                        <motion.div key={request.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                            <Card className={`${request.status === 'pending' ? 'border-yellow-500/30' : ''}`}>
                                <CardContent className="p-4">
                                    {/* Top row: avatar + name + badge */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-500/30 border border-brand-500/40 flex items-center justify-center text-white font-bold shrink-0">
                                            {(request.studentName || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-base">{request.studentName}</h3>
                                                {getStatusBadge(request.status)}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5 truncate">{request.studentEmail}</div>
                                        </div>
                                    </div>

                                    {/* Internship info */}
                                    <div className="flex items-start gap-2 mb-3 pl-0.5">
                                        <Briefcase size={14} className="text-brand-400 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="text-sm font-medium">{request.internshipTitle}</div>
                                            <div className="text-xs text-gray-400">
                                                {[request.internshipDomain, request.internshipDuration].filter(Boolean).join(' • ')}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                <Calendar size={11} className="inline mr-1" />
                                                {formatDate(request.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message preview */}
                                    {request.message && (
                                        <div className="mb-3 p-2.5 bg-white/5 rounded-lg text-xs text-gray-400">
                                            {request.message.substring(0, 120)}{request.message.length > 120 && '…'}
                                        </div>
                                    )}

                                    {/* Badges row */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {hasResume(request) && (
                                            <span className="cursor-pointer hover:opacity-80" onClick={() => handleViewResume(request.id)}>
                                                <Badge variant="info"><FileUp size={11} className="mr-1" />Resume</Badge>
                                            </span>
                                        )}
                                        {request.status === 'approved' && request.mouGenerated && (
                                            <Badge variant="success"><FileText size={11} className="mr-1" />MOU</Badge>
                                        )}
                                        {request.status === 'approved' && request.offerLetterGenerated && (
                                            <Badge variant="success"><FileText size={11} className="mr-1" />Offer Letter</Badge>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setSelectedRequest(request); setShowDetailModal(true); }}>
                                            <Eye size={14} className="mr-1" />View
                                        </Button>
                                        {request.status === 'pending' && (
                                            <Button variant="primary" size="sm" onClick={() => { setSelectedRequest(request); setShowDetailModal(true); }}>
                                                <CheckCircle size={14} className="mr-1" />Review
                                            </Button>
                                        )}
                                        {request.status === 'approved' && (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => handleDownloadMOU(request.id, request.studentName)} title="Download MOU">
                                                    <Download size={14} className="mr-1" />MOU
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDownloadOfferLetter(request.id, request.studentName)} title="Download Offer Letter">
                                                    <FileText size={14} className="mr-1" />Offer
                                                </Button>
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
                <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
                    <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6 py-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f0f13] border border-white/10 rounded-xl p-4 sm:p-6 w-full max-w-2xl"
                    >
                        {/* Modal header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold">Request Details</h2>
                                <p className="text-xs text-gray-400">Review and take action</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(selectedRequest.status)}
                                <button onClick={() => { setShowDetailModal(false); setSelectedRequest(null); setActionNote(''); }} className="ml-2 text-gray-400 hover:text-white p-1">✕</button>
                            </div>
                        </div>

                        {/* Student Info */}
                        <Card className="mb-3">
                            <CardHeader><CardTitle className="text-base">Student Information</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { label: 'Name', value: selectedRequest.studentName },
                                        { label: 'Email', value: selectedRequest.studentEmail },
                                        selectedRequest.studentPhone ? { label: 'Phone', value: selectedRequest.studentPhone } : null,
                                        selectedRequest.studentCollegeName ? { label: 'College', value: selectedRequest.studentCollegeName } : null,
                                        selectedRequest.studentCourse ? { label: 'Course', value: selectedRequest.studentCourse } : null,
                                        selectedRequest.studentEnrollmentNumber ? { label: 'Enrollment No.', value: selectedRequest.studentEnrollmentNumber } : null,
                                        selectedRequest.studentRollNumber ? { label: 'Roll No.', value: selectedRequest.studentRollNumber } : null,
                                        (selectedRequest.studentCity || selectedRequest.studentLocation) ? { label: 'Location', value: [selectedRequest.studentCity, selectedRequest.studentLocation].filter(Boolean).join(', ') } : null,
                                        { label: 'Requested On', value: formatDate(selectedRequest.created_at) },
                                    ].filter(Boolean).map((item: any) => (
                                        <div key={item.label}>
                                            <p className="text-xs text-gray-400">{item.label}</p>
                                            <p className="text-sm font-medium break-words">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Internship Info */}
                        <Card className="mb-3">
                            <CardHeader><CardTitle className="text-base">Internship Details</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div><p className="text-xs text-gray-400">Program</p><p className="text-sm font-medium">{selectedRequest.internshipTitle}</p></div>
                                    <div><p className="text-xs text-gray-400">Domain</p><p className="text-sm font-medium">{selectedRequest.internshipDomain}</p></div>
                                    <div><p className="text-xs text-gray-400">Duration</p><p className="text-sm font-medium">{selectedRequest.internshipDuration}</p></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Student Message */}
                        {selectedRequest.message && (
                            <Card className="mb-3">
                                <CardHeader><CardTitle className="text-base">Student's Message</CardTitle></CardHeader>
                                <CardContent><p className="text-sm text-gray-300">{selectedRequest.message}</p></CardContent>
                            </Card>
                        )}

                        {/* Resume Section */}
                        {hasResume(selectedRequest) && (
                            <Card className="mb-3 border-blue-500/30">
                                <CardHeader>
                                    <CardTitle className="text-base text-blue-400"><FileUp size={15} className="inline mr-1.5" />Student's Resume</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <FileText size={20} className="text-blue-400 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">{selectedRequest.resumeOriginalName || 'Resume'}</p>
                                                <p className="text-xs text-gray-400">Attached with request</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <Button variant="outline" size="sm" onClick={() => handleViewResume(selectedRequest.id)}><Eye size={13} className="mr-1" />View</Button>
                                            <Button variant="primary" size="sm" onClick={() => handleDownloadResume(selectedRequest.id, selectedRequest.studentName)}><Download size={13} className="mr-1" />Download</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleClearResume(selectedRequest.id)} className="text-red-400 border-red-400/30 hover:bg-red-500/10"><Trash2 size={13} className="mr-1" />Clear</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Admin Note */}
                        {selectedRequest.adminNote && selectedRequest.status !== 'pending' && (
                            <Card className="mb-3">
                                <CardHeader><CardTitle className="text-base">Admin Note</CardTitle></CardHeader>
                                <CardContent><p className="text-sm text-gray-300">{selectedRequest.adminNote}</p></CardContent>
                            </Card>
                        )}

                        {/* Action Section */}
                        {selectedRequest.status === 'pending' && (
                            <Card className="mb-3 border-yellow-500/30">
                                <CardHeader><CardTitle className="text-base text-yellow-400">Take Action</CardTitle></CardHeader>
                                <CardContent>
                                    <textarea
                                        value={actionNote}
                                        onChange={(e) => setActionNote(e.target.value)}
                                        placeholder="Optional note for this decision..."
                                        rows={3}
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-brand-500 mb-3"
                                    />
                                    <div className="flex gap-2">
                                        <Button variant="primary" className="flex-1" onClick={() => handleApprove(selectedRequest.id)} disabled={isProcessing}>
                                            {isProcessing ? 'Processing...' : <><CheckCircle size={15} className="mr-1.5" />Approve</>}
                                        </Button>
                                        <Button variant="ghost" className="flex-1 text-red-400 border border-red-500/30 hover:bg-red-500/10" onClick={() => handleReject(selectedRequest.id)} disabled={isProcessing}>
                                            <XCircle size={15} className="mr-1.5" />Reject
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center">Approval auto-generates MOU & Offer Letter.</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Approved Info */}
                        {selectedRequest.status === 'approved' && (
                            <Card className="mb-3 border-green-500/30">
                                <CardHeader><CardTitle className="text-base text-green-400">Approved</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {selectedRequest.startDate && (
                                            <div><p className="text-xs text-gray-400">Start Date</p><p className="text-sm font-medium">{formatDate(selectedRequest.startDate)}</p></div>
                                        )}
                                        {selectedRequest.endDate && (
                                            <div><p className="text-xs text-gray-400">End Date</p><p className="text-sm font-medium">{formatDate(selectedRequest.endDate)}</p></div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {selectedRequest.mouGenerated && <Badge variant="success"><FileText size={11} className="mr-1" />MOU Generated</Badge>}
                                        {selectedRequest.offerLetterGenerated && <Badge variant="success"><FileText size={11} className="mr-1" />Offer Letter Generated</Badge>}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleDownloadMOU(selectedRequest.id, selectedRequest.studentName)}>
                                            <Download size={13} className="mr-1" />Download MOU
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDownloadOfferLetter(selectedRequest.id, selectedRequest.studentName)}>
                                            <Download size={13} className="mr-1" />Download Offer Letter
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => { setShowDetailModal(false); setSelectedRequest(null); setActionNote(''); }}>
                                Close
                            </Button>
                        </div>
                    </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}
