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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let rows;
        if (status && status !== 'all') {
            rows = await sql`
                SELECT e.*, u.name as "studentName", u.email as "studentEmail", u.avatar as "studentAvatar",
                       i.title as "internshipTitle"
                FROM enrollment_requests e
                LEFT JOIN users u ON u.id::text = e."userId"::text
                LEFT JOIN internships i ON i.id::text = e."internshipId"::text
                WHERE e.status = ${status}
                ORDER BY e."updatedAt" DESC NULLS LAST, e."createdAt" DESC
            `;
        } else {
            rows = await sql`
                SELECT e.*, u.name as "studentName", u.email as "studentEmail", u.avatar as "studentAvatar",
                       i.title as "internshipTitle"
                FROM enrollment_requests e
                LEFT JOIN users u ON u.id::text = e."userId"::text
                LEFT JOIN internships i ON i.id::text = e."internshipId"::text
                WHERE e.status IN ('completion_requested', 'completed')
                ORDER BY e."updatedAt" DESC NULLS LAST, e."createdAt" DESC
            `;
        }

        return NextResponse.json({ status: 'success', data: rows || [] });
    } catch (error: any) {
        console.error('GET /api/admin/completion-reviews error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
