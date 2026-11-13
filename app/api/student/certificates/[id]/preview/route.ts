import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { formatCertificate } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT c.*, u.name as "studentName", i.title as "internshipTitle", co.title as "courseTitle"
            FROM certificates c
            LEFT JOIN users u ON u.id::text = c."studentId"::text
            LEFT JOIN internships i ON i.id::text = c."internshipId"::text
            LEFT JOIN courses co ON co.id::text = c."courseId"::text
            WHERE c.id = ${params.id} AND c."studentId" = ${String(authUser.id)}
            LIMIT 1
        `;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
        }

        return NextResponse.json({ status: 'success', data: formatCertificate(rows[0]) });
    } catch (error: any) {
        console.error('GET /api/student/certificates/[id]/preview error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
