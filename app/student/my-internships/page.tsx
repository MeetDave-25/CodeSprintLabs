'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Briefcase,
    Clock,
    CheckCircle,
    Calendar,
    ArrowRight,
    Target,
    TrendingUp,
    Award,
    AlertTriangle,
    LogOut,
    Search,
    Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import api from '@/lib/api';

interface Internship {
    id: string;
    _id?: string;
    internshipId?: string;
    enrollmentId?: string;
    title: string;
    internshipTitle?: string;
    domain?: string;
    internshipDomain?: string;
    description?: string;
    duration?: string;
    progress: number;
    tasksCompleted: number;
    totalTasks: number;
    status: string;
    startDate?: string;
    endDate?: string;
    enrolledAt?: string;
    // Withdrawal info
    withdrawalStatus?: string;
    withdrawalRequestedAt?: string;
}

export default function MyInternshipsPage() {
    const router = useRouter();
    const [internships, setInternships] = useState<Internship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'withdrawn'>('all');

    useEffect(() => {
        fetchInternships();
    }, []);

    const fetchInternships = async () => {
        try {
            const response = await api.get('/student/my-internships');
            if (response.data.status === 'success') {
                const data = response.data.data.map((item: any) => ({
                    id: item.id || item._id || item.internshipId,
                    enrollmentId: item.enrollmentId,
                    title: item.title || item.internshipTitle,
                    domain: item.domain || item.internshipDomain,
                    description: item.description || '',
                    duration: item.duration,
                    progress: item.progress || 0,
                    tasksCompleted: item.tasksCompleted || 0,
                    totalTasks: item.totalTasks || 0,
                    status: item.status || 'active',
                    startDate: item.startDate,
                    endDate: item.endDate,
                    enrolledAt: item.enrolledAt || item.approvedAt,
                    withdrawalStatus: item.withdrawalStatus,
                    withdrawalRequestedAt: item.withdrawalRequestedAt,
                }));
                setInternships(data);
            }
        } catch (error) {
            console.error('Failed to fetch internships:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (internship: Internship) => {
        if (internship.withdrawalStatus === 'approved') {
            return <Badge variant="danger"><LogOut size={12} className="mr-1" />Withdrawn</Badge>;
        }
        if (internship.withdrawalStatus === 'pending') {
            return <Badge variant="warning"><Clock size={12} className="mr-1" />Withdrawal Pending</Badge>;
        }
        if (internship.progress >= 100) {
            return <Badge variant="success"><CheckCircle size={12} className="mr-1" />Completed</Badge>;
        }
        return <Badge variant="info"><TrendingUp size={12} className="mr-1" />In Progress</Badge>;
    };

    const filteredInternships = internships.filter(internship => {
        // Search filter
        const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            internship.domain?.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Status filter
        let matchesFilter = true;
        if (filter === 'active') {
            matchesFilter = internship.progress < 100 && internship.withdrawalStatus !== 'approved';
        } else if (filter === 'completed') {
            matchesFilter = internship.progress >= 100;
        } else if (filter === 'withdrawn') {
            matchesFilter = internship.withdrawalStatus === 'approved';
        }
        
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: internships.length,
        active: internships.filter(i => i.progress < 100 && i.withdrawalStatus !== 'approved').length,
        completed: internships.filter(i => i.progress >= 100).length,
        withdrawn: internships.filter(i => i.withdrawalStatus === 'approved').length,
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-400">Loading your internships...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Internships</h1>
                    <p className="text-gray-400">View and manage your enrolled internships</p>
                </div>
                <Link href="/internships">
                    <Button variant="primary" className="flex items-center gap-2">
                        <Plus size={18} />
                        Browse New Internships
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
                        <div className="text-sm text-gray-400">Total Enrolled</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">{stats.active}</div>
                        <div className="text-sm text-gray-400">Active</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400">{stats.completed}</div>
                        <div className="text-sm text-gray-400">Completed</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-orange-400">{stats.withdrawn}</div>
                        <div className="text-sm text-gray-400">Withdrawn</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search internships..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(['all', 'active', 'completed', 'withdrawn'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg transition-all capitalize ${
                                filter === f
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Internships List */}
            {filteredInternships.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Briefcase size={48} className="mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-bold mb-2">No Internships Found</h3>
                        <p className="text-gray-400 mb-4">
                            {internships.length === 0
                                ? "You haven't enrolled in any internships yet."
                                : "No internships match your search criteria."}
                        </p>
                        {internships.length === 0 && (
                            <Button variant="primary" onClick={() => router.push('/internships')}>
                                Browse Internships
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {filteredInternships.map((internship, index) => (
                        <motion.div
                            key={internship.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card 
                                hover3d 
                                glow
                                className={`cursor-pointer transition-all ${
                                    internship.withdrawalStatus === 'approved'
                                        ? 'border-orange-500/30 bg-gradient-to-br from-orange-900/10 to-red-900/10'
                                        : internship.withdrawalStatus === 'pending'
                                        ? 'border-yellow-500/30'
                                        : internship.progress >= 100
                                        ? 'border-green-500/30'
                                        : 'border-purple-500/20'
                                }`}
                                onClick={() => router.push(`/student/my-internships/${internship.id}`)}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                internship.withdrawalStatus === 'approved'
                                                    ? 'bg-orange-500/20'
                                                    : 'bg-gradient-to-br from-purple-600 to-pink-600'
                                            }`}>
                                                {internship.withdrawalStatus === 'approved' ? (
                                                    <LogOut size={24} className="text-orange-400" />
                                                ) : (
                                                    <Briefcase size={24} className="text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{internship.title}</CardTitle>
                                                <CardDescription>{internship.domain}</CardDescription>
                                            </div>
                                        </div>
                                        {getStatusBadge(internship)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Progress Section */}
                                    {internship.withdrawalStatus !== 'approved' && (
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-400">Progress</span>
                                                <span className="font-semibold">{internship.progress}%</span>
                                            </div>
                                            <ProgressBar 
                                                value={internship.progress} 
                                                variant={internship.progress >= 100 ? 'success' : 'default'} 
                                            />
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>{internship.tasksCompleted} tasks completed</span>
                                                <span>{internship.totalTasks} total</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Withdrawal Pending Notice */}
                                    {internship.withdrawalStatus === 'pending' && (
                                        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                            <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                                <AlertTriangle size={16} />
                                                <span>Withdrawal request pending approval</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Withdrawn Notice */}
                                    {internship.withdrawalStatus === 'approved' && (
                                        <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                            <div className="flex items-center gap-2 text-orange-400 text-sm">
                                                <LogOut size={16} />
                                                <span>You have withdrawn from this internship</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar size={14} />
                                            <span>Started: {formatDate(internship.startDate || internship.enrolledAt)}</span>
                                        </div>
                                        {internship.duration && (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Clock size={14} />
                                                <span>{internship.duration}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <Button 
                                            variant={internship.withdrawalStatus === 'approved' ? 'secondary' : 'primary'} 
                                            className="w-full group"
                                        >
                                            {internship.withdrawalStatus === 'approved' 
                                                ? 'View Documents' 
                                                : 'View Details'
                                            }
                                            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Help Text */}
            <Card className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-500/20">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <LogOut size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Need to Leave an Internship?</h3>
                            <p className="text-sm text-gray-400">
                                Click on any active internship and scroll down to find the "Leave Internship" option. 
                                You can submit a withdrawal request with your reason, and after admin approval, 
                                you'll receive a Partial Completion Letter and Relieving Letter.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
