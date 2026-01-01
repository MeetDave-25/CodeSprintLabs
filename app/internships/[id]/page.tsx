'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Clock,
    Users,
    Code,
    CheckCircle,
    Star,
    Calendar,
    Briefcase,
    Send,
    Loader2,
    Upload,
    FileText,
    X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Internship {
    id: string;
    title: string;
    domain: string;
    description: string;
    duration: string;
    languages: string[];
    difficulty: string;
    enrolled: number;
    maxStudents: number;
    rating: number;
    isActive: boolean;
    requirements: string[];
    whatYouWillLearn: string[];
    syllabus: any[];
    price?: number;
}


export default function InternshipDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const internshipId = params.id as string;

    const [internship, setInternship] = useState<Internship | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [requestPending, setRequestPending] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [enrollMessage, setEnrollMessage] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [useProfileResume, setUseProfileResume] = useState(false);
    const [profileResume, setProfileResume] = useState<{
        hasResume: boolean;
        resumeOriginalName: string | null;
        resumeGoogleDriveUrl: string | null;
    } | null>(null);

    useEffect(() => {
        if (internshipId) {
            fetchInternship();
        }
    }, [internshipId]);

    // Check enrollment status when user is authenticated
    useEffect(() => {
        if (isAuthenticated && internshipId) {
            checkEnrollmentStatus();
            fetchProfileResume();
        }
    }, [isAuthenticated, internshipId]);

    const fetchProfileResume = async () => {
        // Fetch profile resume data
        try {
            const response = await api.get('/student/profile');
            const profile = response.data.profile;
            setProfileResume({
                hasResume: profile.hasResume || false,
                resumeOriginalName: profile.resumeOriginalName,
                resumeGoogleDriveUrl: profile.resumeGoogleDriveUrl,
            });
            // Auto-select profile resume if available
            if (profile.hasResume) {
                setUseProfileResume(true);
            }
        } catch (error) {
            console.error('Error fetching profile resume:', error);
        }
    };

    const fetchInternship = async () => {
        try {
            const res = await api.get(`/internships/${internshipId}`);
            if (res.data.status === 'success') {
                const data = res.data.data;
                setInternship({
                    ...data,
                    languages: data.languages || [],
                    requirements: data.requirements || [],
                    whatYouWillLearn: data.whatYouWillLearn || [],
                    syllabus: data.syllabus || [],
                    maxStudents: data.maxStudents || 100,
                    rating: data.rating || 0
                });
            }
        } catch (err) {
            console.error('Error fetching internship:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const checkEnrollmentStatus = async () => {
        try {
            // Check if already enrolled via profile
            const profileRes = await api.get('/student/profile');
            const enrolledInternships = profileRes.data.profile?.enrolledInternships || [];

            if (enrolledInternships.includes(internshipId)) {
                setEnrolled(true);
                return;
            }

            // Check for pending enrollment request
            const requestsRes = await api.get('/student/enrollment-requests');
            const requests = requestsRes.data.data || [];

            const pendingRequest = requests.find(
                (req: any) => req.internshipId === internshipId && req.status === 'pending'
            );

            if (pendingRequest) {
                setRequestPending(true);
            }

            // Check if approved (already enrolled through request)
            const approvedRequest = requests.find(
                (req: any) => req.internshipId === internshipId && req.status === 'approved'
            );

            if (approvedRequest) {
                setEnrolled(true);
            }
        } catch (err) {
            console.error('Error checking enrollment status:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!internship) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Internship not found</h2>
                    <Button onClick={() => router.push('/internships')}>
                        Back to Internships
                    </Button>
                </div>
            </div>
        );
    }

    const handleEnroll = async () => {
        setIsEnrolling(true);
        console.log('Enrolling in internship:', internshipId);
        console.log('Request URL:', `/student/enrollment-requests/${internshipId}`);
        try {
            // Create FormData to handle file upload
            const formData = new FormData();
            formData.append('message', enrollMessage);
            
            // Add resume - either from file upload or use profile resume
            if (resumeFile) {
                formData.append('resume', resumeFile);
            } else if (useProfileResume && profileResume?.hasResume) {
                formData.append('useProfileResume', 'true');
            }

            // Submit enrollment request with resume
            const res = await api.post(`/student/enrollment-requests/${internshipId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (res.data.status === 'success') {
                setRequestPending(true);
                setShowRequestModal(false);
                setEnrollMessage('');
                setResumeFile(null);
                setUseProfileResume(false);
                alert('Your enrollment request has been submitted! You will be notified once an admin reviews it.');
            }
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                alert("Please login to submit an enrollment request");
                router.push('/auth/login');
            } else if (error.response?.data?.message) {
                const message = error.response.data.message;
                alert(message);
                if (message.includes('already enrolled')) {
                    setEnrolled(true);
                } else if (message.includes('pending request')) {
                    setRequestPending(true);
                }
            } else {
                alert("Failed to submit request. Please try again.");
            }
        } finally {
            setIsEnrolling(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'success';
            case 'Intermediate': return 'warning';
            case 'Advanced': return 'danger';
            default: return 'default';
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push('/internships')}
                    className="mb-6"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Internships
                </Button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{internship.title}</h1>
                            <p className="text-gray-400 text-lg">{internship.description}</p>
                        </div>
                        <Badge variant={getDifficultyColor(internship.difficulty) as any}>
                            {internship.difficulty}
                        </Badge>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{internship.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>{internship.enrolled} / {internship.maxStudents} enrolled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Code size={16} />
                            <span>{internship.languages.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            <span>{internship.rating} Rating</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* What You'll Learn */}
                        <Card>
                            <CardHeader>
                                <CardTitle>What You'll Learn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {internship.whatYouWillLearn.map((item: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Syllabus */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Syllabus</CardTitle>
                                <CardDescription>Week-by-week breakdown</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {internship.syllabus.map((item: any) => (
                                        <div key={item.week} className="flex items-start gap-4 p-3 bg-white/5 rounded-lg">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                                                <span className="font-bold">W{item.week}</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold">Week {item.week}</div>
                                                <div className="text-sm text-gray-400">{item.topic}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Requirements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {internship.requirements.map((req: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-purple-400">•</span>
                                            <span className="text-gray-400">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Enrollment Card */}
                        <Card className={enrolled ? 'bg-green-500/10 border-green-500/30' : requestPending ? 'bg-yellow-500/10 border-yellow-500/30' : ''}>
                            <CardContent className="p-6">
                                {enrolled ? (
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <CheckCircle size={32} className="text-white" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 text-green-400">Successfully Enrolled!</h3>
                                        <p className="text-sm text-gray-400 mb-4">
                                            You're now enrolled in this internship. Check your tasks page to get started!
                                        </p>
                                        <Button
                                            variant="primary"
                                            className="w-full mb-2"
                                            onClick={() => router.push('/student/tasks')}
                                        >
                                            <Briefcase size={16} className="mr-2" />
                                            Go to Tasks
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.push('/student/dashboard')}
                                        >
                                            Go to Dashboard
                                        </Button>
                                    </div>
                                ) : requestPending ? (
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <Clock size={32} className="text-white" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 text-yellow-400">Request Pending</h3>
                                        <p className="text-sm text-gray-400 mb-4">
                                            Your enrollment request is being reviewed. You'll be notified once it's approved.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.push('/student/documents')}
                                        >
                                            View My Requests
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-center mb-6">
                                            <div className="text-3xl font-bold gradient-text mb-2">
                                                {internship.price ? `₹${internship.price}` : 'FREE'}
                                            </div>
                                            <div className="text-sm text-gray-400">Limited spots available</div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                                                    style={{ width: `${(internship.enrolled / internship.maxStudents) * 100}%` }}
                                                />
                                            </div>
                                            <div className="text-sm text-gray-400 text-center">
                                                {internship.maxStudents - internship.enrolled} spots remaining
                                            </div>
                                        </div>
                                        <Button
                                            variant="primary"
                                            className="w-full"
                                            onClick={() => setShowRequestModal(true)}
                                        >
                                            Request Enrollment
                                        </Button>
                                        <p className="text-xs text-gray-500 text-center mt-2">
                                            Your request will be reviewed by an admin
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Internship Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Duration</span>
                                    <span className="font-semibold">{internship.duration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Domain</span>
                                    <span className="font-semibold">{internship.domain}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Difficulty</span>
                                    <Badge variant={getDifficultyColor(internship.difficulty) as any}>
                                        {internship.difficulty}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Students</span>
                                    <span className="font-semibold">{internship.enrolled}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Enrollment Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f0f13] border border-white/10 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-2">Request Enrollment</h2>
                        <p className="text-gray-400 mb-4">
                            Submit your enrollment request for <span className="text-purple-400">{internship.title}</span>
                        </p>

                        <div className="bg-white/5 rounded-lg p-4 mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Internship</span>
                                <span className="font-semibold">{internship.title}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Duration</span>
                                <span>{internship.duration}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Domain</span>
                                <span>{internship.domain}</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">
                                Message (Optional)
                            </label>
                            <textarea
                                value={enrollMessage}
                                onChange={(e) => setEnrollMessage(e.target.value)}
                                placeholder="Tell us why you're interested in this internship..."
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* Resume Section */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">
                                Resume (PDF, DOC, DOCX - Max 5MB)
                            </label>

                            {/* Profile Resume Option */}
                            {profileResume?.hasResume && (
                                <div className="mb-3">
                                    <label 
                                        className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                                            useProfileResume && !resumeFile
                                                ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-500/50'
                                                : 'bg-white/5 border-2 border-white/10 hover:border-purple-500/50'
                                        }`}
                                        onClick={() => {
                                            setUseProfileResume(true);
                                            setResumeFile(null);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                useProfileResume && !resumeFile ? 'border-green-500 bg-green-500' : 'border-gray-400'
                                            }`}>
                                                {useProfileResume && !resumeFile && (
                                                    <CheckCircle size={12} className="text-white" />
                                                )}
                                            </div>
                                            <FileText size={20} className="text-green-400" />
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    Use Profile Resume
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {profileResume.resumeOriginalName || 'Google Drive Resume'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                                            Saved
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* Upload New Resume Option */}
                            <div className="relative">
                                {!resumeFile ? (
                                    <label 
                                        className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-white/5 ${
                                            !useProfileResume || resumeFile ? 'border-purple-500/50' : 'border-white/20 hover:border-purple-500'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <Upload className="w-6 h-6 mb-2 text-gray-400" />
                                            <p className="mb-1 text-sm text-gray-400">
                                                <span className="font-semibold text-purple-400">Upload new resume</span>
                                            </p>
                                            <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 5MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        alert('File size must be less than 5MB');
                                                        return;
                                                    }
                                                    setResumeFile(file);
                                                    setUseProfileResume(false);
                                                }
                                            }}
                                        />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border-2 border-purple-500 bg-purple-500 flex items-center justify-center">
                                                <CheckCircle size={12} className="text-white" />
                                            </div>
                                            <FileText className="w-6 h-6 text-purple-400" />
                                            <div>
                                                <p className="text-sm font-medium text-white">{resumeFile.name}</p>
                                                <p className="text-xs text-gray-400">
                                                    {(resumeFile.size / 1024).toFixed(1)} KB - New upload
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setResumeFile(null);
                                                if (profileResume?.hasResume) {
                                                    setUseProfileResume(true);
                                                }
                                            }}
                                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-400 hover:text-red-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleEnroll}
                                isLoading={isEnrolling}
                            >
                                <Send size={16} className="mr-2" />
                                Submit Request
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRequestModal(false);
                                    setEnrollMessage('');
                                    setResumeFile(null);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Once approved, you will receive your MOU and Offer Letter automatically.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
