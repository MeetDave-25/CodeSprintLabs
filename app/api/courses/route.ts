import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatCourse } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const level = searchParams.get('level');

        let rows;
        if (level) {
            rows = await sql`
                SELECT * FROM courses
                WHERE "isActive" = true AND level = ${level}
                ORDER BY created_at DESC
            `;
        } else {
            rows = await sql`
                SELECT * FROM courses
                WHERE "isActive" = true
                ORDER BY created_at DESC
            `;
        }

        const data = (rows || []).map(formatCourse);

        return NextResponse.json({
            status: 'success',
            data,
        });
    } catch (error: any) {
        console.error('API /courses GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch courses: ' + error?.message },
            { status: 500 }
        );
    }
}

