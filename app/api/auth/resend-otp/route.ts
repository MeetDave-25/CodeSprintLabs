import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { email } = body;
        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 422 });
        }

        const users = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
        if (!users || users.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await sql`
            UPDATE users SET
                verification_code = ${code},
                verification_code_expires_at = ${expiry.toISOString()},
                updated_at = NOW()
            WHERE id = ${users[0].id}
        `;

        return NextResponse.json({ status: 'success', message: 'OTP sent successfully' });
    } catch (error: any) {
        console.error('POST /api/auth/resend-otp error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
