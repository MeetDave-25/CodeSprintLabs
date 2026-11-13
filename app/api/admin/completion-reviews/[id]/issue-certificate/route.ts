import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const enrollments = await sql`
            SELECT e.*, u.id as "userId", i.id as "internshipId"
            FROM enrollment_requests e
            LEFT JOIN users u ON u.id::text = e."userId"::text
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e.id = ${params.id}
            LIMIT 1
        `;

        if (!enrollments || enrollments.length === 0) {
            return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
        }

        const enrollment = enrollments[0];
        const certCode = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        try {
            const cert = await sql`
                INSERT INTO certificates ("userId", "internshipId", "enrollmentId", "certificateNumber", "issuedAt", "createdAt", "updatedAt")
                VALUES (${enrollment.userId}, ${enrollment.internshipId}, ${params.id}, ${certCode}, NOW(), NOW(), NOW())
                ON CONFLICT ("enrollmentId") DO UPDATE SET "updatedAt" = NOW()
                RETURNING *
            `;
            return NextResponse.json({ status: 'success', data: cert[0], message: 'Certificate issued successfully' });
        } catch {
            const cert = await sql`
                INSERT INTO certificates ("userId", "internshipId", "certificateNumber", "issuedAt", "createdAt", "updatedAt")
                VALUES (${enrollment.userId}, ${enrollment.internshipId}, ${certCode}, NOW(), NOW(), NOW())
                RETURNING *
            `;
            return NextResponse.json({ status: 'success', data: cert[0], message: 'Certificate issued successfully' });
        }
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
