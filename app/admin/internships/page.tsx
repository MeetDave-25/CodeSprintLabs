'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye, BookOpen, Users, Clock, DollarSign, X, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

import api from '@/lib/api';

interface Internship {
    id: string;
    title: string;
    companyName?: string;
    location?: string;
    type?: string;
    stipend?: string;
    category: string;
    domain?: string;
    duration: string;
    price: number;
    enrolled: number;
    status: string;
    isActive?: boolean;
    isFeatured?: boolean;
    startDate: string;
    endDate?: string;
    applicationDeadline?: string;
    companyLogo?: string;
}

export default function AdminInternshipsPage() {
    const router = useRouter();
    const [internships, setInternships] = useState<Internship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newInternshipData, setNewInternshipData] = useState({
        title: '',
        companyName: '',
        location: '',
        type: 'Remote',
        stipend: '',
        applicationDeadline: '',
        startDate: '',
        endDate: '',
        companyLogo: '',
        domain: '',
        duration: '',
        price: '',
        description: '',
        difficulty: 'Beginner',
        languages: [] as string[],
        whatYouWillLearn: [] as string[],
        requirements: [] as string[],
        responsibilities: [] as string[],
        skills: [] as string[],
        syllabus: [] as { week: number; topic: string }[],
        isFeatured: false,
    });

    // Temp inputs for array fields
    const [newLanguage, setNewLanguage] = useState('');
    const [newLearning, setNewLearning] = useState('');
    const [newRequirement, setNewRequirement] = useState('');
    const [newResponsibility, setNewResponsibility] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [newSyllabusWeek, setNewSyllabusWeek] = useState(1);
    const [newSyllabusTopic, setNewSyllabusTopic] = useState('');

    const handleCreateInternship = async () => {
        // Validate required fields
        if (!newInternshipData.title.trim()) return alert('Please enter a title');
        if (!newInternshipData.companyName.trim()) return alert('Please enter a company name');
        if (!newInternshipData.domain.trim()) return alert('Please enter a domain');
        if (!newInternshipData.duration.trim()) return alert('Please enter a duration');

        try {
            const payload = {
                ...newInternshipData,
                price: newInternshipData.price ? parseFloat(newInternshipData.price) : 0,
                maxStudents: 100,
                isActive: true,
            };

            const response = await api.post('/admin/internships', payload);
            if (response.data.status === 'success') {
                alert('Internship created successfully!');
                setShowCreateModal(false);
                window.location.reload();
            } else {
                alert('Failed to create internship: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('Failed to create internship', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.errors || error.message;
            alert('Failed to create internship: ' + JSON.stringify(errorMsg));
        }
    };

    const handleDeleteInternship = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (confirm('Are you sure you want to delete this internship?')) {
            try {
                console.log('Attempting to delete internship with ID:', id);
                const response = await api.delete(`/admin/internships/${id}`);
                console.log('Delete response:', response.data);
                setInternships(internships.filter(i => i.id !== id));
                alert('Internship deleted successfully!');
            } catch (error: any) {
                console.error('Failed to delete internship:', error);
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);
                alert(`Failed to delete internship: ${error.response?.data?.message || error.message}`);
            }
        }
    }

    React.useEffect(() => {
        const fetchInternships = async () => {
            try {
                const response = await api.get('/admin/internships');
                if (response.data.status === 'success') {
                    // Normalize data
                    const normalized = response.data.data.map((item: any) => ({
                        id: item.id || item._id,
                        title: item.title,
                        category: item.domain || 'Uncategorized', // Map domain to category
                        duration: item.duration,
                        price: item.price,
                        enrolled: item.enrolled || 0,
                        status: item.isActive ? 'active' : 'draft', // Map boolean to string
                        startDate: item.startDate || 'TBA'
                    }));
                    setInternships(normalized);
                }
            } catch (error) {
                console.error('Failed to fetch internships', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInternships();
    }, []);

    const filteredInternships = internships.filter(internship => {
        const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            internship.category.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (statusFilter !== 'all') {
            if (statusFilter === 'active') matchesStatus = internship.status === 'active';
            else if (statusFilter === 'draft') matchesStatus = internship.status === 'draft';
            else matchesStatus = internship.status === statusFilter;
        }

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: internships.length,
        active: internships.filter(i => i.status === 'active').length,
        draft: internships.filter(i => i.status === 'draft').length,
        totalEnrolled: internships.reduce((sum, i) => sum + i.enrolled, 0),
    };

    if (isLoading) {
        return <div className="p-6 text-center text-gray-400">Loading internships...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Internship Management</h1>
                    <p className="text-gray-400">Create and manage internship programs</p>
                </div>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={18} className="mr-2" />
                Create Internship
            </Button>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                        <div className="text-sm text-gray-400">Total Programs</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                        <div className="text-sm text-gray-400">Active</div>
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
                        <div className="text-2xl font-bold text-purple-400">{stats.totalEnrolled}</div>
                        <div className="text-sm text-gray-400">Total Enrolled</div>
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
                                placeholder="Search internships..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'active', 'draft', 'archived'] as const).map((status) => (
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

            {/* Internships Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInternships.map((internship, index) => (
                    <motion.div
                        key={internship.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card hover3d glow className="h-full">
                            <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                    <Badge variant={
                                        internship.status === 'active' ? 'success' :
                                            internship.status === 'draft' ? 'warning' : 'default'
                                    }>
                                        {internship.status}
                                    </Badge>
                                    <div className="text-sm text-gray-400">{internship.category}</div>
                                </div>
                                <CardTitle className="text-xl">{internship.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400 flex items-center gap-2">
                                            <Clock size={16} />
                                            Duration
                                        </span>
                                        <span className="font-semibold">{internship.duration}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400 flex items-center gap-2">
                                            <DollarSign size={16} />
                                            Price
                                        </span>
                                        <span className="font-semibold">₹{internship.price}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400 flex items-center gap-2">
                                            <Users size={16} />
                                            Enrolled
                                        </span>
                                        <span className="font-semibold text-purple-400">{internship.enrolled}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => router.push(`/admin/internships/${internship.id}`)}
                                    >
                                        <Eye size={14} className="mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/admin/internships/${internship.id}`)}
                                    >
                                        <Edit size={14} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300"
                                        onClick={(e) => handleDeleteInternship(internship.id, e)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Create Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-[#0f0f13] border border-white/10 rounded-xl p-6 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">Add New Internship</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Internship Title *</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                            value={newInternshipData.title}
                                            onChange={e => setNewInternshipData({ ...newInternshipData, title: e.target.value })}
                                            placeholder="e.g., Full Stack Developer Intern"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Company Name *</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                            value={newInternshipData.companyName}
                                            onChange={e => setNewInternshipData({ ...newInternshipData, companyName: e.target.value })}
                                            placeholder="e.g., TechCorp India"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Location *</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                            value={newInternshipData.location}
                                            onChange={e => setNewInternshipData({ ...newInternshipData, location: e.target.value })}
                                            placeholder="e.g., Remote / Bangalore"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Type *</label>
                                        <select
                                            className="w-full bg-[#1a1a24] border border-white/10 rounded p-2 text-white [&>option]:bg-[#1a1a24] [&>option]:text-white"
                                            value={newInternshipData.type}
                                            onChange={e => setNewInternshipData({ ...newInternshipData, type: e.target.value })}
                                        >
                                            <option value="Remote">Remote</option>
                                            <option value="On-site">On-site</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Duration *</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                            value={newInternshipData.duration}
                                            onChange={e => setNewInternshipData({ ...newInternshipData, duration: e.target.value })}
                                            placeholder="e.g., 3 months"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Stipend *</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                            value={newInternshipData.stipend}
                                            onChange={e => setNewInternshipData({ ...newInternshipData, stipend: e.target.value })}
                                            placeholder="e.g., ₹15,000/month"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Application Deadline *</label>
                                        <input type="date" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" value={newInternshipData.applicationDeadline} onChange={e => setNewInternshipData({ ...newInternshipData, applicationDeadline: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Internship Start Date</label>
                                        <input type="date" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" value={newInternshipData.startDate} onChange={e => setNewInternshipData({ ...newInternshipData, startDate: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Internship End Date</label>
                                        <input type="date" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" value={newInternshipData.endDate} onChange={e => setNewInternshipData({ ...newInternshipData, endDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Company Logo URL</label>
                                        <input className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" value={newInternshipData.companyLogo} onChange={e => setNewInternshipData({ ...newInternshipData, companyLogo: e.target.value })} placeholder="https://..." />
                                    </div>
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Domain *</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                            value={newInternshipData.domain}
                                            onChange={e => setNewInternshipData({ ...newInternshipData, domain: e.target.value })}
                                            placeholder="e.g. Technology"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                            value={newInternshipData.price}
                                            onChange={e => setNewInternshipData({ ...newInternshipData, price: e.target.value })}
                                            placeholder="4999 (Optional)"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Description *</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                        value={newInternshipData.description}
                                        onChange={e => setNewInternshipData({ ...newInternshipData, description: e.target.value })}
                                        rows={3}
                                        placeholder="Brief description of the internship..."
                                    />
                                </div>

                                {/* Requirements (Multiline or comma split logic simulated as simple text area for now as per user screenshot looking like textarea OR using the existing tag system) 
                                    User screenshot shows "Requirements (comma-separated)" as a single input/textarea.
                                    I will implement a helper to split by comma on blur or change, but essentially show a textarea/input.
                                    However, existing code uses an array cleaner. I will adapt existing array UI to be "comma separated" input if desired, or keep array UI.
                                    User screenshot specifically says "(comma-separated)". I'll use a text area that splits on change for simplicity to match visual.
                                */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Requirements (comma-separated) *</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                        placeholder="React, Node.js, MongoDB"
                                        rows={2}
                                        value={newInternshipData.requirements.join(', ')}
                                        onChange={(e) => setNewInternshipData({ ...newInternshipData, requirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Responsibilities (comma-separated) *</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                        placeholder="Build features, Write tests, Code reviews"
                                        rows={2}
                                        value={newInternshipData.responsibilities.join(', ')}
                                        onChange={(e) => setNewInternshipData({ ...newInternshipData, responsibilities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Skills (comma-separated) *</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                        placeholder="JavaScript, React, Node.js"
                                        value={newInternshipData.skills.join(', ')}
                                        onChange={(e) => setNewInternshipData({ ...newInternshipData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={newInternshipData.isFeatured}
                                        onChange={e => setNewInternshipData({ ...newInternshipData, isFeatured: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label htmlFor="featured" className="text-sm text-gray-400">Mark as Featured</label>
                                </div>


                                <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                                    <Button variant="primary" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600" onClick={handleCreateInternship}>
                                        <Plus size={18} className="mr-2" />
                                        Add Internship
                                    </Button>
                                    <Button variant="outline" className="w-auto" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                filteredInternships.length === 0 && (
                    <div className="text-center py-20">
                        <BookOpen size={64} className="mx-auto mb-4 text-gray-600" />
                        <h3 className="text-2xl font-bold mb-2">No Internships Found</h3>
                        <p className="text-gray-400 mb-6">Create your first internship program</p>
                        <Button variant="primary">
                            <Plus size={18} className="mr-2" />
                            Create Internship
                        </Button>
                    </div>
                )
            }
        </div >
    );
}
