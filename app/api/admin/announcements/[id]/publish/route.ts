import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`SELECT * FROM announcements WHERE id = ${params.id} LIMIT 1`;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
        }

        if (rows[0].isActive) {
            return NextResponse.json({ message: 'Announcement is already published' }, { status: 400 });
        }

        const updated = await sql`
            UPDATE announcements SET "isActive" = true, updated_at = NOW()
            WHERE id = ${params.id} RETURNING *
        `;

        const announcement = updated[0];
        const users = await sql`SELECT id FROM users WHERE status = 'active'`;
        for (const user of users) {
            await sql`
                INSERT INTO notifications ("userId", title, message, type, "read", "createdAt")
                VALUES (${user.id}, ${announcement.title}, ${announcement.content.substring(0, 100) + '...'}, 'announcement', false, NOW())
            `.catch(() => {});
        }

        return NextResponse.json({ status: 'success', message: 'Announcement published successfully', data: announcement });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

