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

        // Ensure optional columns exist
        await sql`ALTER TABLE enrollment_requests ADD COLUMN IF NOT EXISTS "approvedBy" TEXT`.catch(() => {});
        await sql`ALTER TABLE enrollment_requests ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMPTZ`.catch(() => {});
        await sql`ALTER TABLE enrollment_requests ADD COLUMN IF NOT EXISTS "adminNote" TEXT`.catch(() => {});
        await sql`ALTER TABLE enrollment_requests ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMPTZ`.catch(() => {});
        await sql`ALTER TABLE enrollment_requests ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMPTZ`.catch(() => {});
        await sql`ALTER TABLE enrollment_requests ADD COLUMN IF NOT EXISTS "mouGenerated" BOOLEAN DEFAULT false`.catch(() => {});
        await sql`ALTER TABLE enrollment_requests ADD COLUMN IF NOT EXISTS "offerLetterGenerated" BOOLEAN DEFAULT false`.catch(() => {});

        const rows = await sql`
            SELECT e.*, i.duration as "internshipDuration"
            FROM enrollment_requests e
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e.id = ${params.id} LIMIT 1
        `;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Enrollment request not found' }, { status: 404 });
        }

        const enrollment = rows[0];
        if (enrollment.status !== 'pending') {
            return NextResponse.json({ message: `This request has already been ${enrollment.status}` }, { status: 400 });
        }

        const body = await request.json().catch(() => ({}));
        const note = body.note || '';

        // Calculate start and end dates from internship duration
        const startDate = new Date();
        const durationText = String(enrollment.internshipDuration || enrollment.duration || '4 weeks');
        const durationMatch = durationText.match(/\d+/);
        const durationCount = durationMatch ? parseInt(durationMatch[0]) : 4;
        const endDate = new Date(startDate);
        if (/month/i.test(durationText)) {
            endDate.setMonth(endDate.getMonth() + durationCount);
        } else if (/day/i.test(durationText)) {
            endDate.setDate(endDate.getDate() + durationCount);
        } else {
            endDate.setDate(endDate.getDate() + durationCount * 7);
        }

        const updated = await sql`
            UPDATE enrollment_requests SET
                status = 'approved',
                "approvedBy" = ${String(authUser.id)},
                "approvedAt" = NOW(),
                "adminNote" = ${note},
                "startDate" = ${startDate.toISOString()},
                "endDate" = ${endDate.toISOString()},
                "mouGenerated" = true,
                "offerLetterGenerated" = true,
                updated_at = NOW()
            WHERE id = ${params.id}
            RETURNING *
        `;

        // Send notification to student
        await sql`
            INSERT INTO notifications ("userId", title, message, type, "read", "createdAt")
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

