import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

function generateCode(len = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const enrollment = await sql`
            SELECT * FROM enrollment_requests
            WHERE id = ${params.id} AND "userId" = ${authUser.id} LIMIT 1
        `;
        if (!enrollment || enrollment.length === 0) {
            return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
        }
        if (enrollment[0].status !== 'completed') {
            return NextResponse.json({ message: 'Internship not yet completed' }, { status: 422 });
        }

        const uid = String(authUser.id);
        const internshipId = String(enrollment[0].internshipId);

        const existing = await sql`
            SELECT id FROM certificates
            WHERE "studentId" = ${uid} AND "internshipId" = ${internshipId} AND type = 'internship'
            LIMIT 1
        `;
        if (existing && existing.length > 0) {
            return NextResponse.json({ status: 'success', data: existing[0], message: 'Certificate already issued' });
        }

        const verificationCode = `CERT-${new Date().getFullYear()}-${generateCode(8)}`;
        const cert = await sql`
            INSERT INTO certificates ("studentId", "internshipId", type, "verificationCode", "issueDate", status, created_at)
            VALUES (${uid}, ${internshipId}, 'internship', ${verificationCode}, NOW(), 'active', NOW())
            RETURNING *
        `;

        return NextResponse.json({ status: 'success', data: cert[0] });
    } catch (error: any) {
        console.error('POST /api/student/my-internships/[id]/certificate error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
