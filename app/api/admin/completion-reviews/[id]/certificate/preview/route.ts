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

        try {
            const rows = await sql`
                SELECT c.*, u.name as "studentName", i.title as "internshipTitle"
                FROM certificates c
                LEFT JOIN users u ON u.id::text = c."userId"::text
                LEFT JOIN internships i ON i.id::text = c."internshipId"::text
                WHERE c."enrollmentId" = ${params.id}
                LIMIT 1
            `;

            return NextResponse.json({
                status: 'success',
                data: rows && rows.length > 0 ? rows[0] : null
            });
        } catch {
            return NextResponse.json({ status: 'success', data: null });
        }
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
