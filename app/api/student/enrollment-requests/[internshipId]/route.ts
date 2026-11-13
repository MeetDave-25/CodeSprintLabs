import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// POST /api/student/enrollment-requests/[internshipId] - request enrollment
export async function POST(
    request: NextRequest,
    { params }: { params: { internshipId: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Ensure table exists and ID columns are TEXT (not UUID) so integer internship IDs work
        await sql`
            CREATE TABLE IF NOT EXISTS enrollment_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "userId" TEXT NOT NULL,
                "internshipId" TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `.catch(() => {});
        // If the table was previously created with UUID columns, convert them to TEXT
        await sql`ALTER TABLE enrollment_requests ALTER COLUMN "userId" TYPE TEXT USING "userId"::text`.catch(() => {});
        await sql`ALTER TABLE enrollment_requests ALTER COLUMN "internshipId" TYPE TEXT USING "internshipId"::text`.catch(() => {});
        await sql`ALTER TABLE enrollment_requests ADD COLUMN IF NOT EXISTS "coverLetter" TEXT`.catch(() => {});
        await sql`ALTER TABLE enrollment_requests ADD COLUMN IF NOT EXISTS "resumeGoogleDriveUrl" TEXT`.catch(() => {});

        const internshipId = params.internshipId;

        // Check internship exists
        const internships = await sql`SELECT id, title, "isActive", "maxStudents" FROM internships WHERE id::text = ${String(internshipId)} LIMIT 1`;
        if (!internships || internships.length === 0) {
            return NextResponse.json({ message: 'Internship not found' }, { status: 404 });
        }

        const internship = internships[0];
        if (!internship.isActive) {
            return NextResponse.json({ message: 'This internship is no longer accepting applications' }, { status: 400 });
        }

        // Check already applied
        const existing = await sql`
            SELECT id, status FROM enrollment_requests
            WHERE "userId" = ${String(authUser.id)} AND "internshipId" = ${String(internshipId)}
            LIMIT 1
        `;

        if (existing && existing.length > 0) {
            return NextResponse.json({
                message: `You already have a ${existing[0].status} application for this internship`,
            }, { status: 400 });
        }

        const body = await request.json().catch(() => ({}));
        const { resumeGoogleDriveUrl, coverLetter } = body;

        const result = await sql`
            INSERT INTO enrollment_requests (
                "userId", "internshipId", status,
                "resumeGoogleDriveUrl", "coverLetter",
                "createdAt", "updatedAt"
            )
            VALUES (
                ${String(authUser.id)}, ${String(internshipId)}, 'pending',
                ${resumeGoogleDriveUrl || null}, ${coverLetter || null},
                NOW(), NOW()
            )
            RETURNING *
        `;

        return NextResponse.json(
            { status: 'success', message: 'Enrollment request submitted successfully', data: result[0] },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('POST /api/student/enrollment-requests error:', error);
        return NextResponse.json({
            message: error?.message || 'Internal server error',
            detail: error?.detail || null,
        }, { status: 500 });
    }
}

