import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const enrollment = await sql`
            SELECT * FROM enrollment_requests
            WHERE id = ${params.id} AND "userId" = ${authUser.id} LIMIT 1
        `;
        if (!enrollment || enrollment.length === 0) {
            return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
        }

        const internshipId = String(enrollment[0].internshipId);
        const uid = String(authUser.id);

        // Find the next active task not yet approved for this student
        const tasks = await sql`
            SELECT t.* FROM tasks t
            WHERE t."internshipId" = ${internshipId}
              AND t."isActive" = true
              AND t.id::text NOT IN (
                  SELECT s."taskId"::text FROM submissions s
                  WHERE s."userId" = ${uid} AND s.status = 'approved'
              )
            ORDER BY t."order" ASC NULLS LAST, t.created_at ASC
            LIMIT 1
        `;

        return NextResponse.json({
            status: 'success',
            data: tasks.length > 0 ? tasks[0] : null,
        });
    } catch (error: any) {
        console.error('GET /api/student/my-internships/[id]/current-task error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
