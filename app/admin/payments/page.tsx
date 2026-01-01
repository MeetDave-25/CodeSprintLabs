'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, DollarSign, CheckCircle, Clock, Download, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Payment {
    id: string;
    studentName: string;
    email: string;
    course: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    method: string;
    date: string;
    transactionId: string;
}

const mockPayments: Payment[] = [
    {
        id: '1',
        studentName: 'Rahul Sharma',
        email: 'rahul@example.com',
        course: 'Full Stack Web Development',
        amount: 4999,
        status: 'completed',
        method: 'UPI',
        date: '2025-12-01',
        transactionId: 'TXN001234567',
    },
    {
        id: '2',
        studentName: 'Priya Patel',
        email: 'priya@example.com',
        course: 'Python for Data Science',
        amount: 3999,
        status: 'completed',
        method: 'Credit Card',
        date: '2025-12-02',
        transactionId: 'TXN001234568',
    },
    {
        id: '3',
        studentName: 'Amit Kumar',
        email: 'amit@example.com',
        course: 'Java Backend Development',
        amount: 5499,
        status: 'pending',
        method: 'Net Banking',
        date: '2025-12-03',
        transactionId: 'TXN001234569',
    },
    {
        id: '4',
        studentName: 'Sneha Reddy',
        email: 'sneha@example.com',
        course: 'Mobile App Development',
        amount: 4499,
        status: 'failed',
        method: 'UPI',
        date: '2025-12-03',
        transactionId: 'TXN001234570',
    },
];

export default function AdminPaymentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

    const filteredPayments = mockPayments.filter(payment => {
        const matchesSearch = payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: mockPayments.reduce((sum, p) => sum + p.amount, 0),
        completed: mockPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
        pending: mockPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        failed: mockPayments.filter(p => p.status === 'failed').length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2">Payment Management</h1>
                <p className="text-gray-400">Track and manage all transactions</p>
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
                        <div className="text-2xl font-bold text-green-400">₹{stats.completed.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Completed</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-400">₹{stats.pending.toLocaleString()}</div>
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
                    <CardTitle>Transactions ({filteredPayments.length})</CardTitle>
                </CardHeader>
                <CardContent>
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
                                {filteredPayments.map((payment, index) => (
                                    <motion.tr
                                        key={payment.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div>
                                                <div className="font-semibold">{payment.studentName}</div>
                                                <div className="text-sm text-gray-400">{payment.email}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm">{payment.course}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="font-semibold text-green-400">₹{payment.amount}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm">{payment.method}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm">{new Date(payment.date).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-400">{payment.transactionId}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge variant={
                                                payment.status === 'completed' ? 'success' :
                                                    payment.status === 'pending' ? 'warning' : 'default'
                                            }>
                                                {payment.status === 'completed' && <CheckCircle size={12} className="mr-1" />}
                                                {payment.status === 'pending' && <Clock size={12} className="mr-1" />}
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

                        {filteredPayments.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                No payments found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
