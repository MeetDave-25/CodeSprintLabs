import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const offset = (page - 1) * limit;

        let students;
        let countResult;

        if (search) {
            students = await sql`
                SELECT id, name, email, role, avatar, status,
                    "totalPoints", "tasksCompleted", "coursesCompleted", "createdAt"
                FROM users
                WHERE role = 'student'
                AND (LOWER(name) LIKE ${'%' + search.toLowerCase() + '%'} OR LOWER(email) LIKE ${'%' + search.toLowerCase() + '%'})
                ${status ? sql`AND status = ${status}` : sql``}
                ORDER BY "createdAt" DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            countResult = await sql`
                SELECT COUNT(*) as total FROM users
                WHERE role = 'student'
                AND (LOWER(name) LIKE ${'%' + search.toLowerCase() + '%'} OR LOWER(email) LIKE ${'%' + search.toLowerCase() + '%'})
                ${status ? sql`AND status = ${status}` : sql``}
            `;
        } else {
            students = await sql`
                SELECT id, name, email, role, avatar, status,
                    "totalPoints", "tasksCompleted", "coursesCompleted", "createdAt"
                FROM users
                WHERE role = 'student'
                ${status ? sql`AND status = ${status}` : sql``}
                ORDER BY "createdAt" DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            countResult = await sql`
                SELECT COUNT(*) as total FROM users WHERE role = 'student'
                ${status ? sql`AND status = ${status}` : sql``}
            `;
        }

        const total = Number(countResult[0]?.total) || 0;

        return NextResponse.json({
            students: students.map((s: any) => ({
                ...s,
                id: String(s.id),
                totalPoints: Number(s.totalPoints) || 0,
                tasksCompleted: Number(s.tasksCompleted) || 0,
                coursesCompleted: Number(s.coursesCompleted) || 0,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('GET /api/admin/students error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}
