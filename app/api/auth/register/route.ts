import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { hashPassword, signJwt } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { name, email, password, phone } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                {
                    message: 'Validation failed',
                    errors: {
                        name: !name ? ['The name field is required.'] : [],
                        email: !email ? ['The email field is required.'] : [],
                        password: !password ? ['The password field is required.'] : [],
                    },
                },
                { status: 422 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                {
                    message: 'The password must be at least 8 characters.',
                    errors: {
                        password: ['The password must be at least 8 characters.'],
                    },
                },
                { status: 422 }
            );
        }

        const trimmedEmail = String(email).trim().toLowerCase();

        // Check uniqueness
        const existing = await sql`
            SELECT id FROM users WHERE LOWER(email) = ${trimmedEmail} LIMIT 1
        `;

        if (existing && existing.length > 0) {
            return NextResponse.json(
                { message: 'The email has already been taken.' },
                { status: 422 }
            );
        }

        const hashedPassword = await hashPassword(password);
        const now = new Date();

        const inserted = await sql`
            INSERT INTO users (
                name,
                email,
                password,
                role,
                phone,
                status,
                "joinedDate",
                "email_verified_at",
                "totalPoints",
                "tasksCompleted",
                "coursesCompleted",
                created_at,
                updated_at
            ) VALUES (
                ${name},
                ${trimmedEmail},
                ${hashedPassword},
                'student',
                ${phone || null},
                'active',
                ${now.toISOString()},
                ${now.toISOString()},
                0,
                0,
                0,
                NOW(),
                NOW()
            )
            RETURNING id, name, email, role, avatar, "totalPoints"
        `;

        const user = inserted[0];
        const token = signJwt({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        return NextResponse.json(
            {
                message: 'Registration successful. You are now logged in.',
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
            { status: 201 }
        );
    } catch (error: any) {
        console.error('API /auth/register error:', error);
        return NextResponse.json(
            { message: 'Registration failed: ' + (error?.message || 'Database error') },
            { status: 500 }
        );
    }
}

