import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { formatCourse } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`SELECT * FROM courses WHERE id = ${params.id} LIMIT 1`;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json({ status: 'success', data: formatCourse(rows[0]) });
    } catch (error: any) {
        console.error('GET /api/student/my-courses/[id] error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
