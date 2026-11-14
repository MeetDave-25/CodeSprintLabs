import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

function generateCode(len = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const uid = String(authUser.id);
        const courseId = params.id;

        const existing = await sql`
            SELECT id FROM certificates
            WHERE "studentId" = ${uid} AND "courseId" = ${courseId}
            LIMIT 1
        `;
        if (existing && existing.length > 0) {
            return NextResponse.json({ status: 'success', data: existing[0], message: 'Certificate already issued' });
        }

        const verificationCode = `CERT-${new Date().getFullYear()}-${generateCode(8)}`;
        const cert = await sql`
            INSERT INTO certificates ("studentId", "courseId", "verificationCode", "issueDate", created_at, updated_at)
            VALUES (${uid}, ${courseId}, ${verificationCode}, NOW(), NOW(), NOW())
            RETURNING *
        `;

        return NextResponse.json({ status: 'success', data: cert[0] });
    } catch (error: any) {
        console.error('POST /api/student/my-courses/[id]/certificate error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
