import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { formatSubmission } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const authUser = await getAuthUser();
        const body = await request.json().catch(() => ({}));
        const { status, feedback = null, points = null } = body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { message: 'Status must be approved or rejected' },
                { status: 422 }
            );
        }

        const existing = await sql`
            SELECT * FROM submissions WHERE id = ${id} LIMIT 1
        `;

        if (!existing || existing.length === 0) {
            return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
        }

        const sub = existing[0];
        const isAlreadyApproved = sub.status === 'approved';

        // Find associated task points if not explicitly specified
        let awardedPoints = 0;
        if (status === 'approved') {
            if (points !== null && points !== undefined) {
                awardedPoints = Number(points) || 0;
            } else if (sub.taskId) {
                const taskRows = await sql`
                    SELECT points FROM tasks WHERE id = ${sub.taskId} LIMIT 1
                `;
                awardedPoints = Number(taskRows[0]?.points) || 10;
            } else {
                awardedPoints = 10;
            }
        }

        // Update submission
        const updated = await sql`
            UPDATE submissions
            SET
                status = ${status},
                feedback = ${feedback},
                "pointsAwarded" = ${awardedPoints},
                "reviewedBy" = ${authUser ? String(authUser.id) : null},
                "reviewedAt" = NOW(),
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        // If newly approved, increment student points and tasksCompleted
        if (status === 'approved' && !isAlreadyApproved && sub.studentId) {
            await sql`
                UPDATE users
                SET
                    "totalPoints" = "totalPoints" + ${awardedPoints},
                    "tasksCompleted" = "tasksCompleted" + 1,
                    updated_at = NOW()
                WHERE id = ${sub.studentId}
            `;
        }

        // Send notification
        if (sub.studentId) {
            await sql`
                INSERT INTO notifications (
                    "userId",
                    title,
                    message,
                    type,
                    read,
                    link,
                    "createdAt",
                    created_at,
                    updated_at
                ) VALUES (
                    ${String(sub.studentId)},
                    ${'Submission ' + (status === 'approved' ? 'Approved' : 'Rejected')},
                    ${status === 'approved'
                        ? 'Great job! Your submission has been approved and points awarded.'
                        : 'Your submission requires changes: ' + (feedback || 'Check details')},
                    'submission',
                    false,
                    '/student/tasks',
                    NOW(),
                    NOW(),
                    NOW()
                )
            `;
        }

        return NextResponse.json({
            status: 'success',
            message: 'Submission reviewed successfully',
            data: formatSubmission(updated[0]),
            submission: formatSubmission(updated[0]),
        });
    } catch (error: any) {
        console.error('API /admin/submissions/[id]/review PUT error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to review submission: ' + error?.message },
            { status: 500 }
        );
    }
}

