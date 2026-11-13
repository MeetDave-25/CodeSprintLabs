import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const uid = String(authUser.id);

        const [taskStats, internshipStats, certStats, userRow] = await Promise.all([
            sql`SELECT COUNT(*) as count, COALESCE(SUM(points),0) as points
                FROM submissions WHERE "userId" = ${uid} AND status = 'approved'`,
            sql`SELECT COUNT(*) as count FROM enrollment_requests
                WHERE "userId" = ${uid} AND status = 'approved'`,
            sql`SELECT COUNT(*) as count FROM certificates WHERE "studentId" = ${uid}`,
            sql`SELECT "totalPoints", "tasksCompleted" FROM users WHERE id = ${authUser.id} LIMIT 1`,
        ]);

        return NextResponse.json({
            status: 'success',
            data: {
                tasksCompleted: Number(taskStats[0]?.count) || Number(userRow[0]?.tasksCompleted) || 0,
                totalPoints: Number(taskStats[0]?.points) || Number(userRow[0]?.totalPoints) || 0,
                activeInternships: Number(internshipStats[0]?.count) || 0,
                certificatesIssued: Number(certStats[0]?.count) || 0,
            },
        });
    } catch (error: any) {
        console.error('GET /api/student/profile/stats error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
