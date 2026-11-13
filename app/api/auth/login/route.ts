import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { comparePasswords, signJwt } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                {
                    message: 'The email and password fields are required.',
                    errors: {
                        email: !email ? ['The email field is required.'] : [],
                        password: !password ? ['The password field is required.'] : [],
                    },
                },
                { status: 422 }
            );
        }

        const trimmedEmail = String(email).trim().toLowerCase();

        // Query user from Neon DB
        const users = await sql`
            SELECT id, name, email, password, role, avatar, "totalPoints", status
            FROM users
            WHERE LOWER(email) = ${trimmedEmail}
            LIMIT 1
        `;

        if (!users || users.length === 0) {
            return NextResponse.json(
                {
                    message: 'The provided credentials are incorrect.',
                    errors: {
                        email: ['The provided credentials are incorrect.'],
                    },
                },
                { status: 422 }
            );
        }

        const user = users[0];

        // Verify password
        const passwordMatches = await comparePasswords(password, user.password);
        if (!passwordMatches) {
            return NextResponse.json(
                {
                    message: 'The provided credentials are incorrect.',
                    errors: {
                        email: ['The provided credentials are incorrect.'],
                    },
                },
                { status: 422 }
            );
        }

        // Check if user is blocked
        if (user.status === 'blocked') {
            return NextResponse.json(
                {
                    message: 'Your account has been blocked. Please contact support.',
                },
                { status: 403 }
            );
        }

        // Generate JWT token
        const token = signJwt({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        return NextResponse.json(
            {
                message: 'Login successful',
                user: {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    totalPoints: Number(user.totalPoints) || 0,
                },
                token,
                token_type: 'bearer',
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('API /auth/login error:', error);
        return NextResponse.json(
            {
                message: 'Internal server error: ' + (error?.message || 'Database error'),
            },
            { status: 500 }
        );
    }
}

