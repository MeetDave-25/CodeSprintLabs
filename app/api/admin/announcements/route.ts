import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET /api/admin/announcements
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const audience = searchParams.get('audience');
        const priority = searchParams.get('priority');

        let announcements = await sql`
            SELECT id, title, content, "targetAudience", priority, "isActive", "createdBy", "createdAt", "updatedAt"
            FROM announcements
            WHERE 1=1
            ${status === 'published' ? sql`AND "isActive" = true` : status === 'draft' ? sql`AND "isActive" = false` : sql``}
            ${audience ? sql`AND "targetAudience" = ${audience}` : sql``}
            ${priority ? sql`AND priority = ${priority}` : sql``}
            ORDER BY "createdAt" DESC
        `;

        return NextResponse.json({ status: 'success', data: announcements });
    } catch (error: any) {
        console.error('GET /api/admin/announcements error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

// POST /api/admin/announcements
export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { title, content, targetAudience, priority, isActive } = body;

        if (!title || !content || !targetAudience || !priority) {
            return NextResponse.json({ message: 'title, content, targetAudience and priority are required' }, { status: 422 });
        }

        if (!['all', 'students', 'admins'].includes(targetAudience)) {
            return NextResponse.json({ message: 'targetAudience must be all, students or admins' }, { status: 422 });
        }

        if (!['low', 'medium', 'high'].includes(priority)) {
            return NextResponse.json({ message: 'priority must be low, medium or high' }, { status: 422 });
        }

        const publish = isActive === true;

        const result = await sql`
            INSERT INTO announcements (title, content, "targetAudience", priority, "isActive", "createdBy", "createdAt", "updatedAt")
            VALUES (${title}, ${content}, ${targetAudience}, ${priority}, ${publish}, ${authUser.id}, NOW(), NOW())
            RETURNING *
        `;

        const announcement = result[0];

        // If published, send notifications to target users
        if (publish) {
            await sendAnnouncementNotifications(announcement);
        }

        return NextResponse.json(
            { status: 'success', message: 'Announcement created successfully', data: announcement },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('POST /api/admin/announcements error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

async function sendAnnouncementNotifications(announcement: any) {
    try {
        let users;
        if (announcement.targetAudience === 'students') {
            users = await sql`SELECT id FROM users WHERE role = 'student' AND status = 'active'`;
        } else if (announcement.targetAudience === 'admins') {
            users = await sql`SELECT id FROM users WHERE role = 'admin'`;
        } else {
            users = await sql`SELECT id FROM users WHERE status = 'active'`;
        }

        for (const user of users) {
            await sql`
                INSERT INTO notifications ("userId", title, message, type, "isRead", "createdAt")
                VALUES (${user.id}, ${announcement.title}, ${announcement.content.substring(0, 100) + '...'}, 'announcement', false, NOW())
            `.catch(() => {}); // Ignore individual notification errors
        }
    } catch (err) {
        console.error('sendAnnouncementNotifications error:', err);
    }
}
