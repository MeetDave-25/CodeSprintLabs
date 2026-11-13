import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { buildPdf, PdfSection } from '@/lib/pdf-generator';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { enrollmentId: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT e.*,
                u.name as "studentName", u.email as "studentEmail",
                u.phone as "studentPhone",
                i.title as "internshipTitle", i.domain as "internshipDomain",
                i.duration as "internshipDuration"
            FROM enrollment_requests e
            LEFT JOIN users u ON u.id::text = e."userId"::text
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e.id = ${params.enrollmentId}
              AND e."userId" = ${authUser.id}
              AND e.status = 'approved'
            LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Enrollment not found or not approved' }, { status: 404 });
        }

        const e = rows[0];
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        const startDate = e.startDate ? new Date(e.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : today;
        const endDate = e.endDate ? new Date(e.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD';

        const sections: PdfSection[] = [
            { type: 'title', text: 'MEMORANDUM OF UNDERSTANDING (MOU)' },
            { type: 'body', text: `This Memorandum of Understanding is entered into on ${today} between:` },
            { type: 'spacer' },
            { type: 'heading', text: 'PARTY 1 - Organization' },
            { type: 'kv', key: 'Name', value: 'CodeSprint Labs' },
            { type: 'kv', key: 'Address', value: 'Ahmedabad, Gujarat, India' },
            { type: 'kv', key: 'Email', value: 'codesprintlabs@gmail.com' },
            { type: 'spacer' },
            { type: 'heading', text: 'PARTY 2 - Intern' },
            { type: 'kv', key: 'Name', value: e.studentName || '' },
            { type: 'kv', key: 'Email', value: e.studentEmail || '' },
            ...(e.studentPhone ? [{ type: 'kv' as const, key: 'Phone', value: e.studentPhone }] : []),
            { type: 'divider' },
            { type: 'heading', text: 'INTERNSHIP DETAILS' },
            { type: 'kv', key: 'Program', value: e.internshipTitle || '' },
            { type: 'kv', key: 'Domain', value: e.internshipDomain || '' },
            { type: 'kv', key: 'Duration', value: e.internshipDuration || '' },
            { type: 'kv', key: 'Start Date', value: startDate },
            { type: 'kv', key: 'End Date', value: endDate },
            { type: 'divider' },
            { type: 'heading', text: 'TERMS AND CONDITIONS' },
            { type: 'body', text: '1. The intern agrees to complete all assigned tasks diligently and on time during the internship period.' },
            { type: 'body', text: '2. CodeSprint Labs agrees to provide structured learning, mentorship, and task reviews throughout the program.' },
            { type: 'body', text: '3. The intern will maintain confidentiality of any proprietary information shared during the program.' },
            { type: 'body', text: '4. Upon successful completion, CodeSprint Labs will issue an Internship Completion Certificate.' },
            { type: 'body', text: '5. This MOU is non-transferable and applies solely to the intern named above.' },
            { type: 'spacer' },
            { type: 'divider' },
            { type: 'heading', text: 'SIGNATURES' },
            { type: 'spacer' },
            { type: 'kv', key: 'For CodeSprint Labs', value: 'Authorized Signatory' },
            { type: 'kv', key: 'Intern', value: e.studentName || '' },
            { type: 'spacer' },
            { type: 'body', text: `Date: ${today}` },
        ];

        const pdfBuffer = buildPdf(sections, 'MOU');
        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="MOU_${(e.studentName || 'student').replace(/\s+/g, '_')}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('GET /api/student/documents/[enrollmentId]/mou error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
