import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { email, code } = body;
        if (!email || !code) {
            return NextResponse.json({ message: 'Email and code are required' }, { status: 422 });
        }

        const users = await sql`
            SELECT id, verification_code, verification_code_expires_at
            FROM users WHERE email = ${email} LIMIT 1
        `;
        if (!users || users.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const user = users[0];
        if (user.verification_code !== code) {
            return NextResponse.json({ message: 'Invalid verification code' }, { status: 422 });
        }
        if (user.verification_code_expires_at && new Date(user.verification_code_expires_at) < new Date()) {
            return NextResponse.json({ message: 'Verification code has expired' }, { status: 422 });
        }

        await sql`
            UPDATE users SET
                email_verified_at = NOW(),
                verification_code = NULL,
                verification_code_expires_at = NULL,
                updated_at = NOW()
            WHERE id = ${user.id}
        `;

        return NextResponse.json({ status: 'success', message: 'Email verified successfully' });
    } catch (error: any) {
        console.error('POST /api/auth/verify-otp error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
