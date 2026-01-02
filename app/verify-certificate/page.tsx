'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { publicService } from '@/lib/services';

interface CertificateResult {
    valid: boolean;
    code?: string;
    studentName?: string;
    courseName?: string;
    internshipName?: string;
    programName?: string;
    issueDate?: string;
    issuedAt?: string;
    type?: string;
    message?: string;
}

export default function VerifyCertificatePage() {
    const [certificateCode, setCertificateCode] = useState('');
    const [verificationResult, setVerificationResult] = useState<CertificateResult | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        if (!certificateCode.trim()) {
            setError('Please enter a certificate code');
            return;
        }

        setIsVerifying(true);
        setError('');
        setVerificationResult(null);

        try {
            const response = await publicService.verifyCertificate(certificateCode.trim());
            const data = response.data;

            if (data.valid || data.certificate) {
                const cert = data.certificate || data;
                setVerificationResult({
                    valid: true,
                    code: cert.code || cert.certificateCode || certificateCode,
                    studentName: cert.studentName || cert.student?.name || 'N/A',
                    courseName: cert.courseName || cert.course?.title,
                    internshipName: cert.internshipName || cert.internship?.title,
                    programName: cert.programName || cert.courseName || cert.internshipName || 'N/A',
                    issueDate: cert.issueDate || cert.issuedAt || cert.created_at,
                    type: cert.type || 'completion',
                });
            } else {
                setVerificationResult({
                    valid: false,
                    message: data.message || 'Certificate not found or invalid'
                });
            }
        } catch (err: any) {
            if (err.response?.status === 404) {
                setVerificationResult({
                    valid: false,
                    message: 'Certificate not found. Please check the code and try again.'
                });
            } else {
                setError(err.response?.data?.message || 'Failed to verify certificate. Please try again.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleVerify();
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <Shield size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Verify <span className="gradient-text">Certificate</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Enter the certificate code to verify its authenticity
                    </p>
                </motion.div>

                {/* Verification Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Certificate Verification</CardTitle>
                            <CardDescription>
                                Enter the unique certificate code found on the certificate
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <Input
                                            label="Certificate Code"
                                            placeholder="e.g., CERT-2025-FS-001"
                                            value={certificateCode}
                                            onChange={(e) => setCertificateCode(e.target.value.toUpperCase())}
                                            onKeyPress={handleKeyPress}
                                            icon={<Search size={18} />}
                                        />
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={handleVerify}
                                    isLoading={isVerifying}
                                    disabled={!certificateCode.trim()}
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 size={18} className="mr-2 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <Shield size={18} className="mr-2" />
                                            Verify Certificate
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Verification Result */}
                {verificationResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8"
                    >
                        {verificationResult.valid ? (
                            <Card className="border-green-500/50 bg-green-500/10">
                                <CardContent className="p-8">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <CheckCircle size={32} className="text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-green-400 mb-2">
                                            Certificate Verified ✓
                                        </h2>
                                        <p className="text-gray-400">
                                            This certificate is authentic and valid
                                        </p>
                                    </div>

                                    <div className="space-y-4 bg-black/30 rounded-lg p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Certificate Code</div>
                                                <div className="font-mono font-bold">{verificationResult.code}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Issue Date</div>
                                                <div className="font-semibold">
                                                    {formatDate(verificationResult.issueDate)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-4">
                                            <div className="text-sm text-gray-400 mb-1">Student Name</div>
                                            <div className="text-xl font-bold">{verificationResult.studentName}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">
                                                {verificationResult.type === 'internship' ? 'Internship' : 'Course'} Name
                                            </div>
                                            <div className="font-semibold text-lg">
                                                {verificationResult.courseName || verificationResult.internshipName || verificationResult.programName}
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-4">
                                            <div className="text-sm text-gray-400 mb-1">Issued By</div>
                                            <div className="font-semibold">CodeSprint Labs</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-red-500/50 bg-red-500/10">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                                        <XCircle size={32} className="text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-red-400 mb-2">
                                        Certificate Not Found
                                    </h2>
                                    <p className="text-gray-400 mb-6">
                                        {verificationResult.message}
                                    </p>
                                    <div className="bg-black/30 rounded-lg p-4 text-sm text-gray-400">
                                        <p>Please check:</p>
                                        <ul className="list-disc list-inside mt-2 text-left">
                                            <li>The certificate code is entered correctly</li>
                                            <li>The certificate was issued by CodeSprint Labs</li>
                                            <li>The certificate has not been revoked</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}

                {/* Help Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>How to Find Your Certificate Code</CardTitle>
                            <CardDescription>The certificate code can be found on your certificate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-gray-400">
                                <p>1. Look at the top-right corner of your certificate</p>
                                <p>2. The code starts with "CERT-" followed by year and unique identifier</p>
                                <p>3. Example: CERT-2025-FS-001 or CERT-2025-INT-A1B2C3</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
