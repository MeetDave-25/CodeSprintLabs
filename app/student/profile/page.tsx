'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    User, Mail, Phone, MapPin, Calendar, Award, Edit2, Save, X, 
    Building2, GraduationCap, Hash, BookOpen, Loader2, CheckCircle,
    AlertCircle, FileText, Upload, Link as LinkIcon, Trash2, ExternalLink, Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface ProfileData {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    city: string;
    bio: string;
    skills: string[];
    avatar: string | null;
    collegeName: string;
    course: string;
    enrollmentNumber: string;
    rollNumber: string;
    joinedDate: string;
    totalPoints: number;
    tasksCompleted: number;
    coursesCompleted: number;
    resumePath: string | null;
    resumeOriginalName: string | null;
    resumeGoogleDriveUrl: string | null;
    resumeUpdatedAt: string | null;
    hasResume: boolean;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [newSkill, setNewSkill] = useState('');
    const [resumeUploading, setResumeUploading] = useState(false);
    const [showResumeUrlInput, setShowResumeUrlInput] = useState(false);
    const [googleDriveUrl, setGoogleDriveUrl] = useState('');
    const resumeInputRef = useRef<HTMLInputElement>(null);
    
    const [profileData, setProfileData] = useState<ProfileData>({
        id: '',
        name: '',
        email: '',
        phone: '',
        location: '',
        city: '',
        bio: '',
        skills: [],
        avatar: null,
        collegeName: '',
        course: '',
        enrollmentNumber: '',
        rollNumber: '',
        joinedDate: '',
        totalPoints: 0,
        tasksCompleted: 0,
        coursesCompleted: 0,
        resumePath: null,
        resumeOriginalName: null,
        resumeGoogleDriveUrl: null,
        resumeUpdatedAt: null,
        hasResume: false,
    });

    const [originalData, setOriginalData] = useState<ProfileData | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/profile');
            const profile = response.data.profile;
            const data: ProfileData = {
                id: profile.id || '',
                name: profile.name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                location: profile.location || '',
                city: profile.city || '',
                bio: profile.bio || '',
                skills: profile.skills || [],
                avatar: profile.avatar || null,
                collegeName: profile.collegeName || '',
                course: profile.course || '',
                enrollmentNumber: profile.enrollmentNumber || '',
                rollNumber: profile.rollNumber || '',
                joinedDate: profile.joinedDate || new Date().toISOString(),
                totalPoints: profile.totalPoints || 0,
                tasksCompleted: profile.tasksCompleted || 0,
                coursesCompleted: profile.coursesCompleted || 0,
                resumePath: profile.resumePath || null,
                resumeOriginalName: profile.resumeOriginalName || null,
                resumeGoogleDriveUrl: profile.resumeGoogleDriveUrl || null,
                resumeUpdatedAt: profile.resumeUpdatedAt || null,
                hasResume: profile.hasResume || false,
            };
            setProfileData(data);
            setOriginalData(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile data' });
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Courses Completed', value: profileData.coursesCompleted.toString(), icon: GraduationCap },
        { label: 'Tasks Completed', value: profileData.tasksCompleted.toString(), icon: CheckCircle },
        { label: 'Total Points', value: profileData.totalPoints.toLocaleString(), icon: Award },
    ];

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);
            
            const updateData = {
                name: profileData.name,
                phone: profileData.phone,
                location: profileData.location,
                city: profileData.city,
                bio: profileData.bio,
                skills: profileData.skills,
                collegeName: profileData.collegeName,
                course: profileData.course,
                enrollmentNumber: profileData.enrollmentNumber,
                rollNumber: profileData.rollNumber,
            };
            
            await api.put('/student/profile', updateData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            setOriginalData(profileData);
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update profile' 
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (originalData) {
            setProfileData(originalData);
        }
        setIsEditing(false);
        setMessage(null);
    };

    const addSkill = () => {
        if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
            setProfileData({
                ...profileData,
                skills: [...profileData.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    // Resume handling functions
    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size must be less than 5MB' });
            return;
        }

        setResumeUploading(true);
        try {
            const formData = new FormData();
            formData.append('resume', file);

            const response = await api.post('/student/profile/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setProfileData({
                ...profileData,
                resumePath: response.data.resumePath,
                resumeOriginalName: response.data.resumeOriginalName,
                resumeGoogleDriveUrl: null,
                hasResume: true,
                resumeUpdatedAt: new Date().toISOString(),
            });
            setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload resume' });
        } finally {
            setResumeUploading(false);
            if (resumeInputRef.current) {
                resumeInputRef.current.value = '';
            }
        }
    };

    const handleSaveGoogleDriveUrl = async () => {
        if (!googleDriveUrl.trim()) {
            setMessage({ type: 'error', text: 'Please enter a valid Google Drive URL' });
            return;
        }

        setResumeUploading(true);
        try {
            await api.post('/student/profile/resume-url', { url: googleDriveUrl });

            setProfileData({
                ...profileData,
                resumePath: null,
                resumeOriginalName: null,
                resumeGoogleDriveUrl: googleDriveUrl,
                hasResume: true,
                resumeUpdatedAt: new Date().toISOString(),
            });
            setShowResumeUrlInput(false);
            setGoogleDriveUrl('');
            setMessage({ type: 'success', text: 'Google Drive URL saved successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save URL' });
        } finally {
            setResumeUploading(false);
        }
    };

    const handleDeleteResume = async () => {
        if (!confirm('Are you sure you want to delete your resume?')) return;

        try {
            await api.delete('/student/profile/resume');
            setProfileData({
                ...profileData,
                resumePath: null,
                resumeOriginalName: null,
                resumeGoogleDriveUrl: null,
                hasResume: false,
                resumeUpdatedAt: null,
            });
            setMessage({ type: 'success', text: 'Resume deleted successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete resume' });
        }
    };

    const handleDownloadResume = async () => {
        try {
            const response = await api.get('/student/profile/resume/download', {
                responseType: 'blob'
            });
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = profileData.resumeOriginalName || 'resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to download resume' });
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setProfileData({
            ...profileData,
            skills: profileData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                    <p className="text-gray-400">Manage your personal information and academic details</p>
                </div>
                {!isEditing && (
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                        <Edit2 size={16} className="mr-2" />
                        Edit Profile
                    </Button>
                )}
            </div>

            {/* Message Alert */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-center gap-3 ${
                        message.type === 'success' 
                            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                            : 'bg-red-500/20 border border-red-500/30 text-red-400'
                    }`}
                >
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </motion.div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Card */}
                <div className="lg:col-span-1">
                    <Card glow className="sticky top-6">
                        <CardContent className="p-6 text-center">
                            {/* Profile Picture */}
                            <div className="relative inline-block mb-4">
                                <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                                    <User size={64} className="text-white" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold mb-1">{profileData.name || 'Student'}</h2>
                            <p className="text-gray-400 mb-4">{profileData.email}</p>

                            <div className="space-y-3 text-left">
                                {profileData.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone size={16} className="text-gray-400" />
                                        <span className="text-gray-300">{profileData.phone}</span>
                                    </div>
                                )}
                                {(profileData.city || profileData.location) && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span className="text-gray-300">
                                            {[profileData.city, profileData.location].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                )}
                                {profileData.collegeName && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Building2 size={16} className="text-gray-400" />
                                        <span className="text-gray-300">{profileData.collegeName}</span>
                                    </div>
                                )}
                                {profileData.course && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <GraduationCap size={16} className="text-gray-400" />
                                        <span className="text-gray-300">{profileData.course}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span className="text-gray-300">
                                        Joined {new Date(profileData.joinedDate || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <stat.icon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                                        <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                                        <div className="text-xs text-gray-400">{stat.label}</div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Personal Information */}
                    <Card glow>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Your basic contact details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                placeholder="Enter your full name"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-white/5 rounded-lg">
                                                {profileData.name || <span className="text-gray-500">Not provided</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Email 
                                            <span className="text-gray-500 text-xs ml-2">(Cannot be changed)</span>
                                        </label>
                                        <div className="px-4 py-3 bg-white/5 rounded-lg text-gray-400 flex items-center gap-2">
                                            <Mail size={16} />
                                            {profileData.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                placeholder="+91 98765 43210"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-white/5 rounded-lg">
                                                {profileData.phone || <span className="text-gray-500">Not provided</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">City</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.city}
                                                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                placeholder="e.g., Mumbai"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-white/5 rounded-lg">
                                                {profileData.city || <span className="text-gray-500">Not provided</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Address / Location</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.location}
                                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                            placeholder="e.g., Andheri West, Maharashtra"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-white/5 rounded-lg">
                                            {profileData.location || <span className="text-gray-500">Not provided</span>}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Bio</label>
                                    {isEditing ? (
                                        <textarea
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-white/5 rounded-lg">
                                            {profileData.bio || <span className="text-gray-500">No bio provided</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Information */}
                    <Card glow>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap size={20} className="text-purple-400" />
                                Academic Information
                            </CardTitle>
                            <CardDescription>Your college and course details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">College / University Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.collegeName}
                                                onChange={(e) => setProfileData({ ...profileData, collegeName: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                placeholder="e.g., IIT Delhi"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-white/5 rounded-lg flex items-center gap-2">
                                                <Building2 size={16} className="text-gray-400" />
                                                {profileData.collegeName || <span className="text-gray-500">Not provided</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Course / Degree</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.course}
                                                onChange={(e) => setProfileData({ ...profileData, course: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                placeholder="e.g., B.Tech Computer Science"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-white/5 rounded-lg flex items-center gap-2">
                                                <BookOpen size={16} className="text-gray-400" />
                                                {profileData.course || <span className="text-gray-500">Not provided</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Enrollment Number</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.enrollmentNumber}
                                                onChange={(e) => setProfileData({ ...profileData, enrollmentNumber: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                placeholder="e.g., 2024CS001"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-white/5 rounded-lg flex items-center gap-2">
                                                <Hash size={16} className="text-gray-400" />
                                                {profileData.enrollmentNumber || <span className="text-gray-500">Not provided</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Roll Number</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.rollNumber}
                                                onChange={(e) => setProfileData({ ...profileData, rollNumber: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                placeholder="e.g., 101"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-white/5 rounded-lg flex items-center gap-2">
                                                <Hash size={16} className="text-gray-400" />
                                                {profileData.rollNumber || <span className="text-gray-500">Not provided</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card glow>
                        <CardHeader>
                            <CardTitle>Skills</CardTitle>
                            <CardDescription>Technologies and tools you're proficient in</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {profileData.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-sm font-semibold flex items-center gap-2"
                                    >
                                        {skill}
                                        {isEditing && (
                                            <button 
                                                onClick={() => removeSkill(skill)}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {isEditing && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                            placeholder="Add skill"
                                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:border-purple-500 w-32"
                                        />
                                        <button 
                                            onClick={addSkill}
                                            className="px-3 py-2 border-2 border-dashed border-white/20 rounded-full text-sm font-semibold hover:border-purple-500 transition-colors"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                )}
                                {!isEditing && profileData.skills.length === 0 && (
                                    <span className="text-gray-500">No skills added yet</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resume Section */}
                    <Card glow>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText size={20} className="text-blue-400" />
                                Resume / CV
                            </CardTitle>
                            <CardDescription>
                                Upload your resume to use when applying for internships
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Current Resume Display */}
                            {profileData.hasResume ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                <FileText size={24} className="text-green-400" />
                                            </div>
                                            <div>
                                                {profileData.resumeOriginalName ? (
                                                    <>
                                                        <p className="font-semibold text-white">{profileData.resumeOriginalName}</p>
                                                        <p className="text-xs text-gray-400">Uploaded file</p>
                                                    </>
                                                ) : profileData.resumeGoogleDriveUrl ? (
                                                    <>
                                                        <p className="font-semibold text-white">Google Drive Resume</p>
                                                        <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                                            {profileData.resumeGoogleDriveUrl}
                                                        </p>
                                                    </>
                                                ) : null}
                                                {profileData.resumeUpdatedAt && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Updated: {new Date(profileData.resumeUpdatedAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {profileData.resumePath && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleDownloadResume}
                                                >
                                                    <Download size={14} className="mr-1" />
                                                    Download
                                                </Button>
                                            )}
                                            {profileData.resumeGoogleDriveUrl && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(profileData.resumeGoogleDriveUrl!, '_blank')}
                                                >
                                                    <ExternalLink size={14} className="mr-1" />
                                                    Open
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleDeleteResume}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-400 text-center">
                                        This resume will be available when you apply for internships
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Upload Options */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* File Upload */}
                                        <div>
                                            <label 
                                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-white/5"
                                            >
                                                <div className="flex flex-col items-center justify-center py-4">
                                                    {resumeUploading ? (
                                                        <Loader2 className="w-10 h-10 mb-2 text-purple-400 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-10 h-10 mb-2 text-gray-400" />
                                                    )}
                                                    <p className="mb-1 text-sm text-gray-400">
                                                        <span className="font-semibold text-purple-400">Click to upload</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 5MB)</p>
                                                </div>
                                                <input
                                                    ref={resumeInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleResumeUpload}
                                                    disabled={resumeUploading}
                                                />
                                            </label>
                                        </div>

                                        {/* Google Drive URL */}
                                        <div 
                                            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg transition-colors ${
                                                showResumeUrlInput 
                                                    ? 'border-blue-500/50 bg-blue-500/5' 
                                                    : 'border-white/20 hover:border-blue-500 bg-white/5 cursor-pointer'
                                            }`}
                                            onClick={() => !showResumeUrlInput && setShowResumeUrlInput(true)}
                                        >
                                            {showResumeUrlInput ? (
                                                <div className="p-4 w-full space-y-3">
                                                    <input
                                                        type="url"
                                                        value={googleDriveUrl}
                                                        onChange={(e) => setGoogleDriveUrl(e.target.value)}
                                                        placeholder="Paste Google Drive link..."
                                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={handleSaveGoogleDriveUrl}
                                                            disabled={resumeUploading}
                                                        >
                                                            {resumeUploading ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowResumeUrlInput(false);
                                                                setGoogleDriveUrl('');
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-4">
                                                    <LinkIcon className="w-10 h-10 mb-2 text-gray-400" />
                                                    <p className="mb-1 text-sm text-gray-400">
                                                        <span className="font-semibold text-blue-400">Add Google Drive link</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">Share your resume via URL</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 text-center">
                                        Upload your resume once, use it for all internship applications
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Save/Cancel Buttons */}
                    {isEditing && (
                        <div className="flex gap-3">
                            <Button 
                                variant="primary" 
                                onClick={handleSave} 
                                className="flex-1"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" onClick={handleCancel} className="flex-1" disabled={saving}>
                                <X size={16} className="mr-2" />
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
