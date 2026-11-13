import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        try {
            let rows;
            if (status && status !== 'all') {
                rows = await sql`
                    SELECT p.*, u.name as "studentName", u.email as "studentEmail", c.title as "courseTitle"
                    FROM payments p
                    LEFT JOIN users u ON u.id::text = p."userId"::text
                    LEFT JOIN courses c ON c.id::text = p."courseId"::text
                    WHERE p.status = ${status}
                    ORDER BY p.created_at DESC
                `;
            } else {
                rows = await sql`
                    SELECT p.*, u.name as "studentName", u.email as "studentEmail", c.title as "courseTitle"
                    FROM payments p
                    LEFT JOIN users u ON u.id::text = p."userId"::text
                    LEFT JOIN courses c ON c.id::text = p."courseId"::text
                    ORDER BY p.created_at DESC
                `;
            }
            return NextResponse.json({ status: 'success', data: rows });
        } catch {
            return NextResponse.json({ status: 'success', data: [] });
        }
    } catch (error: any) {
        console.error('GET /api/admin/payments error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
