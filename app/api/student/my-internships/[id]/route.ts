import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT
                e.id as "enrollmentId", e.status as "enrollmentStatus",
                e."startDate", e."endDate", e."approvedAt",
                i.id, i.title, i.description, i."companyName", i.type,
                i.location, i.stipend, i.duration, i.tags
            FROM enrollment_requests e
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e."userId" = ${authUser.id} AND e.status = 'approved' AND i.id = ${params.id}
            LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Internship not found or not enrolled' }, { status: 404 });
        }

        const internship = rows[0];

        // Get tasks for this internship
        const tasks = await sql`
            SELECT t.*,
                s.id as "submissionId", s.status as "submissionStatus", s."submittedAt"
            FROM tasks t
            LEFT JOIN submissions s ON s."taskId" = t.id::text AND s."userId" = ${authUser.id}
            WHERE t."internshipId" = ${params.id}::text AND t."isActive" = true
            ORDER BY t."order" ASC
        `;

        return NextResponse.json({
            status: 'success',
            data: { ...internship, tasks },
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

