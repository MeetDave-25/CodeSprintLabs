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
                SELECT p.*, u.name as "studentName", u.email as "studentEmail", c.title as "courseTitle"
                FROM payments p
                LEFT JOIN users u ON u.id::text = p."studentId"::text
                LEFT JOIN courses c ON c.id::text = p."courseId"::text
                WHERE p.id = ${params.id} LIMIT 1
            `;
            if (!rows || rows.length === 0) {
                return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
            }
            return NextResponse.json({ status: 'success', data: rows[0] });
        } catch {
            return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
