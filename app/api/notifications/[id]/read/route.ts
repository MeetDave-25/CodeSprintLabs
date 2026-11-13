import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await sql`
            UPDATE notifications
            SET "isRead" = true
            WHERE id = ${params.id} AND "userId" = ${authUser.id}
        `;

        return NextResponse.json({ message: 'Notification marked as read' });
    } catch (error: any) {
        console.error('PUT /api/notifications/[id]/read error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}
