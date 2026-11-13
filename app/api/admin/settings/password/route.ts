import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser, comparePasswords, hashPassword } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { current_password, password, password_confirmation } = body;

        if (!current_password || !password) {
            return NextResponse.json({ message: 'current_password and password are required' }, { status: 422 });
        }

        if (password !== password_confirmation) {
            return NextResponse.json({ message: 'Password confirmation does not match' }, { status: 422 });
        }

        if (password.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 422 });
        }

        const rows = await sql`SELECT password FROM users WHERE id = ${authUser.id} LIMIT 1`;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const matches = await comparePasswords(current_password, rows[0].password);
        if (!matches) {
            return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
        }

        const hashed = await hashPassword(password);
        await sql`UPDATE users SET password = ${hashed}, "updatedAt" = NOW() WHERE id = ${authUser.id}`;

        return NextResponse.json({ status: 'success', message: 'Password updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
