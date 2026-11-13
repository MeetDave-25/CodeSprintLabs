import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { internshipId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT e.*, u.name as "studentName", u.email as "studentEmail", u.avatar as "studentAvatar"
            FROM enrollment_requests e
            LEFT JOIN users u ON u.id::text = e."userId"::text
            WHERE e."internshipId"::text = ${params.internshipId}
              AND e.status IN ('approved', 'active', 'completion_requested', 'completed')
            ORDER BY e."createdAt" DESC
        `;

        return NextResponse.json({ status: 'success', data: rows || [] });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
