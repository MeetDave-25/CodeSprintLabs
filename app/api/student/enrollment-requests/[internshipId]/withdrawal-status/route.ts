import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { ensureLifecycleSchema, withdrawalState } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

// This path segment is shared with the enroll route, where it is an internship id; here it is the enrollment id.
export async function GET(request: NextRequest, { params }: { params: { internshipId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await ensureLifecycleSchema();
        const rows = await sql`
            SELECT * FROM enrollment_requests
            WHERE id::text = ${String(params.internshipId)} AND "userId"::text = ${String(authUser.id)}
            LIMIT 1
        `;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
        }

        return NextResponse.json({ status: 'success', data: withdrawalState(rows[0]) });
    } catch (error: any) {
        console.error('GET /api/student/enrollment-requests/[id]/withdrawal-status error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
