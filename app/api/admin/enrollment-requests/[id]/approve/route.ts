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
        const note = body.note || '';

        // Calculate start and end dates
        const startDate = new Date();
        const durationMatch = String(enrollment.duration || '4').match(/\d+/);
        const durationWeeks = durationMatch ? parseInt(durationMatch[0]) : 4;
        const endDate = new Date(startDate.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);

        const updated = await sql`
            UPDATE enrollment_requests SET
                status = 'approved',
                "approvedBy" = ${authUser.id},
                "approvedAt" = NOW(),
                "adminNote" = ${note},
                "startDate" = ${startDate.toISOString()},
                "endDate" = ${endDate.toISOString()},
                "mouGenerated" = true,
                "offerLetterGenerated" = true,
                "updatedAt" = NOW()
            WHERE id = ${params.id}
            RETURNING *
        `;

        // Send notification to student
        await sql`
            INSERT INTO notifications ("userId", title, message, type, "isRead", "createdAt")
            VALUES (
                ${enrollment.userId},
                'Enrollment Approved',
                'Your enrollment request has been approved. MOU and Offer Letter are now available.',
                'enrollment',
                false,
                NOW()
            )
        `.catch(() => {});

        return NextResponse.json({
            status: 'success',
            message: 'Enrollment approved successfully. MOU and Offer Letter are now available.',
            data: updated[0],
        });
    } catch (error: any) {
        console.error('POST /api/admin/enrollment-requests/[id]/approve error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

