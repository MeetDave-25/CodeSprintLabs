import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { DOC_STATUSES, ensureLifecycleSchema, gradeFor } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await ensureLifecycleSchema();

        const rows = await sql`
            SELECT
                e.id, e.status, e."approvedAt", e."startDate", e."endDate",
                e.marks, e."reviewedAt", e."certificateId",
                e."withdrawalStatus", e."withdrawalApprovedAt", e."withdrawalReason",
                i.title as "internshipTitle", i.domain as "internshipDomain"
            FROM enrollment_requests e
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e."userId"::text = ${String(authUser.id)}
              AND e.status = ANY(${DOC_STATUSES})
            ORDER BY e."approvedAt" DESC NULLS LAST, e.created_at DESC
        `;

        const data = rows.map((e: any) => {
            const isWithdrawn = e.status === 'withdrawn' && e.withdrawalStatus === 'approved';
            const reviewed = e.status === 'completed';
            const completionStatus = isWithdrawn
                ? 'withdrawn'
                : e.certificateId
                ? 'certificate_issued'
                : reviewed
                ? 'reviewed'
                : e.status === 'completion_requested'
                ? 'pending_review'
                : 'not_requested';
            const marks = e.marks !== null && e.marks !== undefined ? Number(e.marks) : null;

            return {
                id: String(e.id),
                internshipTitle: e.internshipTitle,
                internshipDomain: e.internshipDomain,
                approvedAt: e.approvedAt,
                startDate: e.startDate,
                endDate: e.endDate,
                hasMOU: true,
                hasOfferLetter: true,
                completionStatus,
                hasCompletionLetter: reviewed,
                marks,
                grade: marks !== null ? gradeFor(marks) : null,
                reviewedAt: e.reviewedAt,
                certificateId: e.certificateId ?? null,
                hasCertificate: !!e.certificateId,
                isWithdrawn,
                withdrawalApprovedAt: e.withdrawalApprovedAt,
                withdrawalReason: e.withdrawalReason,
                hasPartialCompletionLetter: isWithdrawn,
                hasRelievingLetter: isWithdrawn,
            };
        });

        return NextResponse.json({ status: 'success', data });
    } catch (error: any) {
        console.error('GET /api/student/documents error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
