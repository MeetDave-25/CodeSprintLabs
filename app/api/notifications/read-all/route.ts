import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await sql`
            UPDATE notifications
            SET "read" = true
            WHERE "userId" = ${authUser.id} AND "read" = false
        `;

        return NextResponse.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        console.error('PUT /api/notifications/read-all error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}

