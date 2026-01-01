'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Award, Calendar, User, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';

interface CertificateDetails {
    isValid: boolean;
    studentName: string;
    programTitle: string;
    issueDate: string;
    verificationCode: string;
}

export default function VerifyCertificatePage() {
    const params = useParams();
    const code = params.code as string;

    const [details, setDetails] = useState<CertificateDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (code) {
            verifyCertificate();
        }
    }, [code]);

    const verifyCertificate = async () => {
        try {
            const res = await api.get(`/certificates/verify/${code}`);
            if (res.data.status === 'success') {
                setDetails(res.data.data);
            }
        } catch (err: any) {
            setError('Certificate not found or invalid.');
            setDetails(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center p-4 pt-20">
                <div className="w-full max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-3xl font-bold mb-4">Certificate Verification</h1>
                        <p className="text-gray-400">Verifying Certificate ID: <span className="font-mono text-white">{code}</span></p>
                    </motion.div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                            <p className="mt-4 text-gray-400">Verifying...</p>
                        </div>
                    ) : error ? (
                        <Card className="border-red-500/50 bg-red-500/5">
                            <CardContent className="flex flex-col items-center py-12">
                                <XCircle size={64} className="text-red-500 mb-4" />
                                <h2 className="text-2xl font-bold text-red-500 mb-2">Invalid Certificate</h2>
                                <p className="text-gray-400 text-center">
                                    The certificate with ID <strong>{code}</strong> could not be found in our records.
                                </p>
                            </CardContent>
                        </Card>
                    ) : details && (
                        <Card className="border-green-500/50 bg-green-500/5">
                            <CardContent className="p-8">
                                <div className="flex flex-col items-center text-center mb-8">
                                    <CheckCircle size={64} className="text-green-500 mb-4" />
                                    <h2 className="text-2xl font-bold text-green-500 mb-2">Valid Certificate</h2>
                                    <p className="text-gray-400">This certificate is authentic and issued by CodeSprint Labs.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                                        <div className="p-3 bg-purple-500/20 rounded-full text-purple-400">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400">Issued To</div>
                                            <div className="font-bold text-lg">{details.studentName}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                                        <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400">Program</div>
                                            <div className="font-bold text-lg">{details.programTitle}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                                        <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400">Issue Date</div>
                                            <div className="font-bold text-lg">{new Date(details.issueDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="text-center mt-12">
                        <Button variant="ghost" onClick={() => window.location.href = '/'}>
                            Back to Home
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
