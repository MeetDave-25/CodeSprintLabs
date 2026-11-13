import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { hashPassword } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Add extended profile columns if they don't exist yet
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT[]`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "collegeName" TEXT`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS course TEXT`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "enrollmentNumber" TEXT`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "rollNumber" TEXT`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "resumePath" TEXT`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "resumeOriginalName" TEXT`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "resumeGoogleDriveUrl" TEXT`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "resumeUpdatedAt" TIMESTAMPTZ`.catch(() => {});
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "joinedDate" TIMESTAMPTZ`.catch(() => {});

        const users = await sql`
            SELECT
                id, name, email, role, avatar, status, phone,
                location, city, bio, skills,
                "collegeName", course, "enrollmentNumber", "rollNumber",
                "totalPoints", "tasksCompleted", "coursesCompleted",
                "resumePath", "resumeOriginalName", "resumeGoogleDriveUrl", "resumeUpdatedAt",
                "joinedDate", created_at
            FROM users
            WHERE id = ${authUser.id}
            LIMIT 1
        `;

        if (!users || users.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const user = users[0];
        return NextResponse.json({
            profile: {
                id: String(user.id),
                name: user.name || '',
                email: user.email || '',
                role: user.role,
                avatar: user.avatar || null,
                status: user.status,
                phone: user.phone || '',
                location: user.location || '',
                city: user.city || '',
                bio: user.bio || '',
                skills: user.skills || [],
                collegeName: user.collegeName || '',
                course: user.course || '',
                enrollmentNumber: user.enrollmentNumber || '',
                rollNumber: user.rollNumber || '',
                totalPoints: Number(user.totalPoints) || 0,
                tasksCompleted: Number(user.tasksCompleted) || 0,
                coursesCompleted: Number(user.coursesCompleted) || 0,
                resumePath: user.resumePath || null,
                resumeOriginalName: user.resumeOriginalName || null,
                resumeGoogleDriveUrl: user.resumeGoogleDriveUrl || null,
                resumeUpdatedAt: user.resumeUpdatedAt || null,
                hasResume: !!(user.resumePath || user.resumeGoogleDriveUrl),
                joinedDate: user.joinedDate || user.created_at || new Date().toISOString(),
            },
        });
    } catch (error: any) {
        console.error('GET /api/student/profile error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { name, avatar, currentPassword, newPassword, phone, location, city, bio, skills, collegeName, course, enrollmentNumber, rollNumber } = body;

        // If changing password, verify current password first
        if (newPassword) {
            const users = await sql`
                SELECT password FROM users WHERE id = ${authUser.id} LIMIT 1
            `;
            if (!users || users.length === 0) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }
            const { comparePasswords } = await import('@/lib/auth-server');
            const matches = await comparePasswords(currentPassword || '', users[0].password);
            if (!matches) {
                return NextResponse.json({ message: 'Current password is incorrect' }, { status: 422 });
            }
        }

        const hashedPassword = newPassword ? await hashPassword(newPassword) : null;

        const updated = await sql`
            UPDATE users SET
                name = COALESCE(${name ?? null}, name),
                avatar = COALESCE(${avatar ?? null}, avatar),
                password = COALESCE(${hashedPassword}, password),
                phone = COALESCE(${phone ?? null}, phone),
                location = COALESCE(${location ?? null}, location),
                city = COALESCE(${city ?? null}, city),
                bio = COALESCE(${bio ?? null}, bio),
                skills = COALESCE(${skills !== undefined ? skills : null}, skills),
                "collegeName" = COALESCE(${collegeName ?? null}, "collegeName"),
                course = COALESCE(${course ?? null}, course),
                "enrollmentNumber" = COALESCE(${enrollmentNumber ?? null}, "enrollmentNumber"),
                "rollNumber" = COALESCE(${rollNumber ?? null}, "rollNumber"),
                updated_at = NOW()
            WHERE id = ${authUser.id}
            RETURNING id, name, email, role, avatar, status, "totalPoints", phone, city, bio
        `;

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: updated[0],
        });
    } catch (error: any) {
        console.error('PUT /api/student/profile error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}

