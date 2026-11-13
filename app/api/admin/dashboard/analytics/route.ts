import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET /api/admin/dashboard/analytics
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const months = Math.min(12, Math.max(1, parseInt(searchParams.get('months') || '6')));

        const monthlyData = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const monthName = start.toLocaleString('en-US', { month: 'short' });

            const [studentsRes, submissionsRes] = await Promise.all([
                sql`SELECT COUNT(*) as count FROM users WHERE role = 'student' AND "createdAt" BETWEEN ${start.toISOString()} AND ${end.toISOString()}`,
                sql`SELECT COUNT(*) as count FROM submissions WHERE "createdAt" BETWEEN ${start.toISOString()} AND ${end.toISOString()}`,
            ]);

            monthlyData.push({
                month: monthName,
                students: Number(studentsRes[0]?.count) || 0,
                submissions: Number(submissionsRes[0]?.count) || 0,
                revenue: 0, // No payments table yet
            });
        }

        return NextResponse.json({ status: 'success', data: monthlyData });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

