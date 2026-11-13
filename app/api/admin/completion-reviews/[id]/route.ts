import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT e.*, u.name as "studentName", u.email as "studentEmail", u.avatar as "studentAvatar",
                   i.title as "internshipTitle", i.domain as "internshipDomain"
            FROM enrollment_requests e
            LEFT JOIN users u ON u.id::text = e."userId"::text
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e.id = ${params.id}
            LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
        }

        return NextResponse.json({ status: 'success', data: rows[0] });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
