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
        const { tasks } = body;

        if (!Array.isArray(tasks) || tasks.length === 0) {
            return NextResponse.json({ message: 'No tasks provided' }, { status: 400 });
        }

        const updated: string[] = [];
        const failed: string[] = [];

        for (const task of tasks) {
            if (!task.id) continue;
            try {
                await sql`
                    UPDATE tasks
                    SET title = COALESCE(${task.title ?? null}, title),
                        description = COALESCE(${task.description ?? null}, description),
                        "order" = COALESCE(${task.order ?? null}, "order"),
                        "isActive" = COALESCE(${task.isActive ?? null}, "isActive"),
                        updated_at = NOW()
                    WHERE id = ${task.id}
                `;
                updated.push(task.id);
            } catch {
                failed.push(task.id);
            }
        }

        return NextResponse.json({
            status: 'success',
            message: `Updated ${updated.length} task(s), ${failed.length} failed`,
            data: { updated, failed }
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
