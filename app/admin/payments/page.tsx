'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, DollarSign, CheckCircle, Clock, Download, Eye, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { adminService } from '@/lib/services';

interface Payment {
    id: string;
    _id?: string;
    studentName: string;
    email?: string;
    course?: string;
    courseName?: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    method?: string;
    paymentMethod?: string;
    date?: string;
    paymentDate?: string;
    transactionId?: string;
}

interface Stats {
    total: number;
    completed: number;
    pending: number;
    failed: number;
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0, failed: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

    useEffect(() => {
        fetchPayments();
        fetchStats();
    }, [statusFilter, searchQuery]);

    const fetchPayments = async () => {
        try {
            setIsLoading(true);
            const params: any = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;

            const response = await adminService.getPayments(params);
            const paymentsData = response.data.data?.data || response.data.data || [];
            setPayments(paymentsData);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminService.getPaymentStats();
            const statsData = response.data;
            setStats({
                total: statsData.totalRevenue || 0,
                completed: statsData.completedPayments || 0,
                pending: statsData.pendingPayments || 0,
                failed: statsData.failedPayments || 0,
            });
        } catch (error) {
            console.error('Failed to fetch payment stats:', error);
        }
    };

    const getPaymentId = (payment: Payment) => payment._id || payment.id;
    const getCourseName = (payment: Payment) => payment.course || payment.courseName || 'N/A';
    const getPaymentMethod = (payment: Payment) => payment.method || payment.paymentMethod || 'N/A';
    const getPaymentDate = (payment: Payment) => payment.date || payment.paymentDate;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Payment Management</h1>
                    <p className="text-gray-400">Track and manage all transactions</p>
                </div>
                <Button variant="outline" onClick={() => { fetchPayments(); fetchStats(); }}>
                    <RefreshCw size={18} className="mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">₹{stats.total.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Total Revenue</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
                        <div className="text-sm text-gray-400">Completed</div>
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
                        <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
                        <div className="text-sm text-gray-400">Failed</div>
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
                                placeholder="Search by name, email, or transaction ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
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

            {/* Payments Table */}
            <Card glow>
                <CardHeader>
                    <CardTitle>Transactions ({payments.length})</CardTitle>
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
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Course</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Amount</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Method</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment, index) => (
                                        <motion.tr
                                            key={getPaymentId(payment)}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <div>
                                                    <div className="font-semibold">{payment.studentName}</div>
                                                    <div className="text-sm text-gray-400">{payment.email || ''}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm">{getCourseName(payment)}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-semibold text-green-400">₹{payment.amount.toLocaleString()}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm">{getPaymentMethod(payment)}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm">
                                                    {getPaymentDate(payment) 
                                                        ? new Date(getPaymentDate(payment)!).toLocaleDateString() 
                                                        : 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-400">{payment.transactionId || ''}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge variant={
                                                    payment.status === 'completed' ? 'success' :
                                                        payment.status === 'pending' ? 'warning' : 'default'
                                                }>
                                                    {payment.status === 'completed' && <CheckCircle size={12} className="mr-1" />}
                                                    {payment.status === 'pending' && <Clock size={12} className="mr-1" />}
                                                    {payment.status === 'failed' && <XCircle size={12} className="mr-1" />}
                                                    {payment.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye size={14} />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Download size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>

                            {payments.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    {searchQuery || statusFilter !== 'all'
                                        ? 'No payments found matching your filters'
                                        : 'No payments recorded yet'}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
