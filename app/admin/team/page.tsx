'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Linkedin,
    Github,
    Twitter,
    Mail,
    Phone,
    GripVertical,
    X,
    Save,
    User,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import api from '@/lib/api';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio?: string;
    email?: string;
    phone?: string;
    image?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    gradient: string;
    order: number;
    isActive: boolean;
    created_at: string;
}

interface TeamStats {
    total: number;
    active: number;
    inactive: number;
}

const gradientOptions = [
    { value: 'from-purple-600 to-pink-600', label: 'Purple to Pink' },
    { value: 'from-blue-500 to-cyan-500', label: 'Blue to Cyan' },
    { value: 'from-green-500 to-emerald-500', label: 'Green to Emerald' },
    { value: 'from-orange-500 to-red-500', label: 'Orange to Red' },
    { value: 'from-indigo-500 to-purple-500', label: 'Indigo to Purple' },
    { value: 'from-pink-500 to-rose-500', label: 'Pink to Rose' },
    { value: 'from-teal-500 to-green-500', label: 'Teal to Green' },
    { value: 'from-yellow-500 to-orange-500', label: 'Yellow to Orange' },
];

export default function AdminTeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [stats, setStats] = useState<TeamStats>({ total: 0, active: 0, inactive: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        bio: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        twitter: '',
        gradient: 'from-purple-600 to-pink-600',
        isActive: true,
    });

    useEffect(() => {
        fetchTeamMembers();
        fetchStats();
    }, [search, statusFilter]);

    const fetchTeamMembers = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (search) params.search = search;
            if (statusFilter !== 'all') params.status = statusFilter;

            const response = await api.get('/admin/team', { params });
            setMembers(response.data.members || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/team/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleOpenModal = (member?: TeamMember) => {
        if (member) {
            setEditingMember(member);
            setFormData({
                name: member.name,
                role: member.role,
                bio: member.bio || '',
                email: member.email || '',
                phone: member.phone || '',
                linkedin: member.linkedin || '',
                github: member.github || '',
                twitter: member.twitter || '',
                gradient: member.gradient,
                isActive: member.isActive,
            });
        } else {
            setEditingMember(null);
            setFormData({
                name: '',
                role: '',
                bio: '',
                email: '',
                phone: '',
                linkedin: '',
                github: '',
                twitter: '',
                gradient: 'from-purple-600 to-pink-600',
                isActive: true,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingMember(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingMember) {
                await api.put(`/admin/team/${editingMember.id}`, formData);
            } else {
                await api.post('/admin/team', formData);
            }
            handleCloseModal();
            fetchTeamMembers();
            fetchStats();
        } catch (error: any) {
            console.error('Error saving team member:', error);
            alert(error.response?.data?.message || 'Failed to save team member');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) return;

        try {
            console.log('Attempting to delete team member with ID:', id);
            const response = await api.delete(`/admin/team/${id}`);
            console.log('Delete response:', response.data);

            // Show success message
            alert('Team member deleted successfully!');

            // Refresh the data
            await fetchTeamMembers();
            await fetchStats();
        } catch (error: any) {
            console.error('Error deleting team member:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            // Show specific error message
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Failed to delete team member. Please try again.';
            alert(`Error: ${errorMessage}`);
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await api.post(`/admin/team/${id}/toggle-status`);
            fetchTeamMembers();
            fetchStats();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Team Management</h1>
                    <p className="text-gray-400">Manage your team members displayed on the About page</p>
                </div>
                <Button onClick={() => handleOpenModal()} variant="primary">
                    <Plus size={18} className="mr-2" />
                    Add Team Member
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <Users className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Members</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <Eye className="text-green-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Active</p>
                                <p className="text-2xl font-bold">{stats.active}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center">
                                <EyeOff className="text-gray-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Inactive</p>
                                <p className="text-2xl font-bold">{stats.inactive}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name, role, or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white [&>option]:bg-[#1a1a2e] [&>option]:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Team Members Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <div className="h-40 bg-white/5 animate-pulse rounded-t-xl"></div>
                            <CardContent className="p-4">
                                <div className="h-4 bg-white/5 rounded w-3/4 mb-2 animate-pulse"></div>
                                <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : members.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="mx-auto text-gray-500 mb-4" size={48} />
                        <h3 className="text-xl font-semibold mb-2">No Team Members</h3>
                        <p className="text-gray-400 mb-4">Add your first team member to display on the About page</p>
                        <Button onClick={() => handleOpenModal()} variant="primary">
                            <Plus size={18} className="mr-2" />
                            Add Team Member
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {members.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`h-full ${!member.isActive ? 'opacity-60' : ''}`}>
                                <div className={`h-32 bg-gradient-to-br ${member.gradient} rounded-t-xl flex items-center justify-center relative`}>
                                    {member.image ? (
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                            <User size={40} className="text-white" />
                                        </div>
                                    )}
                                    {!member.isActive && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800/80 rounded text-xs">
                                            Inactive
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-lg">{member.name}</h3>
                                    <p className="text-purple-400 text-sm mb-2">{member.role}</p>
                                    {member.bio && (
                                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{member.bio}</p>
                                    )}

                                    {/* Social Links */}
                                    <div className="flex gap-2 mb-4">
                                        {member.email && (
                                            <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-white">
                                                <Mail size={16} />
                                            </a>
                                        )}
                                        {member.linkedin && (
                                            <a href={member.linkedin} target="_blank" className="text-gray-400 hover:text-blue-400">
                                                <Linkedin size={16} />
                                            </a>
                                        )}
                                        {member.github && (
                                            <a href={member.github} target="_blank" className="text-gray-400 hover:text-white">
                                                <Github size={16} />
                                            </a>
                                        )}
                                        {member.twitter && (
                                            <a href={member.twitter} target="_blank" className="text-gray-400 hover:text-blue-400">
                                                <Twitter size={16} />
                                            </a>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenModal(member)}
                                            className="flex-1"
                                        >
                                            <Edit size={14} className="mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleStatus(member.id)}
                                        >
                                            {member.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(member.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1a1a2e] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold">
                                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Name *"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                />
                                <Input
                                    label="Role *"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="Founder & CEO"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="A brief description about this team member..."
                                    rows={3}
                                    maxLength={500}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                    icon={<Mail size={18} />}
                                />
                                <Input
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 12345 67890"
                                    icon={<Phone size={18} />}
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <Input
                                    label="LinkedIn"
                                    value={formData.linkedin}
                                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                    placeholder="https://linkedin.com/in/..."
                                    icon={<Linkedin size={18} />}
                                />
                                <Input
                                    label="GitHub"
                                    value={formData.github}
                                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                    placeholder="https://github.com/..."
                                    icon={<Github size={18} />}
                                />
                                <Input
                                    label="Twitter"
                                    value={formData.twitter}
                                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                    placeholder="https://twitter.com/..."
                                    icon={<Twitter size={18} />}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Card Gradient</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {gradientOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gradient: option.value })}
                                            className={`h-12 rounded-lg bg-gradient-to-br ${option.value} ${formData.gradient === option.value
                                                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e]'
                                                : ''
                                                }`}
                                            title={option.label}
                                        />
                                    ))}
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
                                <label htmlFor="isActive" className="text-sm">
                                    Show on About page (Active)
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/10">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleCloseModal}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={saving}
                                    className="flex-1"
                                >
                                    <Save size={18} className="mr-2" />
                                    {editingMember ? 'Update Member' : 'Add Member'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
