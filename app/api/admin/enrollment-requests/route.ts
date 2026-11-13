import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET /api/admin/enrollment-requests
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const internshipId = searchParams.get('internshipId');

        const rows = await sql`
            SELECT
                e.*,
                u.name as "studentName", u.email as "studentEmail", u.avatar as "studentAvatar",
                i.title as "internshipTitle"
            FROM enrollment_requests e
            LEFT JOIN users u ON u.id::text = e."userId"::text
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE 1=1
            ${status && status !== 'all' ? sql`AND e.status = ${status}` : sql``}
            ${internshipId ? sql`AND e."internshipId" = ${internshipId}` : sql``}
            ORDER BY e."createdAt" DESC
        `;

        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        console.error('GET /api/admin/enrollment-requests error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
