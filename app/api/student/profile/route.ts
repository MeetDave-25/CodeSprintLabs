import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { hashPassword } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const users = await sql`
            SELECT
                id, name, email, role, avatar, status,
                "totalPoints", "tasksCompleted", "coursesCompleted",
                "createdAt", "updatedAt"
            FROM users
            WHERE id = ${authUser.id}
            LIMIT 1
        `;

        if (!users || users.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const user = users[0];
        return NextResponse.json({
            user: {
                id: String(user.id),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                status: user.status,
                totalPoints: Number(user.totalPoints) || 0,
                tasksCompleted: Number(user.tasksCompleted) || 0,
                coursesCompleted: Number(user.coursesCompleted) || 0,
                createdAt: user.createdAt,
            },
        });
    } catch (error: any) {
        console.error('GET /api/student/profile error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { name, avatar, currentPassword, newPassword } = body;

        // If changing password, verify current password first
        if (newPassword) {
            const users = await sql`
                SELECT password FROM users WHERE id = ${authUser.id} LIMIT 1
            `;
            if (!users || users.length === 0) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }
            const { comparePasswords } = await import('@/lib/auth-server');
            const matches = await comparePasswords(currentPassword || '', users[0].password);
            if (!matches) {
                return NextResponse.json({ message: 'Current password is incorrect' }, { status: 422 });
            }
        }

        const updates: any = {};
        if (name) updates.name = name;
        if (avatar) updates.avatar = avatar;
        if (newPassword) updates.password = await hashPassword(newPassword);

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ message: 'No fields to update' }, { status: 422 });
        }

        const updated = await sql`
            UPDATE users SET
                name = COALESCE(${updates.name || null}, name),
                avatar = COALESCE(${updates.avatar || null}, avatar),
                password = COALESCE(${updates.password || null}, password),
                "updatedAt" = NOW()
            WHERE id = ${authUser.id}
            RETURNING id, name, email, role, avatar, status, "totalPoints"
        `;

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: updated[0],
        });
    } catch (error: any) {
        console.error('PUT /api/student/profile error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}

