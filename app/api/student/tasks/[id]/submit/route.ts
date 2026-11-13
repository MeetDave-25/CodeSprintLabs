import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { formatSubmission } from '@/lib/data-formatters';

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

        const taskId = params.id;
        const taskRows = await sql`
            SELECT id, title FROM tasks WHERE id = ${taskId} LIMIT 1
        `;

        if (!taskRows || taskRows.length === 0) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        const task = taskRows[0];

        // Check if student already submitted
        const existing = await sql`
            SELECT id FROM submissions
            WHERE "studentId" = ${String(user.id)} AND "taskId" = ${String(taskId)}
            LIMIT 1
        `;

        if (existing && existing.length > 0) {
            return NextResponse.json(
                { message: 'You have already submitted this task' },
                { status: 400 }
            );
        }

        let githubLink = '';
        let notes = '';
        let screenshotUrl = null;

        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const body = await request.json().catch(() => ({}));
            githubLink = body.githubLink || '';
            notes = body.notes || '';
            screenshotUrl = body.screenshotUrl || null;
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            githubLink = String(formData.get('githubLink') || '');
            notes = String(formData.get('notes') || '');
            screenshotUrl = String(formData.get('screenshotUrl') || '');
        }

        if (!githubLink || !githubLink.trim()) {
            return NextResponse.json({ message: 'GitHub link is required' }, { status: 422 });
        }

        const inserted = await sql`
            INSERT INTO submissions (
                "studentId",
                "studentName",
                "taskId",
                "taskTitle",
                "githubLink",
                notes,
                "screenshotUrl",
                "submittedAt",
                status,
                "pointsAwarded",
                created_at,
                updated_at
            ) VALUES (
                ${String(user.id)},
                ${user.name || 'Student'},
                ${String(taskId)},
                ${task.title || 'Task'},
                ${githubLink.trim()},
                ${notes || null},
                ${screenshotUrl || null},
                NOW(),
                'pending',
                0,
                NOW(),
                NOW()
            )
            RETURNING *
        `;

        return NextResponse.json(
            {
                message: 'Task submitted successfully',
                submission: formatSubmission(inserted[0]),
                data: formatSubmission(inserted[0]),
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('API /student/tasks/[id]/submit POST error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to submit task: ' + error?.message },
            { status: 500 }
        );
    }
}

