import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const result = await sql`
            SELECT COUNT(*) as count
            FROM notifications
            WHERE "userId" = ${authUser.id} AND "read" = false
        `;

        return NextResponse.json({
            count: Number(result[0]?.count) || 0,
        });
    } catch (error: any) {
        console.error('GET /api/notifications/unread-count error:', error);
        return NextResponse.json({ count: 0 }, { status: 200 });
    }
}

