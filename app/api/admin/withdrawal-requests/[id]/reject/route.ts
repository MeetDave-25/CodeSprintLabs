import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { ensureLifecycleSchema } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await ensureLifecycleSchema();
        const rows = await sql`SELECT * FROM enrollment_requests WHERE id::text = ${String(params.id)} LIMIT 1`;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Enrollment request not found' }, { status: 404 });
        }

        const enrollment = rows[0];
        if (!enrollment.withdrawalRequested || enrollment.withdrawalStatus !== 'pending') {
            return NextResponse.json({ message: 'No pending withdrawal request for this enrollment' }, { status: 400 });
        }

        const body = await request.json().catch(() => ({}));
        const note = body.note || 'Your withdrawal request was not approved.';

        const updated = await sql`
            UPDATE enrollment_requests SET
                "withdrawalStatus" = 'rejected',
                "withdrawalAdminNote" = ${note},
                updated_at = NOW()
            WHERE id::text = ${String(params.id)}
            RETURNING *
        `;

        await sql`
            INSERT INTO notifications ("userId", title, message, type, "read", "createdAt")
            VALUES (${String(enrollment.userId)}, 'Withdrawal Request Update', ${note}, 'enrollment', false, NOW())
        `.catch(() => {});

        return NextResponse.json({ status: 'success', message: 'Withdrawal request rejected.', data: updated[0] });
    } catch (error: any) {
        console.error('POST /api/admin/withdrawal-requests/[id]/reject error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
