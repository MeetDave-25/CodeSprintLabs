import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatInternship } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const rows = await sql`
            SELECT * FROM internships
            WHERE id = ${id}
            LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Internship not found' }, { status: 404 });
        }

        const tasks = await sql`
            SELECT * FROM tasks
            WHERE "internshipId" = ${String(id)}
            ORDER BY "dayNumber" ASC, created_at ASC
        `;

        return NextResponse.json({
            status: 'success',
            data: formatInternship(rows[0], tasks || []),
        });
    } catch (error: any) {
        console.error('API /admin/internships/[id] GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch internship: ' + error?.message },
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
            SELECT * FROM internships WHERE id = ${id} LIMIT 1
        `;

        if (!existing || existing.length === 0) {
            return NextResponse.json({ message: 'Internship not found' }, { status: 404 });
        }

        const current = existing[0];

        const title = body.title !== undefined ? body.title : current.title;
        const companyName = body.companyName !== undefined ? body.companyName : current.companyName;
        const location = body.location !== undefined ? body.location : current.location;
        const type = body.type !== undefined ? body.type : current.type;
        const stipend = body.stipend !== undefined ? body.stipend : current.stipend;
        const domain = body.domain !== undefined ? body.domain : current.domain;
        const duration = body.duration !== undefined ? body.duration : current.duration;
        const difficulty = body.difficulty !== undefined ? body.difficulty : current.difficulty;
        const description = body.description !== undefined ? body.description : current.description;
        const price = body.price !== undefined ? Number(body.price) : current.price;
        const maxStudents = body.maxStudents !== undefined ? Number(body.maxStudents) : current.maxStudents;
        const isActive = body.isActive !== undefined ? Boolean(body.isActive) : current.isActive;
        const isFeatured = body.isFeatured !== undefined ? Boolean(body.isFeatured) : current.isFeatured;
        const companyLogo = body.companyLogo !== undefined ? body.companyLogo : current.companyLogo;
        const image = body.image !== undefined ? body.image : current.image;

        const cleanStartDate = body.startDate && String(body.startDate).trim() !== '' ? new Date(body.startDate).toISOString() : (body.startDate === null ? null : current.startDate);
        const cleanEndDate = body.endDate && String(body.endDate).trim() !== '' ? new Date(body.endDate).toISOString() : (body.endDate === null ? null : current.endDate);
        const cleanDeadline = body.applicationDeadline && String(body.applicationDeadline).trim() !== '' ? new Date(body.applicationDeadline).toISOString() : (body.applicationDeadline === null ? null : current.applicationDeadline);

        const languages = body.languages !== undefined ? JSON.stringify(body.languages) : current.languages;
        const skills = body.skills !== undefined ? JSON.stringify(body.skills) : current.skills;
        const responsibilities = body.responsibilities !== undefined ? JSON.stringify(body.responsibilities) : current.responsibilities;
        const requirements = body.requirements !== undefined ? JSON.stringify(body.requirements) : current.requirements;
        const whatYouWillLearn = body.whatYouWillLearn !== undefined ? JSON.stringify(body.whatYouWillLearn) : current.whatYouWillLearn;
        const syllabus = body.syllabus !== undefined ? JSON.stringify(body.syllabus) : current.syllabus;

        const updatedRows = await sql`
            UPDATE internships
            SET
                title = ${title},
                "companyName" = ${companyName},
                location = ${location},
                type = ${type},
                stipend = ${stipend},
                domain = ${domain},
                duration = ${duration},
                difficulty = ${difficulty},
                description = ${description},
                price = ${price},
                "maxStudents" = ${maxStudents},
                "isActive" = ${isActive},
                "isFeatured" = ${isFeatured},
                "companyLogo" = ${companyLogo},
                image = ${image},
                "startDate" = ${cleanStartDate},
                "endDate" = ${cleanEndDate},
                "applicationDeadline" = ${cleanDeadline},
                languages = ${languages},
                skills = ${skills},
                responsibilities = ${responsibilities},
                requirements = ${requirements},
                "whatYouWillLearn" = ${whatYouWillLearn},
                syllabus = ${syllabus},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        // Sync Tasks if tasks array is supplied
        if (Array.isArray(body.tasks)) {
            const incomingTasks = body.tasks;
            const keepTaskIds: number[] = [];

            for (const t of incomingTasks) {
                const taskId = t.id && !String(t.id).startsWith('t') ? Number(t.id) : null;

                if (taskId && !isNaN(taskId)) {
                    // Update existing task
                    await sql`
                        UPDATE tasks
                        SET
                            title = ${t.title || 'Untitled Task'},
                            description = ${t.description || ''},
                            difficulty = ${t.difficulty || 'Easy'},
                            "dayNumber" = ${Number(t.dayNumber) || 1},
                            points = ${Number(t.points) || 10},
                            "isActive" = ${t.isActive !== undefined ? Boolean(t.isActive) : true},
                            requirements = ${JSON.stringify(t.requirements || [])},
                            updated_at = NOW()
                        WHERE id = ${taskId} AND "internshipId" = ${String(id)}
                    `;
                    keepTaskIds.push(taskId);
                } else {
                    // Insert new task
                    const newT = await sql`
                        INSERT INTO tasks (
                            title,
                            description,
                            domain,
                            difficulty,
                            "dayNumber",
                            points,
                            "internshipId",
                            source,
                            "isActive",
                            requirements,
                            created_at,
                            updated_at
                        ) VALUES (
                            ${t.title || 'Untitled Task'},
                            ${t.description || ''},
                            ${domain},
                            ${t.difficulty || 'Easy'},
                            ${Number(t.dayNumber) || 1},
                            ${Number(t.points) || 10},
                            ${String(id)},
                            'internship',
                            ${t.isActive !== undefined ? Boolean(t.isActive) : true},
                            ${JSON.stringify(t.requirements || [])},
                            NOW(),
                            NOW()
                        )
                        RETURNING id
                    `;
                    if (newT && newT[0]) {
                        keepTaskIds.push(Number(newT[0].id));
                    }
                }
            }

            // Remove tasks no longer in list
            if (keepTaskIds.length > 0) {
                await sql`
                    DELETE FROM tasks
                    WHERE "internshipId" = ${String(id)}
                      AND NOT (id = ANY(${keepTaskIds}))
                `;
            } else {
                await sql`
                    DELETE FROM tasks
                    WHERE "internshipId" = ${String(id)}
                `;
            }
        }

        const freshTasks = await sql`
            SELECT * FROM tasks
            WHERE "internshipId" = ${String(id)}
            ORDER BY "dayNumber" ASC, created_at ASC
        `;

        return NextResponse.json({
            status: 'success',
            message: 'Internship updated successfully',
            data: formatInternship(updatedRows[0], freshTasks || []),
        });
    } catch (error: any) {
        console.error('API /admin/internships/[id] PUT error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to update internship: ' + error?.message },
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

        // Delete associated tasks
        await sql`
            DELETE FROM tasks
            WHERE "internshipId" = ${String(id)}
        `;

        // Delete internship
        const deleted = await sql`
            DELETE FROM internships
            WHERE id = ${id}
            RETURNING id
        `;

        if (!deleted || deleted.length === 0) {
            return NextResponse.json({ message: 'Internship not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: 'success',
            message: 'Internship deleted successfully',
        });
    } catch (error: any) {
        console.error('API /admin/internships/[id] DELETE error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to delete internship: ' + error?.message },
            { status: 500 }
        );
    }
}
