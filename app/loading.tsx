import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div className="min-h-screen">
            {/* Header Skeleton */}
            <div className="fixed top-0 left-0 right-0 z-50 glass-dark backdrop-blur-lg">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-40" />
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section Skeleton */}
            <div className="relative min-h-screen flex items-center justify-center pt-20">
                <div className="container mx-auto px-4 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content Skeleton */}
                        <div>
                            <Skeleton className="h-10 w-64 mb-6" />
                            <Skeleton className="h-16 w-full mb-4" />
                            <Skeleton className="h-16 w-3/4 mb-8" />
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-6 w-5/6 mb-8" />

                            <div className="flex gap-4 mb-12">
                                <Skeleton className="h-12 w-40" />
                                <Skeleton className="h-12 w-40" />
                            </div>

                            {/* Stats Skeleton */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i}>
                                        <Skeleton className="h-8 w-20 mb-2" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Content Skeleton */}
                        <div className="hidden lg:block">
                            <Skeleton className="h-[500px] w-full rounded-3xl" />
                        </div>
                    </div>
                </div>

                {/* Loading Spinner */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                    <div className="spinner"></div>
                </div>
            </div>
        </div>
    );
}
