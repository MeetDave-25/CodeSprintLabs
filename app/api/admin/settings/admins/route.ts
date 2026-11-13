import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET /api/admin/settings/admins
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const admins = await sql`
            SELECT id, name, email, avatar, status, "createdAt"
            FROM users WHERE role = 'admin'
            ORDER BY "createdAt" ASC
        `;

        return NextResponse.json({ status: 'success', data: admins });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

// POST /api/admin/settings/admins - create new admin
export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'name, email and password are required' }, { status: 422 });
        }

        // Check email not already taken
        const existing = await sql`SELECT id FROM users WHERE LOWER(email) = ${email.toLowerCase()} LIMIT 1`;
        if (existing && existing.length > 0) {
            return NextResponse.json({ message: 'Email is already taken' }, { status: 422 });
        }

        const { hashPassword } = await import('@/lib/auth-server');
        const hashed = await hashPassword(password);

        const result = await sql`
            INSERT INTO users (name, email, password, role, status, "createdAt", "updatedAt")
            VALUES (${name}, ${email.toLowerCase()}, ${hashed}, 'admin', 'active', NOW(), NOW())
            RETURNING id, name, email, role, status
        `;

        return NextResponse.json(
            { status: 'success', message: 'Admin created successfully', data: result[0] },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

