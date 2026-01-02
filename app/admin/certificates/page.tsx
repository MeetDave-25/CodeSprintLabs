'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Award, Download, Eye, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { adminService } from '@/lib/services';

interface Certificate {
    id: string;
    _id?: string;
    studentName: string;
    email?: string;
    student?: { name: string; email: string };
    course?: string;
    courseName?: string;
    internship?: string;
    internshipName?: string;
    programName?: string;
    type?: 'course' | 'internship';
    certificateCode?: string;
    code?: string;
    issueDate?: string;
    issuedAt?: string;
    created_at?: string;
    status: 'issued' | 'revoked' | 'active';
}

interface Stats {
    total: number;
    issued: number;
    revoked: number;
    thisMonth: number;
}

export default function AdminCertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, issued: 0, revoked: 0, thisMonth: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'revoked'>('all');

    useEffect(() => {
        fetchCertificates();
        fetchStats();
    }, [statusFilter, searchQuery]);

    const fetchCertificates = async () => {
        try {
            setIsLoading(true);
            const params: any = {};
            if (searchQuery) params.search = searchQuery;
            
            const response = await adminService.getCertificates(params);
            let certsData = response.data.data || response.data.certificates || response.data || [];
            
            // Handle pagination if present
            if (certsData.data) {
                certsData = certsData.data;
            }
            
            // Filter by status locally if needed
            if (statusFilter !== 'all') {
                certsData = certsData.filter((cert: Certificate) => {
                    const certStatus = cert.status === 'active' ? 'issued' : cert.status;
                    return certStatus === statusFilter;
                });
            }
            
            setCertificates(certsData);
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminService.getCertificateStats();
            const data = response.data;
            setStats({
                total: data.total || 0,
                issued: data.issued || data.active || 0,
                revoked: data.revoked || 0,
                thisMonth: data.thisMonth || 0,
            });
        } catch (error) {
            console.error('Failed to fetch certificate stats:', error);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this certificate?')) return;
        
        try {
            await adminService.revokeCertificate(id);
            fetchCertificates();
            fetchStats();
        } catch (error) {
            console.error('Failed to revoke certificate:', error);
        }
    };

    const getCertificateId = (cert: Certificate) => cert._id || cert.id;
    const getStudentName = (cert: Certificate) => cert.studentName || cert.student?.name || 'N/A';
    const getStudentEmail = (cert: Certificate) => cert.email || cert.student?.email || '';
    const getProgramName = (cert: Certificate) => cert.course || cert.courseName || cert.internship || cert.internshipName || cert.programName || 'N/A';
    const getCertificateCode = (cert: Certificate) => cert.certificateCode || cert.code || 'N/A';
    const getIssueDate = (cert: Certificate) => cert.issueDate || cert.issuedAt || cert.created_at;
    const getCertificateStatus = (cert: Certificate) => cert.status === 'active' ? 'issued' : cert.status;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Certificate Management</h1>
                    <p className="text-gray-400">Issue and manage student certificates</p>
                </div>
                <Button variant="outline" onClick={() => { fetchCertificates(); fetchStats(); }}>
                    <RefreshCw size={18} className="mr-2" />
                    Refresh
                </Button>
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
                    <CardTitle>Certificates ({certificates.length})</CardTitle>
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
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Program</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Certificate Code</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Issue Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {certificates.map((cert, index) => (
                                        <motion.tr
                                            key={getCertificateId(cert)}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <div>
                                                    <div className="font-semibold">{getStudentName(cert)}</div>
                                                    <div className="text-sm text-gray-400">{getStudentEmail(cert)}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm">{getProgramName(cert)}</div>
                                                {cert.type && (
                                                    <div className="text-xs text-gray-500 capitalize">{cert.type}</div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-mono text-sm text-purple-400">{getCertificateCode(cert)}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm">
                                                    {getIssueDate(cert) 
                                                        ? new Date(getIssueDate(cert)!).toLocaleDateString() 
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge variant={getCertificateStatus(cert) === 'issued' ? 'success' : 'default'}>
                                                    {getCertificateStatus(cert) === 'issued' ? (
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
                                                    {getCertificateStatus(cert) === 'issued' && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="text-red-400 hover:text-red-300"
                                                            onClick={() => handleRevoke(getCertificateId(cert))}
                                                        >
                                                            <XCircle size={14} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>

                            {certificates.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    {searchQuery || statusFilter !== 'all'
                                        ? 'No certificates found matching your filters'
                                        : 'No certificates issued yet'}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
