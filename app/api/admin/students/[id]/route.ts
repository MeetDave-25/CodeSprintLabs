import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const users = await sql`
            SELECT id, name, email, role, avatar, status,
                "totalPoints", "tasksCompleted", "coursesCompleted", "createdAt"
            FROM users
            WHERE id = ${params.id} AND role = 'student'
            LIMIT 1
        `;

        if (!users || users.length === 0) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        const user = users[0];

        // Get their enrollments
        const enrollments = await sql`
            SELECT e.*, i.title as "internshipTitle"
            FROM enrollment_requests e
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e."userId" = ${params.id}
            ORDER BY e."createdAt" DESC
        `;

        return NextResponse.json({
            student: {
                ...user,
                id: String(user.id),
                totalPoints: Number(user.totalPoints) || 0,
            },
            enrollments,
        });
    } catch (error: any) {
        console.error('GET /api/admin/students/[id] error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { status } = body;

        if (!status || !['active', 'blocked', 'inactive'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status value' }, { status: 422 });
        }

        const updated = await sql`
            UPDATE users
            SET status = ${status}, "updatedAt" = NOW()
            WHERE id = ${params.id} AND role = 'student'
            RETURNING id, name, email, role, status
        `;

        if (!updated || updated.length === 0) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Student updated successfully',
            student: updated[0],
        });
    } catch (error: any) {
        console.error('PUT /api/admin/students/[id] error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await sql`DELETE FROM users WHERE id = ${params.id} AND role = 'student'`;

        return NextResponse.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
        console.error('DELETE /api/admin/students/[id] error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}

