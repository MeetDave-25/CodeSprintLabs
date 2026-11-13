import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatTask } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const existing = await sql`
            SELECT id, "isActive" FROM tasks WHERE id = ${id} LIMIT 1
        `;

        if (!existing || existing.length === 0) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        const newStatus = !existing[0].isActive;

        const updated = await sql`
            UPDATE tasks
            SET "isActive" = ${newStatus}, updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        return NextResponse.json({
            status: 'success',
            message: 'Task status updated',
            data: formatTask(updated[0]),
        });
    } catch (error: any) {
        console.error('API /admin/tasks/[id]/toggle-status PUT error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to toggle task status: ' + error?.message },
            { status: 500 }
        );
    }
}

