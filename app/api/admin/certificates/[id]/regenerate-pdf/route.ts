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
                WHERE c.id = ${params.id}
                LIMIT 1
            `;

            if (!rows || rows.length === 0) {
                return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
            }

            return NextResponse.json({
                status: 'success',
                message: 'PDF regeneration coming soon',
                data: rows[0]
            });
        } catch {
            return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
