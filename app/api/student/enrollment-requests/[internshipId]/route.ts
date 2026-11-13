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

        const internshipId = params.internshipId;

        // Check internship exists
        const internships = await sql`SELECT id, title, "isActive", "maxStudents" FROM internships WHERE id = ${internshipId} LIMIT 1`;
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
            WHERE "userId" = ${authUser.id} AND "internshipId" = ${internshipId}
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
                "studentName", "studentEmail",
                "createdAt", "updatedAt"
            )
            VALUES (
                ${authUser.id}, ${internshipId}, 'pending',
                ${resumeGoogleDriveUrl || null}, ${coverLetter || null},
                ${authUser.name}, ${authUser.email},
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
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

