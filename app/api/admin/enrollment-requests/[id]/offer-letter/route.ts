import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { buildPdf, PdfSection } from '@/lib/pdf-generator';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
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
            WHERE e.id = ${params.id} AND e.status = 'approved'
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
            { type: 'title', text: 'INTERNSHIP OFFER LETTER' },
            { type: 'spacer' },
            { type: 'body', text: `Date: ${today}` },
            { type: 'spacer' },
            { type: 'body', text: `Dear ${e.studentName || 'Candidate'},` },
            { type: 'spacer' },
            { type: 'body', text: `We are pleased to offer you an internship position at CodeSprint Labs. After reviewing your application, we are delighted to invite you to join our ${e.internshipTitle || 'internship'} program.` },
            { type: 'spacer' },
            { type: 'heading', text: 'INTERNSHIP DETAILS' },
            { type: 'kv', key: 'Program Title', value: e.internshipTitle || '' },
            { type: 'kv', key: 'Domain', value: e.internshipDomain || '' },
            { type: 'kv', key: 'Duration', value: e.internshipDuration || '' },
            { type: 'kv', key: 'Start Date', value: startDate },
            { type: 'kv', key: 'End Date', value: endDate },
            { type: 'kv', key: 'Mode', value: 'Remote / Online' },
            { type: 'kv', key: 'Stipend', value: 'Non-paid (Learning-focused)' },
            { type: 'divider' },
            { type: 'heading', text: 'WHAT WE OFFER' },
            { type: 'body', text: '- Structured weekly tasks designed by experienced practitioners' },
            { type: 'body', text: '- Mentor review and feedback on every submission' },
            { type: 'body', text: '- Internship Completion Certificate upon successful completion' },
            { type: 'body', text: '- Access to CodeSprint Labs learning platform throughout the program' },
            { type: 'divider' },
            { type: 'heading', text: 'EXPECTATIONS' },
            { type: 'body', text: '- Complete all assigned tasks within the given deadlines' },
            { type: 'body', text: '- Maintain professional conduct and communication' },
            { type: 'body', text: '- Notify us promptly if you are unable to continue the program' },
            { type: 'spacer' },
            { type: 'body', text: 'We look forward to welcoming you to the CodeSprint Labs community. Please confirm your acceptance by logging into the platform and proceeding with your first task.' },
            { type: 'spacer' },
            { type: 'body', text: 'Warm regards,' },
            { type: 'spacer' },
            { type: 'subheading', text: 'Parth D. Joshi' },
            { type: 'body', text: 'Founder & CEO, CodeSprint Labs' },
            { type: 'body', text: 'codesprintlabs@gmail.com | Ahmedabad, Gujarat, India' },
        ];

        const pdfBuffer = buildPdf(sections, 'Offer Letter');
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Offer_Letter_${(e.studentName || 'student').replace(/\s+/g, '_')}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('GET /api/admin/enrollment-requests/[id]/offer-letter error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}
