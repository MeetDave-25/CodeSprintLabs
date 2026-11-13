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
        const limit = Math.min(50, parseInt(searchParams.get('limit') || '10'));

        const submissions = await sql`
            SELECT s.*, u.name as "studentName", u.email as "studentEmail",
                t.title as "taskTitle", t."internshipId"
            FROM submissions s
            LEFT JOIN users u ON u.id::text = s."userId"::text
            LEFT JOIN tasks t ON t.id::text = s."taskId"::text
            ORDER BY s."createdAt" DESC
            LIMIT ${limit}
        `;

        return NextResponse.json({ status: 'success', data: submissions });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
