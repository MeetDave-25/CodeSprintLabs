import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const counts = await sql`
            SELECT
                COUNT(*)::int as total,
                COUNT(CASE WHEN "isActive" = true THEN 1 END)::int as active,
                COUNT(CASE WHEN "isActive" = false THEN 1 END)::int as inactive,
                COUNT(CASE WHEN source = 'internship' THEN 1 END)::int as internship,
                COUNT(CASE WHEN source = 'course' THEN 1 END)::int as course
            FROM tasks
        `;

        const row = counts[0] || {};
        return NextResponse.json({
            status: 'success',
            data: {
                total: row.total || 0,
                active: row.active || 0,
                inactive: row.inactive || 0,
                internship: row.internship || 0,
                course: row.course || 0,
            },
        });
    } catch (error: any) {
        console.error('API /admin/tasks/stats GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch task stats: ' + error?.message },
            { status: 500 }
        );
    }
}

