import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatTask } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const rows = await sql`
            SELECT * FROM tasks WHERE id = ${id} LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        const task = rows[0];

        // Get submission counts for this task
        const subCounts = await sql`
            SELECT
                COUNT(*)::int as total,
                COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending,
                COUNT(CASE WHEN status = 'approved' THEN 1 END)::int as approved,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int as rejected
            FROM submissions
            WHERE "taskId" = ${String(id)}
        `;

        const stats = subCounts[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };

        return NextResponse.json({
            status: 'success',
            data: {
                task: formatTask(task),
                submissionStats: {
                    total: stats.total || 0,
                    pending: stats.pending || 0,
                    approved: stats.approved || 0,
                    rejected: stats.rejected || 0,
                },
            },
        });
    } catch (error: any) {
        console.error('API /admin/tasks/[id] GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch task: ' + error?.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json().catch(() => ({}));

        const existing = await sql`
            SELECT * FROM tasks WHERE id = ${id} LIMIT 1
        `;

        if (!existing || existing.length === 0) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        const current = existing[0];

        const title = body.title !== undefined ? body.title : current.title;
        const description = body.description !== undefined ? body.description : current.description;
        const difficulty = body.difficulty !== undefined ? body.difficulty : current.difficulty;
        const points = body.points !== undefined ? Number(body.points) : current.points;
        const dayNumber = body.dayNumber !== undefined ? Number(body.dayNumber) : current.dayNumber;
        const cleanDueDate = body.dueDate && String(body.dueDate).trim() !== '' ? new Date(body.dueDate).toISOString() : (body.dueDate === null ? null : current.dueDate);
        const isActive = body.isActive !== undefined ? Boolean(body.isActive) : current.isActive;
        const requirements = body.requirements !== undefined ? JSON.stringify(body.requirements) : current.requirements;

        const updated = await sql`
            UPDATE tasks
            SET
                title = ${title},
                description = ${description},
                difficulty = ${difficulty},
                points = ${points},
                "dayNumber" = ${dayNumber},
                "dueDate" = ${cleanDueDate},
                "isActive" = ${isActive},
                requirements = ${requirements},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        return NextResponse.json({
            status: 'success',
            message: 'Task updated successfully',
            data: formatTask(updated[0]),
        });
    } catch (error: any) {
        console.error('API /admin/tasks/[id] PUT error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to update task: ' + error?.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Check if task has submissions
        const submissions = await sql`
            SELECT id FROM submissions WHERE "taskId" = ${String(id)} LIMIT 1
        `;

        if (submissions && submissions.length > 0) {
            return NextResponse.json(
                { message: 'Cannot delete task with submissions. Deactivate it instead.' },
                { status: 400 }
            );
        }

        const deleted = await sql`
            DELETE FROM tasks WHERE id = ${id} RETURNING id
        `;

        if (!deleted || deleted.length === 0) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: 'success',
            message: 'Task deleted successfully',
        });
    } catch (error: any) {
        console.error('API /admin/tasks/[id] DELETE error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to delete task: ' + error?.message },
            { status: 500 }
        );
    }
}

