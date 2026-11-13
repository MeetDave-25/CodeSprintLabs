import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { comparePasswords, hashPassword } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET /api/admin/settings/profile
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT id, name, email, avatar, role, "createdAt"
            FROM users WHERE id = ${authUser.id} LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ status: 'success', data: rows[0] });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

// PUT /api/admin/settings/profile
export async function PUT(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { name, phone } = body;

        const updated = await sql`
            UPDATE users SET
                name = COALESCE(${name ?? null}, name),
                "updatedAt" = NOW()
            WHERE id = ${authUser.id}
            RETURNING id, name, email, avatar, role
        `;

        return NextResponse.json({ status: 'success', message: 'Profile updated successfully', data: updated[0] });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
