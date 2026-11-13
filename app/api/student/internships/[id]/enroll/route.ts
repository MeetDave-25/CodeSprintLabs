import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { safeJson, formatInternship } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
        }

        const internshipId = params.id;
        const rows = await sql`
            SELECT * FROM internships WHERE id = ${internshipId} LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Internship not found' }, { status: 404 });
        }

        const internship = rows[0];

        if (internship.enrolled >= internship.maxStudents) {
            return NextResponse.json({ message: 'Internship is full' }, { status: 400 });
        }

        // Get user's current enrolled internships
        const userRows = await sql`
            SELECT "enrolledInternships" FROM users WHERE id = ${user.id} LIMIT 1
        `;

        const userEnrolled = safeJson(userRows[0]?.enrolledInternships, []);
        const alreadyEnrolled = userEnrolled.some((id: any) => String(id) === String(internshipId));

        if (alreadyEnrolled) {
            return NextResponse.json({ message: 'Already enrolled in this internship' }, { status: 400 });
        }

        userEnrolled.push(String(internshipId));

        // Update user
        await sql`
            UPDATE users
            SET "enrolledInternships" = ${JSON.stringify(userEnrolled)}, updated_at = NOW()
            WHERE id = ${user.id}
        `;

        // Increment enrolled count
        const updatedInternship = await sql`
            UPDATE internships
            SET enrolled = enrolled + 1, updated_at = NOW()
            WHERE id = ${internshipId}
            RETURNING *
        `;

        return NextResponse.json({
            status: 'success',
            message: 'Enrolled successfully',
            data: formatInternship(updatedInternship[0]),
        });
    } catch (error: any) {
        console.error('API /student/internships/[id]/enroll POST error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to enroll: ' + error?.message },
            { status: 500 }
        );
    }
}
