'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Award, Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Certificate {
    id: string;
    studentName: string;
    email: string;
    course: string;
    certificateCode: string;
    issueDate: string;
    status: 'issued' | 'revoked';
}

const mockCertificates: Certificate[] = [
    {
        id: '1',
        studentName: 'Rahul Sharma',
        email: 'rahul@example.com',
        course: 'Full Stack Web Development',
        certificateCode: 'CERT-2024-FS-001',
        issueDate: '2025-11-15',
        status: 'issued',
    },
    {
        id: '2',
        studentName: 'Priya Patel',
        email: 'priya@example.com',
        course: 'Python for Data Science',
        certificateCode: 'CERT-2024-PY-002',
        issueDate: '2025-11-20',
        status: 'issued',
    },
    {
        id: '3',
        studentName: 'Amit Kumar',
        email: 'amit@example.com',
        course: 'Java Backend Development',
        certificateCode: 'CERT-2024-JV-003',
        issueDate: '2025-11-25',
        status: 'issued',
    },
    {
        id: '4',
        studentName: 'Sneha Reddy',
        email: 'sneha@example.com',
        course: 'Mobile App Development',
        certificateCode: 'CERT-2024-MB-004',
        issueDate: '2025-11-28',
        status: 'revoked',
    },
];

export default function AdminCertificatesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'revoked'>('all');

    const filteredCertificates = mockCertificates.filter(cert => {
        const matchesSearch = cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cert.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cert.certificateCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: mockCertificates.length,
        issued: mockCertificates.filter(c => c.status === 'issued').length,
        revoked: mockCertificates.filter(c => c.status === 'revoked').length,
        thisMonth: mockCertificates.filter(c => {
            const date = new Date(c.issueDate);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2">Certificate Management</h1>
                <p className="text-gray-400">Issue and manage student certificates</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                        <div className="text-sm text-gray-400">Total Certificates</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.issued}</div>
                        <div className="text-sm text-gray-400">Issued</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-400">{stats.revoked}</div>
                        <div className="text-sm text-gray-400">Revoked</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-400">{stats.thisMonth}</div>
                        <div className="text-sm text-gray-400">This Month</div>
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
                                placeholder="Search by name, email, or certificate code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'issued', 'revoked'] as const).map((status) => (
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

            {/* Certificates Table */}
            <Card glow>
                <CardHeader>
                    <CardTitle>Certificates ({filteredCertificates.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Student</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Course</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Certificate Code</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Issue Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCertificates.map((cert, index) => (
                                    <motion.tr
                                        key={cert.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div>
                                                <div className="font-semibold">{cert.studentName}</div>
                                                <div className="text-sm text-gray-400">{cert.email}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm">{cert.course}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="font-mono text-sm text-purple-400">{cert.certificateCode}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm">{new Date(cert.issueDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge variant={cert.status === 'issued' ? 'success' : 'default'}>
                                                {cert.status === 'issued' ? (
                                                    <><CheckCircle size={12} className="mr-1" /> Issued</>
                                                ) : (
                                                    <><XCircle size={12} className="mr-1" /> Revoked</>
                                                )}
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

                        {filteredCertificates.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                No certificates found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
