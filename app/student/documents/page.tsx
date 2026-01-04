'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Eye,
    Calendar,
    Briefcase,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowLeft,
    FileUp,
    Award,
    GraduationCap,
    LogOut
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Document {
    id: string;
    internshipTitle: string;
    internshipDomain: string;
    approvedAt: string;
    startDate: string;
    endDate: string;
    hasMOU: boolean;
    hasOfferLetter: boolean;
    // Completion information
    completionStatus?: string;
    hasCompletionLetter?: boolean;
    marks?: number;
    grade?: string;
    reviewedAt?: string;
    certificateId?: string;
    hasCertificate?: boolean;
    // Withdrawal information
    isWithdrawn?: boolean;
    hasPartialCompletionLetter?: boolean;
    hasRelievingLetter?: boolean;
    withdrawalApprovedAt?: string;
    withdrawalReason?: string;
}

interface EnrollmentRequest {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    internshipTitle: string;
    internshipDomain: string;
    internshipDuration: string;
    message?: string;
    adminNote?: string;
    resumePath?: string;
    resumeOriginalName?: string;
    created_at: string;
    approvedAt?: string;
    rejectedAt?: string;
}

export default function StudentDocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'documents' | 'requests'>('documents');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [docsRes, reqsRes] = await Promise.all([
                api.get('/student/documents'),
                api.get('/student/enrollment-requests')
            ]);

            if (docsRes.data.status === 'success') {
                setDocuments(docsRes.data.data);
            }
            if (reqsRes.data.status === 'success') {
                setRequests(reqsRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadMOU = async (enrollmentId: string, internshipTitle: string) => {
        setDownloadingId(enrollmentId + '-mou');
        try {
            const response = await api.get(`/student/documents/${enrollmentId}/mou`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `MOU_${internshipTitle.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Failed to download MOU:', error);
            alert('Failed to download MOU. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDownloadOfferLetter = async (enrollmentId: string, internshipTitle: string) => {
        setDownloadingId(enrollmentId + '-offer');
        try {
            const response = await api.get(`/student/documents/${enrollmentId}/offer-letter`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `OfferLetter_${internshipTitle.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Failed to download Offer Letter:', error);
            alert('Failed to download Offer Letter. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDownloadCompletionLetter = async (enrollmentId: string, internshipTitle: string) => {
        setDownloadingId(enrollmentId + '-completion');
        try {
            const response = await api.get(`/student/internship-completion/${enrollmentId}/letter/download`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `CompletionLetter_${internshipTitle.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Failed to download Completion Letter:', error);
            alert('Failed to download completion letter. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDownloadCertificate = async (certificateId: string, internshipTitle: string) => {
        setDownloadingId(certificateId + '-cert');
        try {
            const response = await api.get(`/student/certificates/${certificateId}/download`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Certificate_${internshipTitle.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Failed to download Certificate:', error);
            alert('Failed to download certificate. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDownloadPartialCompletionLetter = async (enrollmentId: string, internshipTitle: string) => {
        setDownloadingId(enrollmentId + '-partial');
        try {
            const response = await api.get(`/student/documents/${enrollmentId}/partial-completion`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `PartialCompletion_${internshipTitle.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Failed to download Partial Completion Letter:', error);
            alert('Failed to download partial completion letter. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDownloadRelievingLetter = async (enrollmentId: string, internshipTitle: string) => {
        setDownloadingId(enrollmentId + '-relieving');
        try {
            const response = await api.get(`/student/documents/${enrollmentId}/relieving-letter`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `RelievingLetter_${internshipTitle.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Failed to download Relieving Letter:', error);
            alert('Failed to download relieving letter. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const getCompletionStatusBadge = (status?: string) => {
        switch (status) {
            case 'certificate_issued':
                return <Badge variant="success"><Award size={12} className="mr-1" />Certificate Issued</Badge>;
            case 'reviewed':
                return <Badge variant="info"><CheckCircle size={12} className="mr-1" />Completed</Badge>;
            case 'pending_review':
                return <Badge variant="warning"><Clock size={12} className="mr-1" />Under Review</Badge>;
            case 'withdrawn':
                return <Badge variant="danger"><LogOut size={12} className="mr-1" />Withdrawn</Badge>;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="warning"><Clock size={12} className="mr-1" />Pending Review</Badge>;
            case 'approved':
                return <Badge variant="success"><CheckCircle size={12} className="mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="danger"><AlertCircle size={12} className="mr-1" />Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-400">Loading your documents...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/student/dashboard')}>
                    <ArrowLeft size={18} className="mr-2" />
                    Dashboard
                </Button>
            </div>

            <div>
                <h1 className="text-4xl font-bold mb-2">My Documents</h1>
                <p className="text-gray-400">View and download your internship documents</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-4 py-2 rounded-t-lg transition-all ${
                        activeTab === 'documents'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                    <FileText size={16} className="inline mr-2" />
                    Documents ({documents.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 rounded-t-lg transition-all relative ${
                        activeTab === 'requests'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                    <Clock size={16} className="inline mr-2" />
                    Enrollment Requests ({requests.length})
                    {pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full text-xs flex items-center justify-center text-black font-bold">
                            {pendingCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Documents Tab */}
            {activeTab === 'documents' && (
                <div className="space-y-4">
                    {documents.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText size={48} className="mx-auto mb-4 text-gray-600" />
                                <h3 className="text-xl font-bold mb-2">No Documents Yet</h3>
                                <p className="text-gray-400 mb-4">
                                    Once your enrollment is approved, your MOU and Offer Letter will appear here.
                                </p>
                                <Button variant="primary" onClick={() => router.push('/internships')}>
                                    Browse Internships
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        documents.map((doc, index) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card hover3d className={`${
                                    doc.isWithdrawn 
                                        ? 'border-orange-500/30 bg-gradient-to-br from-orange-900/10 to-red-900/10' 
                                        : doc.hasCertificate 
                                            ? 'border-green-500/30' 
                                            : 'border-purple-500/20'
                                }`}>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col gap-4">
                                            {/* Header */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {doc.isWithdrawn ? (
                                                            <LogOut size={20} className="text-orange-400" />
                                                        ) : (
                                                            <Briefcase size={20} className="text-purple-400" />
                                                        )}
                                                        <h3 className="text-xl font-bold">{doc.internshipTitle}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-gray-400 mb-2">
                                                        <span>{doc.internshipDomain}</span>
                                                        {getCompletionStatusBadge(doc.completionStatus)}
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            Approved: {formatDate(doc.approvedAt)}
                                                        </span>
                                                        {doc.startDate && (
                                                            <span>
                                                                Start: {formatDate(doc.startDate)}
                                                            </span>
                                                        )}
                                                        {doc.endDate && (
                                                            <span>
                                                                End: {formatDate(doc.endDate)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Grade Display */}
                                                {doc.hasCompletionLetter && doc.marks && (
                                                    <div className="text-center p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
                                                        <div className="text-3xl font-bold gradient-text">{doc.grade}</div>
                                                        <div className="text-sm text-gray-400">{doc.marks}/50 marks</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Documents Section */}
                                            <div className="border-t border-white/10 pt-4">
                                                <div className="text-sm text-gray-400 mb-3">Available Documents:</div>
                                                <div className="flex flex-wrap gap-3">
                                                    {/* Enrollment Documents */}
                                                    {doc.hasMOU && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownloadMOU(doc.id, doc.internshipTitle)}
                                                            isLoading={downloadingId === doc.id + '-mou'}
                                                        >
                                                            <Download size={14} className="mr-2" />
                                                            MOU
                                                        </Button>
                                                    )}
                                                    {doc.hasOfferLetter && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownloadOfferLetter(doc.id, doc.internshipTitle)}
                                                            isLoading={downloadingId === doc.id + '-offer'}
                                                        >
                                                            <Download size={14} className="mr-2" />
                                                            Offer Letter
                                                        </Button>
                                                    )}

                                                    {/* Completion Documents */}
                                                    {doc.hasCompletionLetter && (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleDownloadCompletionLetter(doc.id, doc.internshipTitle)}
                                                            isLoading={downloadingId === doc.id + '-completion'}
                                                        >
                                                            <GraduationCap size={14} className="mr-2" />
                                                            Completion Letter
                                                        </Button>
                                                    )}
                                                    {doc.hasCertificate && doc.certificateId && (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            className="bg-gradient-to-r from-green-500 to-emerald-500"
                                                            onClick={() => handleDownloadCertificate(doc.certificateId!, doc.internshipTitle)}
                                                            isLoading={downloadingId === doc.certificateId + '-cert'}
                                                        >
                                                            <Award size={14} className="mr-2" />
                                                            Certificate
                                                        </Button>
                                                    )}

                                                    {/* Withdrawal Documents */}
                                                    {doc.hasPartialCompletionLetter && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                                                            onClick={() => handleDownloadPartialCompletionLetter(doc.id, doc.internshipTitle)}
                                                            isLoading={downloadingId === doc.id + '-partial'}
                                                        >
                                                            <FileText size={14} className="mr-2" />
                                                            Partial Completion
                                                        </Button>
                                                    )}
                                                    {doc.hasRelievingLetter && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30"
                                                            onClick={() => handleDownloadRelievingLetter(doc.id, doc.internshipTitle)}
                                                            isLoading={downloadingId === doc.id + '-relieving'}
                                                        >
                                                            <FileText size={14} className="mr-2" />
                                                            Relieving Letter
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Withdrawal info */}
                                            {doc.isWithdrawn && doc.withdrawalApprovedAt && (
                                                <div className="text-xs text-orange-400">
                                                    Withdrawn on: {formatDate(doc.withdrawalApprovedAt)}
                                                    {doc.withdrawalReason && (
                                                        <span className="text-gray-500 ml-2">• {doc.withdrawalReason}</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Completion info */}
                                            {!doc.isWithdrawn && doc.reviewedAt && (
                                                <div className="text-xs text-gray-500">
                                                    Reviewed on: {formatDate(doc.reviewedAt)}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Clock size={48} className="mx-auto mb-4 text-gray-600" />
                                <h3 className="text-xl font-bold mb-2">No Enrollment Requests</h3>
                                <p className="text-gray-400 mb-4">
                                    You haven't submitted any enrollment requests yet.
                                </p>
                                <Button variant="primary" onClick={() => router.push('/internships')}>
                                    Browse Internships
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        requests.map((request, index) => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`
                                    ${request.status === 'pending' ? 'border-yellow-500/30' : ''}
                                    ${request.status === 'approved' ? 'border-green-500/30' : ''}
                                    ${request.status === 'rejected' ? 'border-red-500/30' : ''}
                                `}>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold">{request.internshipTitle}</h3>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <div className="text-gray-400 text-sm mb-2">
                                                    {request.internshipDomain} • {request.internshipDuration}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Requested: {formatDate(request.created_at)}
                                                </div>

                                                {request.message && (
                                                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                                                        <div className="text-xs text-gray-400 mb-1">Your Message:</div>
                                                        <div className="text-sm">{request.message}</div>
                                                    </div>
                                                )}

                                                {request.adminNote && request.status !== 'pending' && (
                                                    <div className={`mt-3 p-3 rounded-lg ${
                                                        request.status === 'approved' ? 'bg-green-500/10' : 'bg-red-500/10'
                                                    }`}>
                                                        <div className="text-xs text-gray-400 mb-1">Admin Note:</div>
                                                        <div className="text-sm">{request.adminNote}</div>
                                                    </div>
                                                )}

                                                {/* Resume Badge */}
                                                {request.resumePath && (
                                                    <div className="mt-3">
                                                        <Badge variant="info">
                                                            <FileUp size={12} className="mr-1" />
                                                            Resume: {request.resumeOriginalName || 'Attached'}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                {request.status === 'pending' && (
                                                    <div className="text-yellow-400 text-sm">
                                                        <Clock size={16} className="inline mr-1" />
                                                        Awaiting Review
                                                    </div>
                                                )}
                                                {request.status === 'approved' && request.approvedAt && (
                                                    <div className="text-green-400 text-sm">
                                                        <CheckCircle size={16} className="inline mr-1" />
                                                        Approved on {formatDate(request.approvedAt)}
                                                    </div>
                                                )}
                                                {request.status === 'rejected' && request.rejectedAt && (
                                                    <div className="text-red-400 text-sm">
                                                        <AlertCircle size={16} className="inline mr-1" />
                                                        Rejected on {formatDate(request.rejectedAt)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
