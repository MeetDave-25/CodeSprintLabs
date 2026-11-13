import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatSubmission } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const studentId = searchParams.get('studentId');

        let rows;
        if (status && studentId) {
            rows = await sql`
                SELECT * FROM submissions
                WHERE status = ${status} AND "studentId" = ${studentId}
                ORDER BY "submittedAt" DESC, created_at DESC
            `;
        } else if (status) {
            rows = await sql`
                SELECT * FROM submissions
                WHERE status = ${status}
                ORDER BY "submittedAt" DESC, created_at DESC
            `;
        } else if (studentId) {
            rows = await sql`
                SELECT * FROM submissions
                WHERE "studentId" = ${studentId}
                ORDER BY "submittedAt" DESC, created_at DESC
            `;
        } else {
            rows = await sql`
                SELECT * FROM submissions
                ORDER BY "submittedAt" DESC, created_at DESC
            `;
        }

        const submissions = (rows || []).map(formatSubmission);

        return NextResponse.json({
            submissions,
            data: submissions,
        });
    } catch (error: any) {
        console.error('API /admin/submissions GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch submissions: ' + error?.message },
            { status: 500 }
        );
    }
}

