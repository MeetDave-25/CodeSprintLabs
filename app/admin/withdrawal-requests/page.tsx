'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserMinus,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    X,
    User,
    Mail,
    Phone,
    Building,
    Calendar,
    MessageSquare,
    AlertTriangle,
    Download,
    FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';

interface WithdrawalRequest {
    id: string;
    _id?: string;
    userId: string;
    internshipId: string;
    status: string;
    studentName: string;
    studentEmail: string;
    studentPhone?: string;
    studentCollegeName?: string;
    internshipTitle: string;
    internshipDomain: string;
    startDate?: string;
    withdrawalRequested: boolean;
    withdrawalRequestedAt: string;
    withdrawalReason: string;
    withdrawalStatus: string;
    withdrawalApprovedAt?: string;
    withdrawalAdminNote?: string;
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
}

export default function WithdrawalRequestsPage() {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [requestsRes, statsRes] = await Promise.all([
                api.get('/admin/withdrawal-requests', {
                    params: { withdrawalStatus: filter !== 'all' ? filter : undefined }
                }),
                api.get('/admin/withdrawal-requests/stats')
            ]);

            if (requestsRes.data.status === 'success') {
                setRequests(requestsRes.data.data);
            }
            if (statsRes.data.status === 'success') {
                setStats(statsRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch withdrawal requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await api.post(`/admin/withdrawal-requests/${id}/approve`, {
                note: adminNote
            });
            if (res.data.status === 'success') {
                alert('Withdrawal approved successfully');
                setShowModal(false);
                setAdminNote('');
                fetchData();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to approve withdrawal');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await api.post(`/admin/withdrawal-requests/${id}/reject`, {
                note: adminNote
            });
            if (res.data.status === 'success') {
                alert('Withdrawal rejected');
                setShowModal(false);
                setAdminNote('');
                fetchData();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to reject withdrawal');
        } finally {
            setActionLoading(false);
        }
    };

    const openModal = (request: WithdrawalRequest) => {
        setSelectedRequest(request);
        setAdminNote('');
        setShowModal(true);
    };

    const filteredRequests = requests.filter(r => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            r.studentName?.toLowerCase().includes(query) ||
            r.studentEmail?.toLowerCase().includes(query) ||
            r.internshipTitle?.toLowerCase().includes(query)
        );
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="warning"><Clock size={12} className="mr-1" /> Pending</Badge>;
            case 'approved':
                return <Badge variant="success"><CheckCircle size={12} className="mr-1" /> Approved</Badge>;
            case 'rejected':
                return <Badge variant="danger"><XCircle size={12} className="mr-1" /> Rejected</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <UserMinus className="text-orange-400" />
                        Withdrawal Requests
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Manage internship withdrawal requests from students
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-400">{stats.pending}</div>
                        <div className="text-sm text-gray-400">Pending</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                        <div className="text-sm text-gray-400">Approved</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                        <div className="text-sm text-gray-400">Rejected</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                        <div className="text-sm text-gray-400">Total Requests</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
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
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                                filter === status
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : filteredRequests.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <UserMinus size={48} className="mx-auto mb-4 text-gray-500" />
                            <h3 className="text-xl font-semibold mb-2">No Withdrawal Requests</h3>
                            <p className="text-gray-400">
                                {filter === 'all' 
                                    ? 'No withdrawal requests have been submitted yet.'
                                    : `No ${filter} withdrawal requests found.`}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredRequests.map((request, index) => (
                        <motion.div
                            key={request.id || request._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card hover3d>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold">{request.studentName}</h3>
                                                {getStatusBadge(request.withdrawalStatus)}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} />
                                                    <span>{request.studentEmail}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Building size={14} />
                                                    <span>{request.internshipTitle}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    <span>Requested: {formatDate(request.withdrawalRequestedAt)}</span>
                                                </div>
                                                {request.withdrawalReason && (
                                                    <div className="flex items-center gap-2 md:col-span-2">
                                                        <MessageSquare size={14} />
                                                        <span className="truncate">{request.withdrawalReason}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openModal(request)}
                                            >
                                                <Eye size={16} className="mr-1" />
                                                View
                                            </Button>
                                            {request.withdrawalStatus === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => openModal(request)}
                                                    >
                                                        <CheckCircle size={16} className="mr-1" />
                                                        Review
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {showModal && selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a2e] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <AlertTriangle className="text-orange-400" />
                                        Withdrawal Request
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Review and take action on this request
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Status */}
                                <div className="flex justify-center">
                                    {getStatusBadge(selectedRequest.withdrawalStatus)}
                                </div>

                                {/* Student Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-purple-400">Student Details</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400" />
                                                <span>{selectedRequest.studentName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-gray-400" />
                                                <span>{selectedRequest.studentEmail}</span>
                                            </div>
                                            {selectedRequest.studentPhone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-gray-400" />
                                                    <span>{selectedRequest.studentPhone}</span>
                                                </div>
                                            )}
                                            {selectedRequest.studentCollegeName && (
                                                <div className="flex items-center gap-2">
                                                    <Building size={14} className="text-gray-400" />
                                                    <span>{selectedRequest.studentCollegeName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-blue-400">Internship Details</h3>
                                        <div className="space-y-2 text-sm">
                                            <div><strong>Title:</strong> {selectedRequest.internshipTitle}</div>
                                            <div><strong>Domain:</strong> {selectedRequest.internshipDomain}</div>
                                            {selectedRequest.startDate && (
                                                <div><strong>Started:</strong> {formatDate(selectedRequest.startDate)}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Withdrawal Details */}
                                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                    <h3 className="font-semibold text-orange-400 mb-2">Withdrawal Request</h3>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Requested At:</strong> {formatDate(selectedRequest.withdrawalRequestedAt)}</div>
                                        {selectedRequest.withdrawalReason && (
                                            <div>
                                                <strong>Reason:</strong>
                                                <p className="mt-1 text-gray-300 bg-white/5 p-3 rounded-lg">
                                                    {selectedRequest.withdrawalReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Admin Note (for approved/rejected) */}
                                {selectedRequest.withdrawalAdminNote && selectedRequest.withdrawalStatus !== 'pending' && (
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                        <h3 className="font-semibold mb-2">Admin Note</h3>
                                        <p className="text-sm text-gray-300">{selectedRequest.withdrawalAdminNote}</p>
                                    </div>
                                )}

                                {/* Documents Section (for approved withdrawals) */}
                                {selectedRequest.withdrawalStatus === 'approved' && (
                                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                                        <h3 className="font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                                            <FileText size={16} />
                                            Withdrawal Documents
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                                                onClick={async () => {
                                                    try {
                                                        const response = await api.get(`/admin/withdrawal-requests/${selectedRequest.id || selectedRequest._id}/partial-completion`, {
                                                            responseType: 'blob'
                                                        });
                                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `Partial_Completion_${selectedRequest.studentName}.pdf`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                    } catch (error) {
                                                        alert('Failed to download partial completion letter');
                                                    }
                                                }}
                                            >
                                                <Download size={14} className="mr-2" />
                                                Partial Completion Letter
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30"
                                                onClick={async () => {
                                                    try {
                                                        const response = await api.get(`/admin/withdrawal-requests/${selectedRequest.id || selectedRequest._id}/relieving-letter`, {
                                                            responseType: 'blob'
                                                        });
                                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `Relieving_Letter_${selectedRequest.studentName}.pdf`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                    } catch (error) {
                                                        alert('Failed to download relieving letter');
                                                    }
                                                }}
                                            >
                                                <Download size={14} className="mr-2" />
                                                Relieving Letter
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Action Section (for pending) */}
                                {selectedRequest.withdrawalStatus === 'pending' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">
                                                Admin Note (Optional)
                                            </label>
                                            <textarea
                                                value={adminNote}
                                                onChange={(e) => setAdminNote(e.target.value)}
                                                placeholder="Add a note for the student..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                variant="primary"
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleApprove(selectedRequest.id || selectedRequest._id!)}
                                                isLoading={actionLoading}
                                            >
                                                <CheckCircle size={16} className="mr-2" />
                                                Approve Withdrawal
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="flex-1 border-red-500 text-red-400 hover:bg-red-500/20"
                                                onClick={() => handleReject(selectedRequest.id || selectedRequest._id!)}
                                                isLoading={actionLoading}
                                            >
                                                <XCircle size={16} className="mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
