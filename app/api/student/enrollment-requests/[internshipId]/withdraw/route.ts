import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { ensureLifecycleSchema, withdrawalState } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

// This path segment is shared with the enroll route, where it is an internship id; here it is the enrollment id.
export async function POST(request: NextRequest, { params }: { params: { internshipId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const reason = String(body.reason || '').trim();
        if (!reason) {
            return NextResponse.json({ message: 'Please provide a reason for withdrawal' }, { status: 422 });
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
        const e = rows[0];
        if (e.status !== 'approved' && e.status !== 'completion_requested') {
            return NextResponse.json({ message: 'Only an active internship can be withdrawn from' }, { status: 422 });
        }
        if (e.withdrawalStatus === 'pending') {
            return NextResponse.json({ message: 'A withdrawal request is already pending' }, { status: 409 });
        }

        const updated = await sql`
            UPDATE enrollment_requests SET
                "withdrawalRequested" = true,
                "withdrawalStatus" = 'pending',
                "withdrawalReason" = ${reason},
                "withdrawalRequestedAt" = NOW(),
                "withdrawalAdminNote" = NULL,
                updated_at = NOW()
            WHERE id::text = ${String(params.internshipId)}
            RETURNING *
        `;

        return NextResponse.json({ status: 'success', data: withdrawalState(updated[0]) });
    } catch (error: any) {
        console.error('POST /api/student/enrollment-requests/[id]/withdraw error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
