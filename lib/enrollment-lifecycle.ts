import sql from '@/lib/db';

/** Enrollment statuses in which a student already has (or had) an approved enrollment. */
export const DOC_STATUSES = ['approved', 'completion_requested', 'completed', 'withdrawn'];

let ensured = false;

/** Adds every lifecycle column / table the completion + withdrawal flows rely on. Safe to call repeatedly. */
export async function ensureLifecycleSchema() {
    if (ensured) return;
    try {
        await sql`
            ALTER TABLE enrollment_requests
                ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS "mouGenerated" BOOLEAN DEFAULT false,
                ADD COLUMN IF NOT EXISTS "offerLetterGenerated" BOOLEAN DEFAULT false,
                ADD COLUMN IF NOT EXISTS "completionRequestedAt" TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS marks INTEGER,
                ADD COLUMN IF NOT EXISTS feedback TEXT,
                ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS "certificateId" TEXT,
                ADD COLUMN IF NOT EXISTS "withdrawalRequested" BOOLEAN DEFAULT false,
                ADD COLUMN IF NOT EXISTS "withdrawalStatus" TEXT,
                ADD COLUMN IF NOT EXISTS "withdrawalReason" TEXT,
                ADD COLUMN IF NOT EXISTS "withdrawalRequestedAt" TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS "withdrawalApprovedAt" TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS "withdrawalApprovedBy" TEXT,
                ADD COLUMN IF NOT EXISTS "withdrawalAdminNote" TEXT
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS certificates (
                id SERIAL PRIMARY KEY,
                "studentId" TEXT,
                "internshipId" TEXT,
                type TEXT,
                "verificationCode" TEXT,
                "issueDate" TIMESTAMPTZ DEFAULT NOW(),
                status TEXT DEFAULT 'active',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        await sql`
            ALTER TABLE certificates
                ADD COLUMN IF NOT EXISTS "studentName" TEXT,
                ADD COLUMN IF NOT EXISTS "internshipTitle" TEXT,
                ADD COLUMN IF NOT EXISTS "courseId" TEXT,
                ADD COLUMN IF NOT EXISTS "courseTitle" TEXT,
                ADD COLUMN IF NOT EXISTS "certificateUrl" TEXT,
                ADD COLUMN IF NOT EXISTS "issuedBy" TEXT,
                ADD COLUMN IF NOT EXISTS marks INTEGER,
                ADD COLUMN IF NOT EXISTS grade TEXT,
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ
        `;
        ensured = true;
    } catch (error) {
        console.error('ensureLifecycleSchema failed:', error);
    }
}

let userColumnsEnsured = false;
export async function ensureUserColumns() {
    if (userColumnsEnsured) return;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`.catch(() => {});
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "collegeName" TEXT`.catch(() => {});
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS course TEXT`.catch(() => {});
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "enrollmentNumber" TEXT`.catch(() => {});
    userColumnsEnsured = true;
}

export function gradeFor(marks: number): string {
    const pct = (marks / 50) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
}

export interface Progress {
    totalTasks: number;
    tasksCompleted: number;
    totalPoints: number;
}

export async function getProgress(userId: any, internshipId: any): Promise<Progress> {
    const uid = String(userId);
    const iid = String(internshipId);
    try {
        const rows = await sql`
            SELECT
                (SELECT COUNT(*) FROM tasks t
                    WHERE t."internshipId"::text = ${iid} AND t."isActive" = true)::int AS "totalTasks",
                (SELECT COUNT(DISTINCT s."taskId") FROM submissions s
                    JOIN tasks t ON t.id::text = s."taskId"::text
                    WHERE t."internshipId"::text = ${iid} AND t."isActive" = true
                      AND s."studentId"::text = ${uid} AND s.status = 'approved')::int AS "tasksCompleted",
                (SELECT COALESCE(SUM(COALESCE(s."pointsAwarded", t.points, 0)), 0) FROM submissions s
                    JOIN tasks t ON t.id::text = s."taskId"::text
                    WHERE t."internshipId"::text = ${iid} AND t."isActive" = true
                      AND s."studentId"::text = ${uid} AND s.status = 'approved')::int AS "totalPoints"
        `;
        const r = rows[0] || {};
        return {
            totalTasks: Number(r.totalTasks) || 0,
            tasksCompleted: Number(r.tasksCompleted) || 0,
            totalPoints: Number(r.totalPoints) || 0,
        };
    } catch (error) {
        console.error('getProgress failed:', error);
        return { totalTasks: 0, tasksCompleted: 0, totalPoints: 0 };
    }
}

export type CompletionStatus = 'not_requested' | 'pending_review' | 'reviewed' | 'certificate_issued';

export function completionStatusOf(e: any): CompletionStatus {
    if (e.certificateId) return 'certificate_issued';
    if (e.status === 'completed') return 'reviewed';
    if (e.status === 'completion_requested') return 'pending_review';
    return 'not_requested';
}

/** Shape the student pages read for the "Internship Completion" card. */
export function completionState(e: any, p: Progress) {
    const completionStatus = completionStatusOf(e);
    return {
        completionRequested: completionStatus !== 'not_requested',
        completionStatus,
        tasksCompleted: p.tasksCompleted,
        totalTasks: p.totalTasks,
        totalPoints: p.totalPoints,
        marks: e.marks ?? undefined,
        adminFeedback: e.feedback ?? undefined,
        reviewedAt: e.reviewedAt ?? undefined,
        certificateId: e.certificateId ?? undefined,
        completionLetterGenerated: e.status === 'completed' || !!e.certificateId,
    };
}

export function withdrawalState(e: any) {
    return {
        withdrawalRequested: !!e.withdrawalRequested,
        withdrawalStatus: e.withdrawalStatus || 'not_requested',
        withdrawalRequestedAt: e.withdrawalRequestedAt ?? undefined,
        withdrawalReason: e.withdrawalReason ?? undefined,
        withdrawalAdminNote: e.withdrawalAdminNote ?? undefined,
    };
}

function code(len = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/** Issues (or returns the existing) internship certificate for a completed enrollment. */
export async function issueCertificate(enrollmentId: string): Promise<{ cert: any } | { error: string; status: number }> {
    await ensureLifecycleSchema();
    const rows = await sql`
        SELECT e.*, u.name as "studentName", i.title as "internshipTitle"
        FROM enrollment_requests e
        LEFT JOIN users u ON u.id::text = e."userId"::text
        LEFT JOIN internships i ON i.id::text = e."internshipId"::text
        WHERE e.id::text = ${String(enrollmentId)}
        LIMIT 1
    `;
    if (!rows || rows.length === 0) return { error: 'Enrollment not found', status: 404 };
    const e = rows[0];
    if (e.status !== 'completed') return { error: 'Review the internship and assign marks before issuing a certificate', status: 422 };

    const uid = String(e.userId);
    const iid = String(e.internshipId);

    const existing = await sql`
        SELECT * FROM certificates
        WHERE "studentId"::text = ${uid} AND "internshipId"::text = ${iid} AND type = 'internship'
        LIMIT 1
    `;
    let cert = existing && existing[0];

    if (!cert) {
        const marks = e.marks ?? null;
        const created = await sql`
            INSERT INTO certificates (
                "studentId", "studentName", "internshipId", "internshipTitle", type,
                "verificationCode", "issueDate", marks, grade, "issuedBy", status, created_at, updated_at
            ) VALUES (
                ${uid}, ${e.studentName || ''}, ${iid}, ${e.internshipTitle || ''}, 'internship',
                ${`CERT-${new Date().getFullYear()}-${code(8)}`}, NOW(), ${marks},
                ${marks !== null ? gradeFor(Number(marks)) : null}, 'CodeSprint Labs', 'active', NOW(), NOW()
            )
            RETURNING *
        `;
        cert = created[0];
    }

    await sql`
        UPDATE enrollment_requests
        SET "certificateId" = ${String(cert.id)}, updated_at = NOW()
        WHERE id::text = ${String(enrollmentId)}
    `;

    await sql`
        INSERT INTO notifications ("userId", title, message, type, "isRead", "createdAt")
        VALUES (${uid}, 'Certificate Issued', ${`Your certificate for ${e.internshipTitle || 'your internship'} is ready to download.`}, 'certificate', false, NOW())
    `.catch(() => {});

    return { cert };
}

export interface ReviewQuery {
    enrollmentId?: string;
    internshipId?: string;
    statuses: string[];
}

function toReview(row: any) {
    const marks = row.marks !== null && row.marks !== undefined ? Number(row.marks) : null;
    return {
        id: String(row.id),
        _id: String(row.id),
        userId: String(row.userId),
        internshipId: String(row.internshipId),
        studentName: row.studentName || '',
        studentEmail: row.studentEmail || '',
        studentAvatar: row.studentAvatar || null,
        studentCollegeName: row.studentCollegeName || undefined,
        internshipTitle: row.internshipTitle || '',
        internshipDomain: row.internshipDomain || '',
        internshipDuration: row.internshipDuration || '',
        enrollmentStatus: row.status,
        completionStatus: completionStatusOf(row),
        completionRequestedAt: row.completionRequestedAt || row.updated_at || row.created_at,
        tasksCompleted: Number(row.tasksCompleted) || 0,
        totalTasks: Number(row.totalTasks) || 0,
        totalPoints: Number(row.totalPoints) || 0,
        marks,
        grade: marks !== null ? gradeFor(marks) : null,
        adminFeedback: row.feedback ?? null,
        reviewedAt: row.reviewedAt ?? null,
        certificateId: row.certificateId ?? null,
    };
}

/** Enrollments in the given statuses, each with student/internship info and task progress, in the shape the admin pages read. */
export async function loadReviews(q: ReviewQuery) {
    await ensureLifecycleSchema();
    await ensureUserColumns();
    const eid = q.enrollmentId ?? null;
    const iid = q.internshipId ?? null;
    const rows = await sql`
        SELECT e.id, e."userId", e."internshipId", e.status, e.marks, e.feedback, e."reviewedAt",
            e."certificateId", e."completionRequestedAt", e.updated_at, e.created_at,
            u.name as "studentName", u.email as "studentEmail", u.avatar as "studentAvatar",
            u."collegeName" as "studentCollegeName",
            i.title as "internshipTitle", i.domain as "internshipDomain", i.duration as "internshipDuration",
            (SELECT COUNT(*) FROM tasks t
                WHERE t."internshipId"::text = e."internshipId"::text AND t."isActive" = true)::int AS "totalTasks",
            (SELECT COUNT(DISTINCT s."taskId") FROM submissions s
                JOIN tasks t ON t.id::text = s."taskId"::text
                WHERE t."internshipId"::text = e."internshipId"::text AND t."isActive" = true
                  AND s."studentId"::text = e."userId"::text AND s.status = 'approved')::int AS "tasksCompleted",
            (SELECT COALESCE(SUM(COALESCE(s."pointsAwarded", t.points, 0)), 0) FROM submissions s
                JOIN tasks t ON t.id::text = s."taskId"::text
                WHERE t."internshipId"::text = e."internshipId"::text AND t."isActive" = true
                  AND s."studentId"::text = e."userId"::text AND s.status = 'approved')::int AS "totalPoints"
        FROM enrollment_requests e
        LEFT JOIN users u ON u.id::text = e."userId"::text
        LEFT JOIN internships i ON i.id::text = e."internshipId"::text
        WHERE e.status = ANY(${q.statuses})
          AND (${eid}::text IS NULL OR e.id::text = ${eid}::text)
          AND (${iid}::text IS NULL OR e."internshipId"::text = ${iid}::text)
        ORDER BY COALESCE(e."completionRequestedAt", e.updated_at, e.created_at) DESC NULLS LAST
    `;
    return rows.map(toReview);
}

/** Records the admin's marks + feedback and marks the internship completed (which unlocks the completion letter). */
export async function reviewEnrollment(
    enrollmentId: string,
    marksInput: any,
    feedback: string | null,
    fromStatuses: string[]
): Promise<{ ok: true } | { error: string; status: number }> {
    await ensureLifecycleSchema();
    const marks = Number(marksInput);
    if (!Number.isInteger(marks) || marks < 0 || marks > 50) {
        return { error: 'Marks must be a whole number between 0 and 50', status: 422 };
    }

    const rows = await sql`SELECT * FROM enrollment_requests WHERE id::text = ${String(enrollmentId)} LIMIT 1`;
    if (!rows || rows.length === 0) return { error: 'Enrollment not found', status: 404 };
    const e = rows[0];
    if (!fromStatuses.includes(e.status)) {
        return { error: `This enrollment cannot be reviewed while it is ${e.status}`, status: 422 };
    }

    await sql`
        UPDATE enrollment_requests SET
            status = 'completed', marks = ${marks}, feedback = ${feedback || null},
            "reviewedAt" = NOW(), updated_at = NOW()
        WHERE id::text = ${String(enrollmentId)}
    `;

    if (e.certificateId) {
        await sql`
            UPDATE certificates SET marks = ${marks}, grade = ${gradeFor(marks)}, updated_at = NOW()
            WHERE id::text = ${String(e.certificateId)}
        `.catch(() => {});
    }

    await sql`
        INSERT INTO notifications ("userId", title, message, type, "isRead", "createdAt")
        VALUES (${String(e.userId)}, 'Internship Reviewed', 'Your internship has been reviewed. Your completion letter is ready to download.', 'completion', false, NOW())
    `.catch(() => {});

    return { ok: true };
}
