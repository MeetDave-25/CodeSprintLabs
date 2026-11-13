import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        try {
            const rows = await sql`
                SELECT
                    ce.id as "enrollmentId", ce.status as "enrollmentStatus",
                    ce.progress, ce."enrolledAt",
                    c.id, c.title, c.description, c.instructor, c.price,
                    c.duration, c.level, c.thumbnail, c.created_at
                FROM course_enrollments ce
                LEFT JOIN courses c ON c.id::text = ce."courseId"::text
                WHERE ce."userId" = ${authUser.id}
                ORDER BY ce."enrolledAt" DESC
            `;
            return NextResponse.json({ status: 'success', data: rows });
        } catch {
            // course_enrollments table may not exist yet
            return NextResponse.json({ status: 'success', data: [] });
        }
    } catch (error: any) {
        console.error('GET /api/student/my-courses error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
