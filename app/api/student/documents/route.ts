import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT
                e.id,
                e.status,
                e."approvedAt",
                e."startDate",
                e."endDate",
                e."mouGenerated" as "hasMOU",
                e."offerLetterGenerated" as "hasOfferLetter",
                i.title as "internshipTitle",
                i.domain as "internshipDomain",
                cr.status as "completionStatus",
                cr."hasCompletionLetter",
                cr.marks,
                cr.grade,
                cr."reviewedAt",
                cr."certificateId",
                (cr."certificateId" IS NOT NULL) as "hasCertificate",
                wr."approvedAt" as "withdrawalApprovedAt",
                wr.reason as "withdrawalReason",
                (wr.id IS NOT NULL AND wr.status = 'approved') as "isWithdrawn",
                wr."hasPartialCompletionLetter",
                wr."hasRelievingLetter"
            FROM enrollment_requests e
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            LEFT JOIN completion_reviews cr ON cr."enrollmentId"::text = e.id::text
            LEFT JOIN withdrawal_requests wr ON wr."enrollmentId"::text = e.id::text AND wr.status = 'approved'
            WHERE e."userId" = ${authUser.id}
              AND e.status = 'approved'
            ORDER BY e."approvedAt" DESC
        `;

        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        console.error('GET /api/student/documents error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
