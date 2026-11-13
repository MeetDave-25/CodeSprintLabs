import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatCourse } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const rows = await sql`SELECT * FROM courses WHERE id = ${id} LIMIT 1`;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: 'success',
            data: formatCourse(rows[0]),
        });
    } catch (error: any) {
        console.error('API /admin/courses/[id] GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch course: ' + error?.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json().catch(() => ({}));

        const existing = await sql`SELECT * FROM courses WHERE id = ${id} LIMIT 1`;
        if (!existing || existing.length === 0) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        const current = existing[0];
        const title = body.title !== undefined ? body.title : current.title;
        const description = body.description !== undefined ? body.description : current.description;
        const instructor = body.instructor !== undefined ? body.instructor : current.instructor;
        const price = body.price !== undefined ? Number(body.price) : current.price;
        const duration = body.duration !== undefined ? body.duration : current.duration;
        const level = body.level !== undefined ? body.level : current.level;
        const category = body.category !== undefined ? body.category : current.category;
        const thumbnail = body.thumbnail !== undefined ? body.thumbnail : current.thumbnail;
        const modules = body.modules !== undefined ? JSON.stringify(body.modules) : current.modules;
        const isActive = body.isActive !== undefined ? Boolean(body.isActive) : current.isActive;

        const updated = await sql`
            UPDATE courses
            SET
                title = ${title},
                description = ${description},
                instructor = ${instructor},
                price = ${price},
                duration = ${duration},
                level = ${level},
                category = ${category},
                thumbnail = ${thumbnail},
                modules = ${modules},
                "isActive" = ${isActive},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        return NextResponse.json({
            status: 'success',
            message: 'Course updated successfully',
            data: formatCourse(updated[0]),
        });
    } catch (error: any) {
        console.error('API /admin/courses/[id] PUT error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to update course: ' + error?.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const deleted = await sql`DELETE FROM courses WHERE id = ${id} RETURNING id`;

        if (!deleted || deleted.length === 0) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: 'success',
            message: 'Course deleted successfully',
        });
    } catch (error: any) {
        console.error('API /admin/courses/[id] DELETE error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to delete course: ' + error?.message },
            { status: 500 }
        );
    }
}

