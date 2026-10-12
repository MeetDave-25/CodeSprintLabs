'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Story from '@/components/home/Story';
import HeroIntro from '@/components/home/HeroIntro';
import { ClosingCTA, Features, Founder, Platform, Stats, Ticker, Tracks, Verify } from '@/components/home/HomeSections';
import { publicService } from '@/lib/services';
import { Course } from '@/types';

interface PublicStats {
    totalStudents: number;
    activeInternships: number;
    totalInternships: number;
    certificatesIssued: number;
    totalCourses: number;
    successRate: number;
    domains: { name: string; count: number }[];
}

export default function HomePage() {
    const [stats, setStats] = useState<PublicStats | null>(null);
    const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, coursesRes] = await Promise.all([
                    publicService.getStats(),
                    publicService.getFeaturedCourses()
                ]);

                if (statsRes.data.status === 'success') {
                    setStats(statsRes.data.data);
                }
                if (coursesRes.data.status === 'success') {
                    setFeaturedCourses(coursesRes.data.data);
                }
            } catch (error) {
                console.error('Error fetching landing page data:', error);
            }
        };

        fetchData();
    }, []);

    // Only shown once real numbers have loaded — never placeholders.
    const displayStats = stats
        ? [
            { label: 'Students', value: (stats.totalStudents || 0).toLocaleString('en-IN') },
            { label: 'Open internships', value: (stats.activeInternships || 0).toLocaleString('en-IN') },
            { label: 'Certificates issued', value: (stats.certificatesIssued || 0).toLocaleString('en-IN') },
            { label: 'Completion rate', value: `${stats.successRate || 95}%` },
        ]
        : null;

    return (
        <div className="min-h-screen bg-cream text-ink-950">
            <Header variant="light" />
            <HeroIntro activeInternships={stats?.activeInternships} />
            <Ticker items={(stats?.domains ?? []).map((d) => d.name)} />
            <Stats stats={displayStats} />
            <Story />
            <Features />
            <Platform />
            <Tracks domains={stats?.domains ?? []} courses={featuredCourses} />
            <Verify />
            <Founder />
            <ClosingCTA />
            <Footer variant="light" />
        </div>
    );
}
