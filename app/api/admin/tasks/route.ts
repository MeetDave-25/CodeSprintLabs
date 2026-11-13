import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatTask } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const source = searchParams.get('source');
        const internshipId = searchParams.get('internshipId');
        const courseId = searchParams.get('courseId');
        const difficulty = searchParams.get('difficulty');
        const search = searchParams.get('search');

        let rows;
        if (internshipId) {
            rows = await sql`
                SELECT * FROM tasks
                WHERE "internshipId" = ${internshipId}
                ORDER BY "dayNumber" ASC, created_at DESC
            `;
        } else if (courseId) {
            rows = await sql`
                SELECT * FROM tasks
                WHERE "courseId" = ${courseId}
                ORDER BY "dayNumber" ASC, created_at DESC
            `;
        } else if (source) {
            rows = await sql`
                SELECT * FROM tasks
                WHERE source = ${source}
                ORDER BY "dayNumber" ASC, created_at DESC
            `;
        } else {
            rows = await sql`
                SELECT * FROM tasks
                ORDER BY "dayNumber" ASC, created_at DESC
            `;
        }

        let filtered = rows || [];
        if (difficulty) {
            filtered = filtered.filter((t: any) => t.difficulty?.toLowerCase() === difficulty.toLowerCase());
        }
        if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter((t: any) => t.title?.toLowerCase().includes(s) || t.domain?.toLowerCase().includes(s));
        }

        const data = filtered.map(formatTask);

        return NextResponse.json({
            status: 'success',
            data,
        });
    } catch (error: any) {
        console.error('API /admin/tasks GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch tasks: ' + error?.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const {
            title,
            description,
            difficulty = 'Easy',
            points = 10,
            dayNumber = 1,
            dueDate = null,
            requirements = [],
            internshipId = null,
            courseId = null,
            moduleId = null,
            source = 'internship',
            domain = null,
            language = null,
            isActive = true,
        } = body;

        if (!title || !title.trim()) {
            return NextResponse.json({ message: 'Task title is required' }, { status: 422 });
        }

        const cleanDueDate = dueDate && String(dueDate).trim() !== '' ? new Date(dueDate).toISOString() : null;

        const inserted = await sql`
            INSERT INTO tasks (
                title,
                description,
                difficulty,
                points,
                "dayNumber",
                "dueDate",
                requirements,
                "internshipId",
                "courseId",
                "moduleId",
                source,
                domain,
                language,
                "isActive",
                created_at,
                updated_at
            ) VALUES (
                ${title.trim()},
                ${description || ''},
                ${difficulty},
                ${Number(points) || 0},
                ${Number(dayNumber) || 1},
                ${cleanDueDate},
                ${JSON.stringify(requirements || [])},
                ${internshipId ? String(internshipId) : null},
                ${courseId ? String(courseId) : null},
                ${moduleId || null},
                ${source || 'internship'},
                ${domain || null},
                ${language || null},
                ${Boolean(isActive)},
                NOW(),
                NOW()
            )
            RETURNING *
        `;

        return NextResponse.json(
            {
                status: 'success',
                message: 'Task created successfully',
                data: formatTask(inserted[0]),
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('API /admin/tasks POST error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to create task: ' + error?.message },
            { status: 500 }
        );
    }
}

