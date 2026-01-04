'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Upload,
    Calendar,
    Target,
    Briefcase,
    Award,
    TrendingUp,
    Send,
    FileCheck,
    Download,
    Eye,
    Star,
    LogOut,
    AlertTriangle,
    X,
    ExternalLink,
    Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';

interface Task {
    id: string;
    title: string;
    description: string;
    points: number;
    difficulty: string;
    dueDate: string;
    status: string;
}

interface InternshipDetail {
    id: string;
    title: string;
    description: string;
    progress: number;
    tasksCompleted: number;
    totalTasks: number;
    duration: string;
    deadline: string;
    tasks: Task[];
    enrollmentId?: string;
}

interface CompletionStatus {
    completionRequested: boolean;
    completionStatus: 'not_requested' | 'pending_review' | 'reviewed' | 'certificate_issued';
    tasksCompleted: number;
    totalTasks: number;
    totalPoints: number;
    marks?: number;
    adminFeedback?: string;
    reviewedAt?: string;
    certificateId?: string;
    completionLetterGenerated?: boolean;
}

interface WithdrawalStatus {
    withdrawalRequested: boolean;
    withdrawalStatus: 'not_requested' | 'pending' | 'approved' | 'rejected';
    withdrawalRequestedAt?: string;
    withdrawalReason?: string;
    withdrawalAdminNote?: string;
}

export default function StudentInternshipDetailPage() {
    const params = useParams();
    const router = useRouter();
    const internshipId = params.id as string;
    
    const [internship, setInternship] = useState<InternshipDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);
    const [isRequestingCompletion, setIsRequestingCompletion] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showLetterPreview, setShowLetterPreview] = useState(false);
    const [letterPreviewData, setLetterPreviewData] = useState<any>(null);
    const [withdrawalStatus, setWithdrawalStatus] = useState<WithdrawalStatus | null>(null);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawReason, setWithdrawReason] = useState('');
    const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);

    useEffect(() => {
        const fetchInternship = async () => {
            try {
                const response = await api.get(`/student/my-internships/${internshipId}`);
                console.log('Internship Detail API Response:', response.data);
                if (response.data.status === 'success') {
                    const data = response.data.data;
                    // Get tasks for this internship from the response (already included)
                    const tasks = data.tasks || [];
                    console.log('Tasks from internship:', tasks.length, 'tasks', tasks);
                    
                    // Count completed tasks based on submission status
                    const completedTasks = tasks.filter((t: any) => t.completed === true).length;
                    
                    setInternship({
                        id: data.id || data._id,
                        title: data.title,
                        description: data.description || 'No description available',
                        progress: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
                        tasksCompleted: completedTasks,
                        totalTasks: tasks.length,
                        duration: data.duration || 'TBA',
                        deadline: data.deadline || data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        enrollmentId: data.enrollmentId,
                        tasks: tasks.map((t: any) => ({
                            id: t.id || t._id,
                            title: t.title,
                            description: t.description || '',
                            points: t.points || 0,
                            difficulty: t.difficulty || 'Medium',
                            dueDate: t.dueDate || t.deadline || new Date().toISOString(),
                            status: t.completed ? 'completed' : (t.submitted ? 'pending' : 'not_started'),
                            dayNumber: t.dayNumber
                        }))
                    });

                    // Fetch completion status if enrollmentId exists
                    if (data.enrollmentId) {
                        try {
                            const statusRes = await api.get(`/student/internship-completion/${data.enrollmentId}/status`);
                            if (statusRes.data.status === 'success') {
                                setCompletionStatus(statusRes.data.data);
                            }
                        } catch (err) {
                            console.log('Could not fetch completion status');
                        }

                        // Fetch withdrawal status
                        try {
                            const withdrawalRes = await api.get(`/student/enrollment-requests/${data.enrollmentId}/withdrawal-status`);
                            if (withdrawalRes.data.status === 'success') {
                                setWithdrawalStatus(withdrawalRes.data.data);
                            }
                        } catch (err) {
                            console.log('Could not fetch withdrawal status');
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch internship details', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (internshipId) {
            fetchInternship();
        }
    }, [internshipId]);

    const handleRequestCompletion = async () => {
        if (!internship?.enrollmentId) {
            alert('Enrollment ID not found');
            return;
        }
        
        setIsRequestingCompletion(true);
        try {
            const response = await api.post(`/student/internship-completion/${internship.enrollmentId}/request`);
            if (response.data.status === 'success') {
                setCompletionStatus(response.data.data);
                setShowCompletionModal(false);
                alert('Completion review requested successfully! Admin will review your internship shortly.');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to request completion review');
        } finally {
            setIsRequestingCompletion(false);
        }
    };

    const handlePreviewLetter = async () => {
        if (!internship?.enrollmentId) return;
        
        try {
            const response = await api.get(`/student/internship-completion/${internship.enrollmentId}/letter/preview`);
            if (response.data.status === 'success') {
                setLetterPreviewData(response.data.data);
                setShowLetterPreview(true);
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to preview letter');
        }
    };

    const handleDownloadLetter = async () => {
        if (!internship?.enrollmentId) return;
        
        try {
            const response = await api.get(`/student/internship-completion/${internship.enrollmentId}/letter/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `completion-letter-${internship.title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download letter');
        }
    };

    const handleDownloadCertificate = async () => {
        if (!completionStatus?.certificateId) return;
        
        try {
            const response = await api.get(`/student/certificates/${completionStatus.certificateId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificate-${internship?.title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download certificate');
        }
    };

    const handleRequestWithdrawal = async () => {
        console.log('Requesting withdrawal with enrollmentId:', internship?.enrollmentId);
        console.log('Full internship object:', internship);
        
        if (!internship?.enrollmentId) {
            alert('Enrollment ID not found. Please refresh the page and try again.');
            return;
        }
        
        if (!withdrawReason.trim()) {
            alert('Please provide a reason for withdrawal');
            return;
        }
        
        setIsRequestingWithdrawal(true);
        try {
            const response = await api.post(`/student/enrollment-requests/${internship.enrollmentId}/withdraw`, {
                reason: withdrawReason
            });
            if (response.data.status === 'success') {
                setWithdrawalStatus({
                    withdrawalRequested: true,
                    withdrawalStatus: 'pending',
                    withdrawalRequestedAt: new Date().toISOString(),
                    withdrawalReason: withdrawReason
                });
                setShowWithdrawModal(false);
                setWithdrawReason('');
                alert('Withdrawal request submitted successfully! Please wait for admin approval.');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit withdrawal request');
        } finally {
            setIsRequestingWithdrawal(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading internship details...</div>
            </div>
        );
    }

    if (!internship) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Internship not found</h2>
                    <Button onClick={() => router.push('/student/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-500/20 text-green-400';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
            case 'Hard': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': 
            case 'approved': return 'bg-green-500/20 text-green-400';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const pendingTasks = internship.tasks.filter((t: any) => t.status === 'pending' || t.status === 'not_started');
    const completedTasks = internship.tasks.filter((t: any) => t.status === 'completed' || t.status === 'approved');

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push('/student/dashboard')}
                    className="mb-6"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Dashboard
                </Button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <Briefcase size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">{internship.title}</h1>
                            <p className="text-gray-400">{internship.description}</p>
                        </div>
                    </div>

                    {/* Progress Card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-4 gap-6 mb-4">
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Progress</div>
                                    <div className="text-2xl font-bold">{internship.progress}%</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Tasks Completed</div>
                                    <div className="text-2xl font-bold">{internship.tasksCompleted} / {internship.totalTasks}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Duration</div>
                                    <div className="text-2xl font-bold">{internship.duration}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Deadline</div>
                                    <div className="text-2xl font-bold">{new Date(internship.deadline).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <ProgressBar value={internship.progress} variant="success" />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Tasks Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pending Tasks */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Pending Tasks ({pendingTasks.length})</h2>
                            <div className="space-y-4">
                                {pendingTasks.map((task: any, index: number) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card hover3d glow>
                                            <CardHeader>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Clock size={20} className="text-yellow-400" />
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                                                            Pending
                                                        </span>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(task.difficulty)}`}>
                                                        {task.difficulty}
                                                    </span>
                                                </div>
                                                <CardTitle>{task.title}</CardTitle>
                                                <CardDescription>{task.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <Calendar size={16} />
                                                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-purple-400 font-semibold">
                                                            <Target size={16} />
                                                            {task.points} points
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="primary"
                                                        className="w-full"
                                                        onClick={() => setSelectedTask(task)}
                                                    >
                                                        <Upload size={16} className="mr-2" />
                                                        Submit Task
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Completed Tasks */}
                        {completedTasks.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Completed Tasks ({completedTasks.length})</h2>
                                <div className="space-y-3">
                                    {completedTasks.map((task: any) => (
                                        <Card key={task.id} className="bg-green-500/5 border-green-500/20">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle size={20} className="text-green-400" />
                                                        <div>
                                                            <div className="font-semibold">{task.title}</div>
                                                            <div className="text-sm text-gray-400">{task.points} points earned</div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="success">Completed</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* WITHDRAWAL CARD - At the top for visibility */}
                        {completionStatus?.completionStatus !== 'certificate_issued' && (
                            <Card className={`border-2 ${
                                withdrawalStatus?.withdrawalStatus === 'approved' 
                                    ? 'bg-gradient-to-br from-red-600/20 to-orange-600/20 border-red-500/50'
                                    : withdrawalStatus?.withdrawalStatus === 'pending'
                                    ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/50'
                                    : withdrawalStatus?.withdrawalStatus === 'rejected'
                                    ? 'bg-gradient-to-br from-gray-600/20 to-slate-600/20 border-gray-500/30'
                                    : 'bg-gradient-to-br from-orange-600/10 to-red-600/10 border-orange-500/30'
                            }`}>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <LogOut className="text-orange-400" size={20} />
                                        <CardTitle className="text-lg">Leave Internship</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {withdrawalStatus?.withdrawalStatus === 'approved' && (
                                        <div className="text-center space-y-3">
                                            <CheckCircle size={40} className="mx-auto text-red-400" />
                                            <div>
                                                <div className="font-semibold text-red-400">Withdrawal Approved</div>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Your withdrawal has been approved. You have left this internship.
                                                </p>
                                            </div>
                                            {withdrawalStatus.withdrawalAdminNote && (
                                                <div className="bg-white/5 rounded-lg p-3 text-left">
                                                    <div className="text-xs text-gray-400 mb-1">Admin Note</div>
                                                    <p className="text-sm">{withdrawalStatus.withdrawalAdminNote}</p>
                                                </div>
                                            )}
                                            
                                            {/* Withdrawal Documents */}
                                            <div className="pt-2 border-t border-white/10 space-y-2">
                                                <p className="text-xs text-gray-400 mb-2">Your Documents</p>
                                                <button 
                                                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 transition-all"
                                                    onClick={async () => {
                                                        try {
                                                            const response = await api.get(`/student/documents/${internship?.enrollmentId}/partial-completion`, {
                                                                responseType: 'blob'
                                                            });
                                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute('download', `partial-completion-letter-${internship?.title}.pdf`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            link.remove();
                                                        } catch (error) {
                                                            alert('Failed to download partial completion letter');
                                                        }
                                                    }}
                                                >
                                                    <Download size={16} className="mr-2" />
                                                    Partial Completion Letter
                                                </button>
                                                <button 
                                                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all"
                                                    onClick={async () => {
                                                        try {
                                                            const response = await api.get(`/student/documents/${internship?.enrollmentId}/relieving-letter`, {
                                                                responseType: 'blob'
                                                            });
                                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute('download', `relieving-letter-${internship?.title}.pdf`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            link.remove();
                                                        } catch (error) {
                                                            alert('Failed to download relieving letter');
                                                        }
                                                    }}
                                                >
                                                    <Download size={16} className="mr-2" />
                                                    Relieving Letter
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {withdrawalStatus?.withdrawalStatus === 'pending' && (
                                        <div className="text-center space-y-3">
                                            <Clock size={40} className="mx-auto text-yellow-400" />
                                            <div>
                                                <div className="font-semibold text-yellow-400">Withdrawal Pending</div>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Your withdrawal request is under review.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {withdrawalStatus?.withdrawalStatus === 'rejected' && (
                                        <div className="text-center space-y-3">
                                            <AlertTriangle size={40} className="mx-auto text-gray-400" />
                                            <div>
                                                <div className="font-semibold text-gray-400">Request Rejected</div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Your withdrawal request was not approved.
                                                </p>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                                                onClick={() => setShowWithdrawModal(true)}
                                            >
                                                <LogOut size={16} className="mr-2" />
                                                Request Again
                                            </Button>
                                        </div>
                                    )}

                                    {(!withdrawalStatus || !withdrawalStatus.withdrawalStatus || withdrawalStatus.withdrawalStatus === 'not_requested') && (
                                        <div className="text-center space-y-3">
                                            <LogOut size={40} className="mx-auto text-orange-400" />
                                            <p className="text-sm text-gray-400">
                                                Need to leave this internship? You can request to withdraw.
                                            </p>
                                            <Button 
                                                variant="primary" 
                                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                                onClick={() => setShowWithdrawModal(true)}
                                            >
                                                <LogOut size={16} className="mr-2" />
                                                Request Withdrawal
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Stats Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Tasks</span>
                                    <span className="font-bold">{internship.totalTasks}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Completed</span>
                                    <span className="font-bold text-green-400">{internship.tasksCompleted}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Pending</span>
                                    <span className="font-bold text-yellow-400">{pendingTasks.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Points</span>
                                    <span className="font-bold gradient-text">
                                        {completedTasks.reduce((sum: number, t: any) => sum + t.points, 0)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Browse New Internships */}
                        <Link href="/internships">
                            <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-600/10 to-pink-600/10 hover:border-purple-500/50 transition-all cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                            <Plus size={20} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold">Browse New Internships</div>
                                            <div className="text-xs text-gray-400">Explore more opportunities</div>
                                        </div>
                                        <ExternalLink size={16} className="text-purple-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Progress Card */}
                        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
                            <CardContent className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                    <TrendingUp size={32} className="text-white" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Great Progress!</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    You're {internship.progress}% through this internship
                                </p>
                                <div className="text-sm text-gray-500">
                                    {internship.totalTasks - internship.tasksCompleted} tasks remaining
                                </div>
                            </CardContent>
                        </Card>

                        {/* Completion Status Card */}
                        {internship.enrollmentId && (
                            <Card className={`border-2 ${
                                completionStatus?.completionStatus === 'certificate_issued' 
                                    ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/50'
                                    : completionStatus?.completionStatus === 'reviewed'
                                    ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/50'
                                    : completionStatus?.completionStatus === 'pending_review'
                                    ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/50'
                                    : 'bg-gradient-to-br from-gray-600/20 to-slate-600/20 border-gray-500/30'
                            }`}>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Award className={`${
                                            completionStatus?.completionStatus === 'certificate_issued' 
                                                ? 'text-green-400'
                                                : completionStatus?.completionStatus === 'reviewed'
                                                ? 'text-blue-400'
                                                : completionStatus?.completionStatus === 'pending_review'
                                                ? 'text-yellow-400'
                                                : 'text-gray-400'
                                        }`} size={24} />
                                        <CardTitle className="text-lg">Internship Completion</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Status Display */}
                                    {completionStatus?.completionStatus === 'certificate_issued' && (
                                        <>
                                            <div className="text-center">
                                                <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                                    <span className="text-3xl font-bold text-white">{completionStatus.marks}</span>
                                                </div>
                                                <div className="text-sm text-gray-400">Marks Obtained</div>
                                                <div className="text-2xl font-bold text-green-400">{completionStatus.marks}/50</div>
                                            </div>
                                            {completionStatus.adminFeedback && (
                                                <div className="bg-white/5 rounded-lg p-3">
                                                    <div className="text-xs text-gray-400 mb-1">Feedback</div>
                                                    <p className="text-sm">{completionStatus.adminFeedback}</p>
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-2">
                                                <Button 
                                                    variant="primary" 
                                                    className="w-full"
                                                    onClick={handlePreviewLetter}
                                                >
                                                    <Eye size={16} className="mr-2" />
                                                    Preview Letter
                                                </Button>
                                                <Button 
                                                    variant="secondary" 
                                                    className="w-full"
                                                    onClick={handleDownloadLetter}
                                                >
                                                    <Download size={16} className="mr-2" />
                                                    Download Letter
                                                </Button>
                                                <Button 
                                                    variant="primary" 
                                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                                    onClick={handleDownloadCertificate}
                                                >
                                                    <Award size={16} className="mr-2" />
                                                    Download Certificate
                                                </Button>
                                            </div>
                                        </>
                                    )}

                                    {completionStatus?.completionStatus === 'reviewed' && (
                                        <>
                                            <div className="text-center">
                                                <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                                    <span className="text-3xl font-bold text-white">{completionStatus.marks}</span>
                                                </div>
                                                <div className="text-sm text-gray-400">Marks Obtained</div>
                                                <div className="text-2xl font-bold text-blue-400">{completionStatus.marks}/50</div>
                                            </div>
                                            {completionStatus.adminFeedback && (
                                                <div className="bg-white/5 rounded-lg p-3">
                                                    <div className="text-xs text-gray-400 mb-1">Feedback</div>
                                                    <p className="text-sm">{completionStatus.adminFeedback}</p>
                                                </div>
                                            )}
                                            <Badge variant="info" className="w-full justify-center py-2">
                                                <FileCheck size={14} className="mr-1" /> Reviewed - Certificate Pending
                                            </Badge>
                                            <Button 
                                                variant="secondary" 
                                                className="w-full"
                                                onClick={handlePreviewLetter}
                                            >
                                                <Eye size={16} className="mr-2" />
                                                Preview Completion Letter
                                            </Button>
                                        </>
                                    )}

                                    {completionStatus?.completionStatus === 'pending_review' && (
                                        <div className="text-center space-y-3">
                                            <Clock size={40} className="mx-auto text-yellow-400" />
                                            <div>
                                                <div className="font-semibold text-yellow-400">Under Review</div>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Admin is reviewing your internship. You'll be notified once reviewed.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {(!completionStatus || completionStatus.completionStatus === 'not_requested') && (
                                        <>
                                            {internship.progress >= 100 ? (
                                                <div className="text-center space-y-4">
                                                    <CheckCircle size={40} className="mx-auto text-green-400" />
                                                    <div>
                                                        <div className="font-semibold text-green-400">All Tasks Completed!</div>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            You can now request completion review from admin.
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        variant="primary" 
                                                        className="w-full"
                                                        onClick={() => setShowCompletionModal(true)}
                                                    >
                                                        <Send size={16} className="mr-2" />
                                                        Request Completion Review
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-center space-y-3">
                                                    <TrendingUp size={40} className="mx-auto text-gray-400" />
                                                    <div>
                                                        <div className="font-semibold text-gray-400">Keep Going!</div>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Complete all tasks to request internship completion review.
                                                        </p>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {internship.totalTasks - internship.tasksCompleted} tasks remaining
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Completion Request Modal */}
            {showCompletionModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                        <Send size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>Request Completion Review</CardTitle>
                                        <CardDescription>Submit your internship for admin review</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Internship</span>
                                        <span className="font-semibold">{internship.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Tasks Completed</span>
                                        <span className="font-semibold text-green-400">{internship.tasksCompleted}/{internship.totalTasks}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Points</span>
                                        <span className="font-semibold gradient-text">
                                            {completedTasks.reduce((sum: number, t: any) => sum + t.points, 0)}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                    <p className="text-sm text-yellow-400">
                                        <strong>Note:</strong> Once you request completion, admin will review your overall performance and assign marks out of 50. A completion letter and certificate will be generated.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        variant="primary" 
                                        className="flex-1"
                                        onClick={handleRequestCompletion}
                                        disabled={isRequestingCompletion}
                                    >
                                        {isRequestingCompletion ? 'Requesting...' : 'Confirm Request'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowCompletionModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Completion Letter Preview Modal */}
            {showLetterPreview && letterPreviewData && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full my-8"
                    >
                        <Card className="max-h-[80vh] overflow-y-auto">
                            <CardHeader className="sticky top-0 bg-[#1a1a2e] z-10 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Completion Letter Preview</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowLetterPreview(false)}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="bg-white text-black rounded-lg p-8 space-y-6">
                                    {/* Letter Header */}
                                    <div className="text-center border-b-2 border-purple-600 pb-4">
                                        <h1 className="text-2xl font-bold text-purple-600">CodeSprint Labs</h1>
                                        <p className="text-gray-500 text-sm italic">Empowering Future Tech Leaders</p>
                                    </div>

                                    {/* Date */}
                                    <div className="text-right text-gray-600 text-sm">
                                        Date: {letterPreviewData.issueDate}
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-xl font-bold text-center uppercase tracking-wider">
                                        Internship Completion Letter
                                    </h2>

                                    {/* Content */}
                                    <div className="space-y-4 text-gray-800">
                                        <p>
                                            This is to certify that <strong className="text-purple-600">{letterPreviewData.studentName}</strong>
                                            {letterPreviewData.studentCollegeName !== 'N/A' && (
                                                <> from <strong>{letterPreviewData.studentCollegeName}</strong></>
                                            )} has successfully completed the internship program at CodeSprint Labs.
                                        </p>
                                        <p>
                                            During the internship period from <strong>{letterPreviewData.startDate}</strong> to{' '}
                                            <strong>{letterPreviewData.endDate}</strong>, the intern was engaged in the{' '}
                                            <strong>{letterPreviewData.internshipTitle}</strong> program under the{' '}
                                            <strong>{letterPreviewData.internshipDomain}</strong> domain.
                                        </p>
                                    </div>

                                    {/* Performance Box */}
                                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                                        <h3 className="text-center font-bold text-purple-600 mb-4 uppercase">Performance Summary</h3>
                                        <div className="text-center mb-4">
                                            <div className="inline-block w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full text-white text-3xl font-bold leading-[80px]">
                                                {letterPreviewData.grade}
                                            </div>
                                            <div className="text-xl font-bold text-purple-600 mt-2">
                                                {letterPreviewData.marks} / {letterPreviewData.maxMarks} Marks
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-gray-600">Tasks Completed</span>
                                                <span className="font-semibold">{letterPreviewData.tasksCompleted} / {letterPreviewData.totalTasks}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-gray-600">Total Points</span>
                                                <span className="font-semibold">{letterPreviewData.totalPoints}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-gray-600">Percentage</span>
                                                <span className="font-semibold">{letterPreviewData.percentage}%</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-gray-600">Review Date</span>
                                                <span className="font-semibold">{letterPreviewData.reviewedAt}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    {letterPreviewData.adminFeedback && (
                                        <div className="bg-gray-50 border-l-4 border-purple-600 p-4">
                                            <h4 className="font-bold text-purple-600 mb-2">Supervisor's Remarks</h4>
                                            <p className="text-gray-700">{letterPreviewData.adminFeedback}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button 
                                        variant="primary" 
                                        className="flex-1"
                                        onClick={handleDownloadLetter}
                                    >
                                        <Download size={16} className="mr-2" />
                                        Download PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowLetterPreview(false)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Task Submission Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit Task: {selectedTask.title}</CardTitle>
                                <CardDescription>Upload your solution or provide a link</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">GitHub Repository URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://github.com/username/repo"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Additional Notes</label>
                                        <textarea
                                            rows={4}
                                            placeholder="Describe your solution..."
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="primary" className="flex-1">
                                            Submit Task
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setSelectedTask(null)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Withdrawal Request Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full"
                    >
                        <Card className="border-orange-500/30">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                            <LogOut size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <CardTitle>Request Withdrawal</CardTitle>
                                            <CardDescription>Leave this internship</CardDescription>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowWithdrawModal(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Internship</span>
                                        <span className="font-semibold">{internship.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Progress</span>
                                        <span className="font-semibold">{internship.progress}%</span>
                                    </div>
                                </div>

                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-400">
                                            <strong>Warning:</strong> Once your withdrawal is approved, you will be removed from this internship and will lose access to all tasks and progress.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Reason for withdrawal <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={withdrawReason}
                                        onChange={(e) => setWithdrawReason(e.target.value)}
                                        placeholder="Please explain why you want to leave this internship..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button 
                                        variant="ghost" 
                                        className="flex-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                                        onClick={handleRequestWithdrawal}
                                        disabled={isRequestingWithdrawal || !withdrawReason.trim()}
                                    >
                                        {isRequestingWithdrawal ? 'Submitting...' : 'Submit Request'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setShowWithdrawModal(false);
                                            setWithdrawReason('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
