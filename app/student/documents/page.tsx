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
    const [activeTab, setActiveTab] = useState<'documents' | 'requests'>('requests');
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
            <div className="p-4 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-400">Loading your documents...</div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">My Documents</h1>
                <p className="text-sm text-gray-400">View and download your internship documents</p>
            </div>

            {/* Tabs — full width on mobile */}
            <div className="grid grid-cols-2 gap-2 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'documents'
                            ? 'bg-brand-400 text-white shadow-sm'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                    <FileText size={15} />
                    <span>Documents</span>
                    <span className="ml-0.5 opacity-70">({documents.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`relative flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'requests'
                            ? 'bg-brand-400 text-white shadow-sm'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                    <Clock size={15} />
                    <span>Applications</span>
                    <span className="ml-0.5 opacity-70">({requests.length})</span>
                    {pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-[10px] flex items-center justify-center text-black font-bold">
                            {pendingCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Documents Tab */}
            {activeTab === 'documents' && (
                <div className="space-y-3">
                    {documents.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <FileText size={40} className="mx-auto mb-3 text-gray-600" />
                                <h3 className="text-lg font-bold mb-2">No Documents Yet</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Once your enrollment is approved, your MOU and Offer Letter will appear here.
                                </p>
                                <Button variant="primary" onClick={() => router.push('/internships')}>
                                    Browse Internships
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        documents.map((doc, index) => (
                            <motion.div key={doc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
                                <Card className={`${
                                    doc.isWithdrawn ? 'border-orange-500/30' : doc.hasCertificate ? 'border-green-500/30' : 'border-brand-500/20'
                                }`}>
                                    <CardContent className="p-4">
                                        {/* Title row */}
                                        <div className="flex items-start gap-2 mb-2">
                                            {doc.isWithdrawn
                                                ? <LogOut size={18} className="text-orange-400 mt-0.5 shrink-0" />
                                                : <Briefcase size={18} className="text-brand-400 mt-0.5 shrink-0" />}
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-base leading-tight">{doc.internshipTitle}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    {doc.internshipDomain && <span className="text-xs text-gray-400">{doc.internshipDomain}</span>}
                                                    {getCompletionStatusBadge(doc.completionStatus)}
                                                </div>
                                            </div>
                                            {doc.hasCompletionLetter && doc.marks && (
                                                <div className="ml-auto text-center shrink-0 px-3 py-1.5 bg-brand-500/10 rounded-lg border border-brand-500/30">
                                                    <div className="text-lg font-bold gradient-text">{doc.grade}</div>
                                                    <div className="text-[10px] text-gray-400">{doc.marks}/50</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Dates */}
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                                            <span><Calendar size={11} className="inline mr-1" />Approved: {formatDate(doc.approvedAt)}</span>
                                            {doc.startDate && <span>Start: {formatDate(doc.startDate)}</span>}
                                            {doc.endDate && <span>End: {formatDate(doc.endDate)}</span>}
                                        </div>

                                        {/* Download buttons */}
                                        <div className="border-t border-white/10 pt-3">
                                            <p className="text-xs text-gray-500 mb-2">Available documents:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {doc.hasMOU && (
                                                    <Button variant="outline" size="sm" onClick={() => handleDownloadMOU(doc.id, doc.internshipTitle)} isLoading={downloadingId === doc.id + '-mou'}>
                                                        <Download size={13} className="mr-1" />MOU
                                                    </Button>
                                                )}
                                                {doc.hasOfferLetter && (
                                                    <Button variant="outline" size="sm" onClick={() => handleDownloadOfferLetter(doc.id, doc.internshipTitle)} isLoading={downloadingId === doc.id + '-offer'}>
                                                        <Download size={13} className="mr-1" />Offer Letter
                                                    </Button>
                                                )}
                                                {doc.hasCompletionLetter && (
                                                    <Button variant="primary" size="sm" onClick={() => handleDownloadCompletionLetter(doc.id, doc.internshipTitle)} isLoading={downloadingId === doc.id + '-completion'}>
                                                        <GraduationCap size={13} className="mr-1" />Completion
                                                    </Button>
                                                )}
                                                {doc.hasCertificate && doc.certificateId && (
                                                    <Button variant="primary" size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500" onClick={() => handleDownloadCertificate(doc.certificateId!, doc.internshipTitle)} isLoading={downloadingId === doc.certificateId + '-cert'}>
                                                        <Award size={13} className="mr-1" />Certificate
                                                    </Button>
                                                )}
                                                {doc.hasPartialCompletionLetter && (
                                                    <button className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 disabled:opacity-50" onClick={() => handleDownloadPartialCompletionLetter(doc.id, doc.internshipTitle)} disabled={downloadingId === doc.id + '-partial'}>
                                                        <FileText size={13} className="mr-1" />Partial
                                                    </button>
                                                )}
                                                {doc.hasRelievingLetter && (
                                                    <button className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg font-medium bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 disabled:opacity-50" onClick={() => handleDownloadRelievingLetter(doc.id, doc.internshipTitle)} disabled={downloadingId === doc.id + '-relieving'}>
                                                        <FileText size={13} className="mr-1" />Relieving
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {doc.isWithdrawn && doc.withdrawalApprovedAt && (
                                            <p className="text-xs text-orange-400 mt-2">Withdrawn: {formatDate(doc.withdrawalApprovedAt)}{doc.withdrawalReason && ` • ${doc.withdrawalReason}`}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="space-y-3">
                    {requests.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Clock size={40} className="mx-auto mb-3 text-gray-600" />
                                <h3 className="text-lg font-bold mb-2">No Applications Yet</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    You haven't applied to any internships yet.
                                </p>
                                <Button variant="primary" onClick={() => router.push('/internships')}>
                                    Browse Internships
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        requests.map((request, index) => (
                            <motion.div key={request.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
                                <Card className={`${
                                    request.status === 'pending' ? 'border-yellow-500/30' :
                                    request.status === 'approved' ? 'border-green-500/30' :
                                    'border-red-500/30'
                                }`}>
                                    <CardContent className="p-4">
                                        {/* Title + badge */}
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-base leading-tight flex-1 min-w-0 pr-2">{request.internshipTitle || 'Internship'}</h3>
                                            {getStatusBadge(request.status)}
                                        </div>

                                        {/* Meta */}
                                        <div className="text-xs text-gray-400 mb-1">
                                            {[request.internshipDomain, request.internshipDuration].filter(Boolean).join(' • ')}
                                        </div>
                                        <div className="text-xs text-gray-500 mb-3">
                                            Applied: {request.created_at ? formatDate(request.created_at) : '—'}
                                        </div>

                                        {/* Status line */}
                                        {request.status === 'pending' && (
                                            <div className="flex items-center gap-1.5 text-xs text-yellow-400 mb-2">
                                                <Clock size={13} />Awaiting admin review
                                            </div>
                                        )}
                                        {request.status === 'approved' && request.approvedAt && (
                                            <div className="flex items-center gap-1.5 text-xs text-green-400 mb-2">
                                                <CheckCircle size={13} />Approved on {formatDate(request.approvedAt)}
                                            </div>
                                        )}
                                        {request.status === 'rejected' && request.rejectedAt && (
                                            <div className="flex items-center gap-1.5 text-xs text-red-400 mb-2">
                                                <AlertCircle size={13} />Rejected on {formatDate(request.rejectedAt)}
                                            </div>
                                        )}

                                        {request.message && (
                                            <div className="mt-2 p-2.5 bg-white/5 rounded-lg">
                                                <p className="text-xs text-gray-400 mb-1 font-medium">Your message:</p>
                                                <p className="text-sm text-gray-300">{request.message}</p>
                                            </div>
                                        )}
                                        {request.adminNote && request.status !== 'pending' && (
                                            <div className={`mt-2 p-2.5 rounded-lg ${request.status === 'approved' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                <p className="text-xs text-gray-400 mb-1 font-medium">Admin note:</p>
                                                <p className="text-sm">{request.adminNote}</p>
                                            </div>
                                        )}
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
