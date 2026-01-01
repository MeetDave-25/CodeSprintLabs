'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Megaphone, Send, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Announcement {
    id: string;
    title: string;
    message: string;
    targetAudience: 'all' | 'students' | 'specific';
    priority: 'low' | 'medium' | 'high';
    status: 'draft' | 'published';
    createdAt: string;
    views: number;
}

const mockAnnouncements: Announcement[] = [
    {
        id: '1',
        title: 'New Course Launch: React Advanced Patterns',
        message: 'We are excited to announce the launch of our new advanced React course covering hooks, context, and performance optimization.',
        targetAudience: 'all',
        priority: 'high',
        status: 'published',
        createdAt: '2025-12-01',
        views: 245,
    },
    {
        id: '2',
        title: 'Platform Maintenance Scheduled',
        message: 'Our platform will undergo scheduled maintenance on December 10th from 2 AM to 4 AM IST. Services may be temporarily unavailable.',
        targetAudience: 'all',
        priority: 'medium',
        status: 'published',
        createdAt: '2025-12-02',
        views: 189,
    },
    {
        id: '3',
        title: 'Upcoming Webinar: Career in Tech',
        message: 'Join us for an exclusive webinar on building a successful career in technology. Register now!',
        targetAudience: 'students',
        priority: 'low',
        status: 'draft',
        createdAt: '2025-12-03',
        views: 0,
    },
];

export default function AdminAnnouncementsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const stats = {
        total: mockAnnouncements.length,
        published: mockAnnouncements.filter(a => a.status === 'published').length,
        draft: mockAnnouncements.filter(a => a.status === 'draft').length,
        totalViews: mockAnnouncements.reduce((sum, a) => sum + a.views, 0),
    };

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
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} className="mr-2" />
                    Create Announcement
                </Button>
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
            <div className="space-y-4">
                {mockAnnouncements.map((announcement, index) => (
                    <motion.div
                        key={announcement.id}
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
                                            <Badge variant={announcement.status === 'published' ? 'success' : 'warning'}>
                                                {announcement.status}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-400 mb-4">{announcement.message}</p>
                                        <div className="flex items-center gap-6 text-sm text-gray-400">
                                            <div>
                                                <span className="font-semibold">Target:</span> {announcement.targetAudience}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Created:</span> {new Date(announcement.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye size={14} />
                                                <span>{announcement.views} views</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        {announcement.status === 'draft' && (
                                            <Button variant="primary" size="sm">
                                                <Send size={14} className="mr-1" />
                                                Publish
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm">
                                            <Edit size={14} />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {mockAnnouncements.length === 0 && (
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
        </div>
    );
}
