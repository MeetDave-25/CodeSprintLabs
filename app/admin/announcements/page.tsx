'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Megaphone, Send, Eye, X, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { adminService } from '@/lib/services';

interface Announcement {
    id: string;
    _id?: string;
    title: string;
    message?: string;
    content?: string;
    targetAudience: 'all' | 'students' | 'specific';
    priority: 'low' | 'medium' | 'high';
    status: 'draft' | 'published';
    isActive?: boolean;
    createdAt?: string;
    created_at?: string;
    views?: number;
}

interface Stats {
    total: number;
    published: number;
    draft: number;
    totalViews: number;
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0, totalViews: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        targetAudience: 'all' as 'all' | 'students' | 'specific',
        priority: 'medium' as 'low' | 'medium' | 'high',
        isActive: false,
    });

    useEffect(() => {
        fetchAnnouncements();
        fetchStats();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setIsLoading(true);
            const response = await adminService.getAnnouncements();
            let data = response.data.data || response.data.announcements || response.data || [];
            if (data.data) data = data.data;
            setAnnouncements(data);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminService.getAnnouncementStats();
            const data = response.data;
            setStats({
                total: data.total || 0,
                published: data.published || data.active || 0,
                draft: data.draft || data.inactive || 0,
                totalViews: data.totalViews || 0,
            });
        } catch (error) {
            console.error('Failed to fetch announcement stats:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingAnnouncement) {
                await adminService.updateAnnouncement(getAnnouncementId(editingAnnouncement), formData);
            } else {
                await adminService.createAnnouncement(formData);
            }
            setShowCreateModal(false);
            setEditingAnnouncement(null);
            resetForm();
            fetchAnnouncements();
            fetchStats();
        } catch (error) {
            console.error('Failed to save announcement:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content || announcement.message || '',
            targetAudience: announcement.targetAudience,
            priority: announcement.priority,
            isActive: announcement.isActive || announcement.status === 'published',
        });
        setShowCreateModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        
        try {
            await adminService.deleteAnnouncement(id);
            fetchAnnouncements();
            fetchStats();
        } catch (error) {
            console.error('Failed to delete announcement:', error);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await adminService.publishAnnouncement(id);
            fetchAnnouncements();
            fetchStats();
        } catch (error) {
            console.error('Failed to publish announcement:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            targetAudience: 'all',
            priority: 'medium',
            isActive: false,
        });
    };

    const getAnnouncementId = (a: Announcement) => a._id || a.id;
    const getMessage = (a: Announcement) => a.content || a.message || '';
    const getCreatedAt = (a: Announcement) => a.createdAt || a.created_at;
    const getStatus = (a: Announcement) => a.isActive ? 'published' : a.status;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/20 text-red-400';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400';
            case 'low': return 'bg-green-500/20 text-green-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Announcements</h1>
                    <p className="text-gray-400">Create and manage platform announcements</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { fetchAnnouncements(); fetchStats(); }}>
                        <RefreshCw size={18} className="mr-2" />
                        Refresh
                    </Button>
                    <Button variant="primary" onClick={() => { resetForm(); setEditingAnnouncement(null); setShowCreateModal(true); }}>
                        <Plus size={18} className="mr-2" />
                        Create Announcement
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                        <div className="text-sm text-gray-400">Total Announcements</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.published}</div>
                        <div className="text-sm text-gray-400">Published</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-400">{stats.draft}</div>
                        <div className="text-sm text-gray-400">Draft</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-400">{stats.totalViews}</div>
                        <div className="text-sm text-gray-400">Total Views</div>
                    </CardContent>
                </Card>
            </div>

            {/* Announcements List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement, index) => (
                        <motion.div
                            key={getAnnouncementId(announcement)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card hover3d glow>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Megaphone size={20} className="text-purple-400" />
                                                <h3 className="text-xl font-bold">{announcement.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(announcement.priority)}`}>
                                                    {announcement.priority}
                                                </span>
                                                <Badge variant={getStatus(announcement) === 'published' ? 'success' : 'warning'}>
                                                    {getStatus(announcement)}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-400 mb-4">{getMessage(announcement)}</p>
                                            <div className="flex items-center gap-6 text-sm text-gray-400">
                                                <div>
                                                    <span className="font-semibold">Target:</span> {announcement.targetAudience}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Created:</span>{' '}
                                                    {getCreatedAt(announcement) 
                                                        ? new Date(getCreatedAt(announcement)!).toLocaleDateString() 
                                                        : 'N/A'}
                                                </div>
                                                {announcement.views !== undefined && (
                                                    <div className="flex items-center gap-1">
                                                        <Eye size={14} />
                                                        <span>{announcement.views} views</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            {getStatus(announcement) === 'draft' && (
                                                <Button 
                                                    variant="primary" 
                                                    size="sm"
                                                    onClick={() => handlePublish(getAnnouncementId(announcement))}
                                                >
                                                    <Send size={14} className="mr-1" />
                                                    Publish
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(announcement)}>
                                                <Edit size={14} />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-400 hover:text-red-300"
                                                onClick={() => handleDelete(getAnnouncementId(announcement))}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {!isLoading && announcements.length === 0 && (
                <div className="text-center py-20">
                    <Megaphone size={64} className="mx-auto mb-4 text-gray-600" />
                    <h3 className="text-2xl font-bold mb-2">No Announcements</h3>
                    <p className="text-gray-400 mb-6">Create your first announcement</p>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} className="mr-2" />
                        Create Announcement
                    </Button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">
                                        {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                                    </h2>
                                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        label="Title"
                                        placeholder="Announcement title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                                        <textarea
                                            placeholder="Announcement content..."
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 min-h-[100px]"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                                            <select
                                                value={formData.targetAudience}
                                                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                            >
                                                <option value="all" className="bg-gray-900">All Users</option>
                                                <option value="students" className="bg-gray-900">Students Only</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                            >
                                                <option value="low" className="bg-gray-900">Low</option>
                                                <option value="medium" className="bg-gray-900">Medium</option>
                                                <option value="high" className="bg-gray-900">High</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500"
                                        />
                                        <label htmlFor="isActive" className="text-sm text-gray-300">Publish immediately</label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                                            {editingAnnouncement ? 'Update' : 'Create'} Announcement
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
