import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const counts = await sql`
            SELECT
                COUNT(*)::int as total,
                COUNT(CASE WHEN "internshipId" IS NOT NULL THEN 1 END)::int as internship,
                COUNT(CASE WHEN "courseId" IS NOT NULL THEN 1 END)::int as course
            FROM certificates
        `;

        const row = counts[0] || {};
        return NextResponse.json({
            status: 'success',
            data: {
                total: row.total || 0,
                internship: row.internship || 0,
                course: row.course || 0,
            },
        });
    } catch (error: any) {
        console.error('API /admin/certificates/stats GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch certificate stats: ' + error?.message },
            { status: 500 }
        );
    }
}

