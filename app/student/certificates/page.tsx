'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, ExternalLink, Calendar, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { FloatingRocket } from '@/components/3d/FloatingRocket';
import api from '@/lib/api';

interface Certificate {
    id: string;
    studentName: string;
    courseTitle?: string;
    internshipTitle?: string;
    issueDate: string;
    verificationCode: string;
}

export default function MyCertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const res = await api.get('/student/certificates');
            if (res.data.status === 'success') {
                setCertificates(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch certificates', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (id: string, code: string) => {
        try {
            // We need to request the blob
            const response = await api.get(`/student/certificates/${id}/download`, {
                responseType: 'blob'
            });

            // Create a blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificate-${code}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed', error);
            alert('Failed to download certificate');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
                    <p className="text-gray-400">View and download your earned certificates</p>
                </div>
                <div className="hidden md:block w-32 h-32 opacity-50">
                    <FloatingRocket />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-400">Loading certificates...</div>
            ) : certificates.length === 0 ? (
                <Card className="text-center py-16">
                    <CardContent>
                        <Award size={64} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Certificates Yet</h3>
                        <p className="text-gray-400 max-w-md mx-auto mb-8">
                            Complete courses or internships to earn professional certificates and badges.
                        </p>
                        <Button variant="primary" onClick={() => window.location.href = '/courses'}>
                            Explore Courses
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {certificates.map((cert) => (
                        <motion.div
                            key={cert.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="hover:border-purple-500/50 transition-colors">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-sm text-purple-400 mb-1">
                                                {cert.courseTitle ? 'Course Completion' : 'Internship Completion'}
                                            </div>
                                            <CardTitle className="text-xl mb-1">
                                                {cert.courseTitle || cert.internshipTitle}
                                            </CardTitle>
                                            <CardDescription>
                                                Issued to {cert.studentName}
                                            </CardDescription>
                                        </div>
                                        <Award size={32} className="text-yellow-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Search size={14} />
                                            <span className="font-mono">{cert.verificationCode}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleDownload(cert.id, cert.verificationCode)}
                                        >
                                            <Download size={16} className="mr-2" />
                                            Download PDF
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => window.open(`/verify-certificate/${cert.verificationCode}`, '_blank')}
                                        >
                                            <ExternalLink size={16} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
