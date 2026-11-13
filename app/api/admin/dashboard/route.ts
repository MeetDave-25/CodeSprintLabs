import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const [
            studentsResult,
            internshipsResult,
            tasksResult,
            submissionsResult,
            certificatesResult,
            coursesResult,
            pendingEnrollmentsResult,
            pendingSubmissionsResult,
        ] = await Promise.all([
            sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM users WHERE role = 'student'`,
            sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE "isActive" = true) as active FROM internships`,
            sql`SELECT COUNT(*) as total FROM tasks`,
            sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'pending') as pending FROM submissions`,
            sql`SELECT COUNT(*) as total FROM certificates`,
            sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE "isActive" = true) as active FROM courses`,
            sql`SELECT COUNT(*) as count FROM enrollment_requests WHERE status = 'pending'`,
            sql`SELECT COUNT(*) as count FROM submissions WHERE status = 'pending'`,
        ]);

        return NextResponse.json({
            stats: {
                students: {
                    total: Number(studentsResult[0]?.total) || 0,
                    active: Number(studentsResult[0]?.active) || 0,
                },
                internships: {
                    total: Number(internshipsResult[0]?.total) || 0,
                    active: Number(internshipsResult[0]?.active) || 0,
                },
                tasks: {
                    total: Number(tasksResult[0]?.total) || 0,
                },
                submissions: {
                    total: Number(submissionsResult[0]?.total) || 0,
                    pending: Number(submissionsResult[0]?.pending) || 0,
                },
                certificates: {
                    total: Number(certificatesResult[0]?.total) || 0,
                },
                courses: {
                    total: Number(coursesResult[0]?.total) || 0,
                    active: Number(coursesResult[0]?.active) || 0,
                },
                pendingEnrollments: Number(pendingEnrollmentsResult[0]?.count) || 0,
                pendingSubmissions: Number(pendingSubmissionsResult[0]?.count) || 0,
            },
        });
    } catch (error: any) {
        console.error('GET /api/admin/dashboard error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}

