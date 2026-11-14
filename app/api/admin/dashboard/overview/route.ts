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

        const [studentsRes, internshipsRes, submissionsRes, certificatesRes, enrollmentsRes, revenueRes] = await Promise.all([
            sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM users WHERE role = 'student'`,
            sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE "isActive" = true) as active FROM internships`,
            sql`SELECT COUNT(*) as pending FROM submissions WHERE status = 'pending'`,
            sql`SELECT COUNT(*) as total FROM certificates`,
            sql`SELECT COUNT(*) as pending FROM enrollment_requests WHERE status = 'pending'`,
            sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status IN ('paid', 'completed')`,
        ]);

        return NextResponse.json({
            status: 'success',
            data: {
                totalStudents: Number(studentsRes[0]?.total) || 0,
                activeStudents: Number(studentsRes[0]?.active) || 0,
                totalInternships: Number(internshipsRes[0]?.total) || 0,
                activeInternships: Number(internshipsRes[0]?.active) || 0,
                pendingSubmissions: Number(submissionsRes[0]?.pending) || 0,
                totalCertificates: Number(certificatesRes[0]?.total) || 0,
                pendingEnrollments: Number(enrollmentsRes[0]?.pending) || 0,
                totalRevenue: Number(revenueRes[0]?.total) || 0,
                studentsGrowth: 0,
                submissionsGrowth: 0,
                revenueGrowth: 0,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

