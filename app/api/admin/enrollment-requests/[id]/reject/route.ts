import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

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

        const rows = await sql`SELECT * FROM enrollment_requests WHERE id = ${params.id} LIMIT 1`;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Enrollment request not found' }, { status: 404 });
        }

        const enrollment = rows[0];
        if (enrollment.status !== 'pending') {
            return NextResponse.json({ message: `This request has already been ${enrollment.status}` }, { status: 400 });
        }

        const body = await request.json().catch(() => ({}));
        const note = body.note || 'Your request was not approved at this time.';

        const updated = await sql`
            UPDATE enrollment_requests SET
                status = 'rejected',
                "rejectedAt" = NOW(),
                "adminNote" = ${note},
                "updatedAt" = NOW()
            WHERE id = ${params.id}
            RETURNING *
        `;

        // Notify student
        await sql`
            INSERT INTO notifications ("userId", title, message, type, "isRead", "createdAt")
            VALUES (${enrollment.userId}, 'Enrollment Request Update', ${note}, 'enrollment', false, NOW())
        `.catch(() => {});

        return NextResponse.json({ status: 'success', message: 'Enrollment request rejected.', data: updated[0] });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

