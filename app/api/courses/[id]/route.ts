import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatCourse } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const rows = await sql`
            SELECT * FROM courses WHERE id = ${id} LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: 'success',
            data: formatCourse(rows[0]),
        });
    } catch (error: any) {
        console.error('API /courses/[id] GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch course: ' + error?.message },
            { status: 500 }
        );
    }
}

