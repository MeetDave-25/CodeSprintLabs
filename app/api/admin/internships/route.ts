import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatInternship } from '@/lib/data-formatters';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const rows = await sql`
            SELECT * FROM internships
            ORDER BY created_at DESC
        `;

        const data = (rows || []).map((row: any) => formatInternship(row));

        return NextResponse.json({
            status: 'success',
            data,
        });
    } catch (error: any) {
        console.error('API /admin/internships GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch internships: ' + error?.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        const body = await request.json().catch(() => ({}));

        const {
            title,
            companyName,
            domain,
            duration,
            location = 'Remote',
            type = 'Remote',
            stipend = 'Unpaid',
            difficulty = 'Beginner',
            description = 'No description provided',
            price = 0,
            maxStudents = 100,
            isActive = true,
            isFeatured = false,
            companyLogo = null,
            image = null,
            startDate = null,
            endDate = null,
            applicationDeadline = null,
            languages = [],
            skills = [],
            responsibilities = [],
            requirements = [],
            whatYouWillLearn = [],
            learningOutcomes = [],
            syllabus = [],
            tasks = [],
        } = body;

        // Validation
        if (!title || !title.trim()) {
            return NextResponse.json({ status: 'error', message: 'Title is required' }, { status: 422 });
        }
        if (!companyName || !companyName.trim()) {
            return NextResponse.json({ status: 'error', message: 'Company name is required' }, { status: 422 });
        }
        if (!domain || !domain.trim()) {
            return NextResponse.json({ status: 'error', message: 'Domain is required' }, { status: 422 });
        }
        if (!duration || !duration.trim()) {
            return NextResponse.json({ status: 'error', message: 'Duration is required' }, { status: 422 });
        }

        const cleanStartDate = startDate && String(startDate).trim() !== '' ? new Date(startDate).toISOString() : null;
        const cleanEndDate = endDate && String(endDate).trim() !== '' ? new Date(endDate).toISOString() : null;
        const cleanDeadline = applicationDeadline && String(applicationDeadline).trim() !== '' ? new Date(applicationDeadline).toISOString() : null;

        const inserted = await sql`
            INSERT INTO internships (
                title,
                "companyName",
                location,
                type,
                stipend,
                domain,
                duration,
                difficulty,
                description,
                price,
                "maxStudents",
                "isActive",
                "isFeatured",
                "companyLogo",
                image,
                "startDate",
                "endDate",
                "applicationDeadline",
                languages,
                skills,
                responsibilities,
                requirements,
                "whatYouWillLearn",
                "learningOutcomes",
                syllabus,
                "createdBy",
                enrolled,
                created_at,
                updated_at
            ) VALUES (
                ${title.trim()},
                ${companyName.trim()},
                ${location.trim() || 'Remote'},
                ${type || 'Remote'},
                ${stipend || 'Unpaid'},
                ${domain.trim()},
                ${duration.trim()},
                ${difficulty || 'Beginner'},
                ${description || 'No description provided'},
                ${Number(price) || 0},
                ${Number(maxStudents) || 100},
                ${Boolean(isActive)},
                ${Boolean(isFeatured)},
                ${companyLogo || null},
                ${image || null},
                ${cleanStartDate},
                ${cleanEndDate},
                ${cleanDeadline},
                ${JSON.stringify(languages || [])},
                ${JSON.stringify(skills || [])},
                ${JSON.stringify(responsibilities || [])},
                ${JSON.stringify(requirements || [])},
                ${JSON.stringify(whatYouWillLearn || learningOutcomes || [])},
                ${JSON.stringify(learningOutcomes || whatYouWillLearn || [])},
                ${JSON.stringify(syllabus || [])},
                ${authUser ? String(authUser.id) : null},
                0,
                NOW(),
                NOW()
            )
            RETURNING *
        `;

        const newInternship = inserted[0];
        const insertedTasks: any[] = [];

        // Insert tasks if provided
        if (Array.isArray(tasks) && tasks.length > 0) {
            for (const task of tasks) {
                const taskRows = await sql`
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
                        ${task.title || 'Untitled Task'},
                        ${task.description || ''},
                        ${domain.trim()},
                        ${task.difficulty || 'Easy'},
                        ${Number(task.dayNumber) || 1},
                        ${Number(task.points) || 10},
                        ${String(newInternship.id)},
                        'internship',
                        ${task.isActive !== undefined ? Boolean(task.isActive) : true},
                        ${JSON.stringify(task.requirements || [])},
                        NOW(),
                        NOW()
                    )
                    RETURNING *
                `;
                if (taskRows && taskRows[0]) {
                    insertedTasks.push(taskRows[0]);
                }
            }
        }

        return NextResponse.json(
            {
                status: 'success',
                message: 'Internship created successfully',
                data: formatInternship(newInternship, insertedTasks),
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('API /admin/internships POST error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to create internship: ' + error?.message },
            { status: 500 }
        );
    }
}
