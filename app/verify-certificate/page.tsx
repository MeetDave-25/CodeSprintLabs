'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Mock certificate database
const certificates = {
    'CERT-2024-FS-001': {
        code: 'CERT-2024-FS-001',
        studentName: 'John Doe',
        courseName: 'Full Stack Web Development',
        issueDate: '2024-12-05',
        valid: true
    },
    'CERT-2024-PY-002': {
        code: 'CERT-2024-PY-002',
        studentName: 'Jane Smith',
        courseName: 'Python for Data Science',
        issueDate: '2024-11-20',
        valid: true
    },
};

export default function VerifyCertificatePage() {
    const [certificateCode, setCertificateCode] = useState('');
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = () => {
        setIsVerifying(true);

        // Simulate API call
        setTimeout(() => {
            const cert = certificates[certificateCode as keyof typeof certificates];

            if (cert) {
                setVerificationResult({
                    ...cert
                });
            } else {
                setVerificationResult({
                    valid: false,
                    message: 'Certificate not found or invalid'
                });
            }

            setIsVerifying(false);
        }, 1000);
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
                                <div className="flex gap-3">
                                    <Input
                                        label="Certificate Code"
                                        placeholder="e.g., CERT-2024-FS-001"
                                        value={certificateCode}
                                        onChange={(e) => setCertificateCode(e.target.value.toUpperCase())}
                                        icon={<Search size={18} />}
                                    />
                                </div>

                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={handleVerify}
                                    isLoading={isVerifying}
                                    disabled={!certificateCode}
                                >
                                    <Shield size={18} className="mr-2" />
                                    Verify Certificate
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
                                                    {new Date(verificationResult.issueDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-4">
                                            <div className="text-sm text-gray-400 mb-1">Student Name</div>
                                            <div className="text-xl font-bold">{verificationResult.studentName}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Course Name</div>
                                            <div className="font-semibold text-lg">{verificationResult.courseName}</div>
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

                {/* Example Codes */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Try These Example Codes</CardTitle>
                            <CardDescription>Click to auto-fill and verify</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-3">
                                {Object.keys(certificates).map((code) => (
                                    <button
                                        key={code}
                                        onClick={() => {
                                            setCertificateCode(code);
                                            setVerificationResult(null);
                                        }}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-all border border-white/10 hover:border-purple-500/50"
                                    >
                                        <div className="font-mono text-sm text-purple-400">{code}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {certificates[code as keyof typeof certificates].courseName}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
