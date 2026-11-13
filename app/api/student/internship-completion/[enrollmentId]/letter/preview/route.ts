import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { enrollmentId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT e.*, i.title as "internshipTitle", u.name as "studentName"
            FROM enrollment_requests e
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            LEFT JOIN users u ON u.id::text = e."userId"::text
            WHERE e.id = ${params.enrollmentId} AND e."userId" = ${authUser.id}
            LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
        }

        const enrollment = rows[0];
        if (enrollment.status !== 'completed') {
            return NextResponse.json({
                status: 'success',
                data: { available: false, message: 'Completion letter will be available after your review is approved' },
            });
        }

        return NextResponse.json({ status: 'success', data: { available: true, enrollment } });
    } catch (error: any) {
        console.error('GET letter preview error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
