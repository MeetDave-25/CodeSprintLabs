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
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        try {
            const rows = await sql`
                SELECT al.*, u.name as "userName", u.email as "userEmail"
                FROM activity_logs al
                LEFT JOIN users u ON u.id::text = al."userId"::text
                ORDER BY al."createdAt" DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            return NextResponse.json({ status: 'success', data: rows || [] });
        } catch {
            return NextResponse.json({ status: 'success', data: [] });
        }
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
