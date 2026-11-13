import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatCourse } from '@/lib/data-formatters';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const rows = await sql`
            SELECT * FROM courses ORDER BY created_at DESC
        `;

        const data = (rows || []).map(formatCourse);

        return NextResponse.json({
            status: 'success',
            data,
        });
    } catch (error: any) {
        console.error('API /admin/courses GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch courses: ' + error?.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        const body = await request.json().catch(() => ({}));

        const {
            title,
            description = 'No description provided',
            instructor = 'CodeSprint Labs',
            price = 0,
            duration = '',
            level = 'Beginner',
            category = 'General',
            thumbnail = null,
            modules = [],
            isActive = true,
        } = body;

        if (!title || !title.trim()) {
            return NextResponse.json({ message: 'Course title is required' }, { status: 422 });
        }

        const inserted = await sql`
            INSERT INTO courses (
                title,
                description,
                instructor,
                price,
                duration,
                level,
                category,
                thumbnail,
                modules,
                "isActive",
                "createdBy",
                enrolled,
                rating,
                created_at,
                updated_at
            ) VALUES (
                ${title.trim()},
                ${description},
                ${instructor},
                ${Number(price) || 0},
                ${duration},
                ${level},
                ${category},
                ${thumbnail || null},
                ${JSON.stringify(modules || [])},
                ${Boolean(isActive)},
                ${authUser ? String(authUser.id) : null},
                0,
                0,
                NOW(),
                NOW()
            )
            RETURNING *
        `;

        return NextResponse.json(
            {
                status: 'success',
                message: 'Course created successfully',
                data: formatCourse(inserted[0]),
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('API /admin/courses POST error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to create course: ' + error?.message },
            { status: 500 }
        );
    }
}

