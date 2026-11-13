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

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const offset = (page - 1) * limit;

        const notifications = await sql`
            SELECT id, title, message, type, "isRead", "createdAt"
            FROM notifications
            WHERE "userId" = ${authUser.id}
            ORDER BY "createdAt" DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const countResult = await sql`
            SELECT COUNT(*) as total FROM notifications WHERE "userId" = ${authUser.id}
        `;

        return NextResponse.json({
            notifications,
            total: Number(countResult[0]?.total) || 0,
        });
    } catch (error: any) {
        console.error('GET /api/notifications error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}

