import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { enrollmentIds } = body;

        if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
            return NextResponse.json({ message: 'No enrollment IDs provided' }, { status: 400 });
        }

        const issued: string[] = [];
        const failed: string[] = [];

        for (const enrollmentId of enrollmentIds) {
            try {
                const enrollments = await sql`
                    SELECT e."userId", e."internshipId"
                    FROM enrollment_requests e
                    WHERE e.id = ${enrollmentId} AND e.status = 'completed'
                    LIMIT 1
                `;

                if (!enrollments || enrollments.length === 0) {
                    failed.push(enrollmentId);
                    continue;
                }

                const { userId, internshipId } = enrollments[0];
                const certCode = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

                await sql`
                    INSERT INTO certificates ("userId", "internshipId", "enrollmentId", "certificateNumber", "issuedAt", "createdAt", "updatedAt")
                    VALUES (${userId}, ${internshipId}, ${enrollmentId}, ${certCode}, NOW(), NOW(), NOW())
                    ON CONFLICT ("enrollmentId") DO NOTHING
                `;
                issued.push(enrollmentId);
            } catch {
                failed.push(enrollmentId);
            }
        }

        return NextResponse.json({
            status: 'success',
            message: `Issued ${issued.length} certificate(s), ${failed.length} failed`,
            data: { issued, failed }
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
