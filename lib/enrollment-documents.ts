import sql from '@/lib/db';
import { PdfDoc } from '@/lib/pdf-generator';

let columnsEnsured = false;
async function ensureUserColumns() {
    if (columnsEnsured) return;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`.catch(() => {});
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "collegeName" TEXT`.catch(() => {});
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS course TEXT`.catch(() => {});
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "enrollmentNumber" TEXT`.catch(() => {});
    columnsEnsured = true;
}

export async function fetchApprovedEnrollment(enrollmentId: string, userId?: string): Promise<any | null> {
    await ensureUserColumns();
    const rows = await sql`
        SELECT e.*,
            u.name as "studentName", u.email as "studentEmail", u.phone as "studentPhone",
            u."collegeName" as "studentCollege", u.course as "studentCourse",
            u."enrollmentNumber" as "studentEnrollmentNo",
            i.title as "internshipTitle", i.domain as "internshipDomain",
            i.duration as "internshipDuration", i.type as "internshipType",
            i.location as "internshipLocation", i.stipend as "internshipStipend",
            i.responsibilities as "internshipResponsibilities", i.skills as "internshipSkills"
        FROM enrollment_requests e
        LEFT JOIN users u ON u.id::text = e."userId"::text
        LEFT JOIN internships i ON i.id::text = e."internshipId"::text
        WHERE e.id::text = ${String(enrollmentId)}
          AND e.status = 'approved'
          AND (${userId ?? null}::text IS NULL OR e."userId"::text = ${userId ?? null}::text)
        LIMIT 1
    `;
    return rows && rows.length ? rows[0] : null;
}

const fmt = (d: any, fallback = 'TBD') =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : fallback;

function toList(v: any): string[] {
    if (!v) return [];
    let arr: any = v;
    if (typeof v === 'string') {
        try { arr = JSON.parse(v); } catch { arr = v.split(/\r?\n|,/); }
    }
    return Array.isArray(arr) ? arr.map((s) => String(s).trim()).filter(Boolean) : [];
}

function refNo(e: any): string {
    const year = new Date(e.approvedAt || e.created_at || Date.now()).getFullYear();
    const tail = e.studentEnrollmentNo || String(e.id).replace(/-/g, '').slice(0, 8).toUpperCase();
    return `CSL/INT/${year}/${tail}`;
}

function studentBlock(doc: PdfDoc, e: any) {
    doc.text((e.studentName || 'Intern').toUpperCase(), { size: 12.5, bold: true, gap: 1 });
    if (e.studentCollege) doc.text(e.studentCollege, { gap: 0 });
    if (e.studentCourse) doc.text(e.studentCourse, { gap: 0 });
    if (e.studentEnrollmentNo) doc.text(`Enrollment No: ${e.studentEnrollmentNo}`, { gap: 0 });
    if (e.studentEmail) doc.text(`Email: ${e.studentEmail}`, { gap: 0 });
    if (e.studentPhone) doc.text(`Phone: ${e.studentPhone}`, { gap: 0 });
}

export function buildOfferLetterPdf(e: any): Buffer<ArrayBuffer> {
    const doc = new PdfDoc();
    const title = e.internshipTitle || 'Internship';
    const name = e.studentName || 'Candidate';
    const start = fmt(e.startDate, 'To be confirmed');

    doc.letterhead();
    doc.text(`Date: ${fmt(e.approvedAt || new Date())}`, { gap: 0 });
    doc.text(`Ref No: ${refNo(e)}`, { gap: 10 });
    studentBlock(doc, e);
    doc.spacer(10);

    doc.text(`OFFER LETTER - ${title}`, { size: 13.5, bold: true, align: 'center', underline: true, gap: 8 });
    doc.text(`Dear ${name},`, { size: 11.5, gap: 6 });
    doc.text(
        `We are pleased to inform you that you have been selected for the position of ${title} at CodeSprint Labs. This is in reference to your application for the internship program.`,
        { align: 'justify', gap: 6 }
    );
    doc.text(
        'We were impressed by your academic credentials, technical skills, and enthusiasm. We believe you will be a valuable addition to our team and that this internship will give you excellent learning opportunities in the field of technology.',
        { align: 'justify', gap: 10 }
    );

    doc.box('Internship Details', [
        ['Position', title],
        ['Duration', e.internshipDuration || 'As per program'],
        ['Type', e.internshipType || 'Remote'],
        ['Stipend', e.internshipStipend ? String(e.internshipStipend) : 'Unpaid'],
        ['Expected Start Date', start],
        ['End Date', fmt(e.endDate)],
        ['Location', e.internshipLocation || 'Ahmedabad'],
    ]);

    const resp = toList(e.internshipResponsibilities);
    if (resp.length) {
        doc.heading('Key Responsibilities:', 11);
        doc.bullets(resp);
    }
    const skills = toList(e.internshipSkills);
    if (skills.length) {
        doc.heading('Required Skills:', 11);
        doc.text(skills.join(', '), { align: 'justify', x: 74, gap: 6 });
    }

    doc.heading('Terms and Conditions:', 11);
    doc.numbered([
        'This internship is for a fixed duration as mentioned above.',
        'You will report to the designated mentor/supervisor assigned by CodeSprint Labs.',
        'You are required to maintain confidentiality of all company information and projects.',
        'Regular attendance and timely completion of assigned tasks are expected.',
        'The internship may be terminated by either party with a notice period of 7 days.',
        'A certificate of completion will be provided upon successful completion of the internship.',
        'Outstanding performance may lead to a full-time employment opportunity.',
    ]);

    doc.spacer(4);
    doc.text(`Please confirm your acceptance of this offer by signing and returning a copy of this letter by ${start}.`, { align: 'justify', gap: 6 });
    doc.text('We look forward to your joining and wish you a productive and enriching internship experience.', { gap: 14 });
    doc.text('Sincerely,', { size: 11.5, gap: 18 });
    doc.text('CodeSprint Labs', { size: 12, bold: true, gap: 0 });
    doc.text('Human Resources Department', { gap: 8 });

    doc.rule();
    doc.heading('ACCEPTANCE', 12);
    doc.text(
        `I, ${name}, hereby accept the above offer for the position of ${title} at CodeSprint Labs under the terms and conditions mentioned in this letter.`,
        { gap: 0 }
    );
    doc.signatures('Signature', 'Date');

    doc.footer([
        'This is a computer-generated document and does not require a physical signature from CodeSprint Labs.',
        'For queries: info@codesprintlabs.in  |  +91-8160901481',
    ]);
    return doc.build();
}

export function buildMouPdf(e: any): Buffer<ArrayBuffer> {
    const doc = new PdfDoc();
    const name = e.studentName || 'Intern';

    doc.letterhead();
    doc.text(`Date: ${fmt(e.approvedAt || new Date())}`, { gap: 0 });
    doc.text(`Ref No: ${refNo(e)}`, { gap: 12 });

    doc.text('MEMORANDUM OF UNDERSTANDING (MOU)', { size: 14, bold: true, align: 'center', underline: true, gap: 10 });
    doc.text(`This Memorandum of Understanding is entered into on ${fmt(e.approvedAt || new Date())} between:`, { align: 'justify', gap: 8 });

    doc.box('Party 1 - Organization', [
        ['Name', 'CodeSprint Labs'],
        ['Address', 'Ahmedabad, Gujarat, India'],
        ['Email', 'info@codesprintlabs.in'],
        ['Phone', '+91-8160901481'],
    ]);
    doc.box('Party 2 - Intern', [
        ['Name', name],
        ['Email', e.studentEmail || '-'],
        ...(e.studentPhone ? [['Phone', e.studentPhone] as [string, string]] : []),
        ...(e.studentCollege ? [['College', e.studentCollege] as [string, string]] : []),
        ...(e.studentCourse ? [['Course', e.studentCourse] as [string, string]] : []),
        ...(e.studentEnrollmentNo ? [['Enrollment No', e.studentEnrollmentNo] as [string, string]] : []),
    ]);
    doc.box('Internship Details', [
        ['Program', e.internshipTitle || '-'],
        ['Domain', e.internshipDomain || '-'],
        ['Duration', e.internshipDuration || '-'],
        ['Start Date', fmt(e.startDate, 'To be confirmed')],
        ['End Date', fmt(e.endDate)],
    ]);

    doc.heading('Terms and Conditions:', 11);
    doc.numbered([
        'The intern agrees to complete all assigned tasks diligently and on time during the internship period.',
        'CodeSprint Labs agrees to provide structured learning, mentorship, and task reviews throughout the program.',
        'The intern will maintain confidentiality of any proprietary information shared during the program.',
        'Upon successful completion, CodeSprint Labs will issue an Internship Completion Certificate.',
        'This MOU is non-transferable and applies solely to the intern named above.',
    ]);

    doc.spacer(4);
    doc.rule();
    doc.heading('SIGNATURES', 12);
    doc.signatures('For CodeSprint Labs - Authorized Signatory', `Intern - ${name}`);
    doc.spacer(10);
    doc.text(`Date: ${fmt(new Date())}`, { gap: 0 });

    doc.footer([
        'This is a computer-generated document issued by CodeSprint Labs.',
        'For queries: info@codesprintlabs.in  |  +91-8160901481',
    ]);
    return doc.build();
}
