import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(
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

        return NextResponse.json({ status: 'success', data: rows[0] });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

export async function PUT(
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

        const body = await request.json().catch(() => ({}));
        const { title, content, targetAudience, priority, isActive } = body;

        const wasInactive = !rows[0].isActive;

        const updated = await sql`
            UPDATE announcements SET
                title = COALESCE(${title ?? null}, title),
                content = COALESCE(${content ?? null}, content),
                "targetAudience" = COALESCE(${targetAudience ?? null}, "targetAudience"),
                priority = COALESCE(${priority ?? null}, priority),
                "isActive" = COALESCE(${isActive ?? null}, "isActive"),
                "updatedAt" = NOW()
            WHERE id = ${params.id}
            RETURNING *
        `;

        const announcement = updated[0];

        // If just published, send notifications
        if (wasInactive && announcement.isActive) {
            const users = await sql`SELECT id FROM users WHERE status = 'active'`;
            for (const user of users) {
                await sql`
                    INSERT INTO notifications ("userId", title, message, type, "isRead", "createdAt")
                    VALUES (${user.id}, ${announcement.title}, ${announcement.content.substring(0, 100) + '...'}, 'announcement', false, NOW())
                `.catch(() => {});
            }
        }

        return NextResponse.json({ status: 'success', message: 'Announcement updated successfully', data: announcement });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await sql`DELETE FROM announcements WHERE id = ${params.id}`;

        return NextResponse.json({ status: 'success', message: 'Announcement deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

