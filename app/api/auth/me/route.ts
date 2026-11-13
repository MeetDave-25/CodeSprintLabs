import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyJwt } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthenticated.' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const payload = verifyJwt(token);
        if (!payload || !payload.id) {
            return NextResponse.json(
                { message: 'Unauthenticated or token expired.' },
                { status: 401 }
            );
        }

        const users = await sql`
            SELECT id, name, email, role, phone, location, city, bio, skills, avatar,
                   "collegeName", course, "enrollmentNumber", "rollNumber",
                   "enrolledInternships", "enrolledCourses", "joinedDate",
                   status, "totalPoints", "tasksCompleted", "coursesCompleted",
                   "resumePath", "resumeOriginalName", "resumeGoogleDriveUrl"
            FROM users
            WHERE id = ${payload.id}
            LIMIT 1
        `;

        if (!users || users.length === 0) {
            return NextResponse.json(
                { message: 'User not found.' },
                { status: 404 }
            );
        }

        const user = users[0];
        return NextResponse.json({
            user: {
                ...user,
                id: String(user.id),
                totalPoints: Number(user.totalPoints) || 0,
                tasksCompleted: Number(user.tasksCompleted) || 0,
                coursesCompleted: Number(user.coursesCompleted) || 0,
            },
        });
    } catch (error: any) {
        console.error('API /auth/me error:', error);
        return NextResponse.json(
            { message: 'Failed to retrieve user: ' + error?.message },
            { status: 500 }
        );
    }
}

