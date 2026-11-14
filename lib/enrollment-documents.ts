import sql from '@/lib/db';
import { PdfDoc, CYAN, MUTED, INK } from '@/lib/pdf-generator';
import {
    DOC_STATUSES, ensureLifecycleSchema, ensureUserColumns, getProgress, gradeFor, Progress,
} from '@/lib/enrollment-lifecycle';

export interface FetchOpts {
    userId?: string;
    statuses?: string[];
    progress?: boolean;
}

/** Loads an enrollment with student + internship details (and optionally task progress) for document generation. */
export async function fetchEnrollment(enrollmentId: string, opts: FetchOpts = {}): Promise<any | null> {
    await ensureLifecycleSchema();
    await ensureUserColumns();
    const statuses = opts.statuses ?? DOC_STATUSES;
    const userId = opts.userId ?? null;
    const rows = await sql`
        SELECT e.*,
            COALESCE(NULLIF(u.name, ''), e."studentName") as "studentName",
            COALESCE(NULLIF(u.email, ''), e."studentEmail") as "studentEmail",
            COALESCE(NULLIF(u.phone, ''), e."studentPhone") as "studentPhone",
            COALESCE(NULLIF(u."collegeName", ''), e."studentCollegeName") as "studentCollege",
            COALESCE(NULLIF(u.course, ''), e."studentCourse") as "studentCourse",
            COALESCE(NULLIF(u."enrollmentNumber", ''), e."studentEnrollmentNumber") as "studentEnrollmentNo",
            COALESCE(i.title, e."internshipTitle") as "internshipTitle",
            COALESCE(i.domain, e."internshipDomain") as "internshipDomain",
            COALESCE(i.duration, e."internshipDuration") as "internshipDuration", i.type as "internshipType",
            i.location as "internshipLocation", i.stipend as "internshipStipend",
            i.responsibilities as "internshipResponsibilities", i.skills as "internshipSkills"
        FROM enrollment_requests e
        LEFT JOIN users u ON u.id::text = e."userId"::text
        LEFT JOIN internships i ON i.id::text = e."internshipId"::text
        WHERE e.id::text = ${String(enrollmentId)}
          AND e.status = ANY(${statuses})
          AND (${userId}::text IS NULL OR e."userId"::text = ${userId}::text)
        LIMIT 1
    `;
    if (!rows || rows.length === 0) return null;
    const e = rows[0];
    if (opts.progress) e.progress = await getProgress(e.userId, e.internshipId);
    return e;
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

function refNo(e: any, kind = 'INT'): string {
    const year = new Date(e.approvedAt || e.created_at || Date.now()).getFullYear();
    const tail = e.studentEnrollmentNo || String(e.id).replace(/-/g, '').slice(0, 8).toUpperCase();
    return `CSL/${kind}/${year}/${tail}`;
}

function studentBlock(doc: PdfDoc, e: any, compact = false) {
    doc.text((e.studentName || 'Intern').toUpperCase(), { size: 12.5, bold: true, gap: 1 });
    if (e.studentCollege) doc.text(e.studentCollege, { gap: 0 });
    if (e.studentCourse) doc.text(e.studentCourse, { gap: 0 });
    if (compact) return;
    if (e.studentEnrollmentNo) doc.text(`Enrollment No: ${e.studentEnrollmentNo}`, { gap: 0 });
    if (e.studentEmail) doc.text(`Email: ${e.studentEmail}`, { gap: 0 });
    if (e.studentPhone) doc.text(`Phone: ${e.studentPhone}`, { gap: 0 });
}

const COMPUTER_FOOTER = [
    'This is a computer-generated document and does not require a physical signature from CodeSprint Labs.',
    'For queries: codesprintlabs@gmail.com  |  +91-8160901481',
];

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

    doc.footer(COMPUTER_FOOTER);
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
        ['Email', 'codesprintlabs@gmail.com'],
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
        'For queries: codesprintlabs@gmail.com  |  +91-8160901481',
    ]);
    return doc.build();
}

const pctOf = (p: Progress) => (p.totalTasks > 0 ? Math.round((p.tasksCompleted / p.totalTasks) * 100) : 0);

/** Data shape used by the on-screen completion-letter previews (student + admin). */
export function completionLetterData(e: any) {
    const p: Progress = e.progress || { totalTasks: 0, tasksCompleted: 0, totalPoints: 0 };
    const marks = e.marks !== null && e.marks !== undefined ? Number(e.marks) : null;
    return {
        available: e.status === 'completed',
        issueDate: fmt(e.reviewedAt || new Date()),
        studentName: e.studentName || '',
        studentCollegeName: e.studentCollege || 'N/A',
        startDate: fmt(e.startDate, 'N/A'),
        endDate: fmt(e.endDate, 'N/A'),
        internshipTitle: e.internshipTitle || '',
        internshipDomain: e.internshipDomain || '',
        marks: marks ?? 0,
        maxMarks: 50,
        grade: marks !== null ? gradeFor(marks) : '-',
        tasksCompleted: p.tasksCompleted,
        totalTasks: p.totalTasks,
        totalPoints: p.totalPoints,
        percentage: marks !== null ? Math.round((marks / 50) * 100) : pctOf(p),
        reviewedAt: fmt(e.reviewedAt, 'N/A'),
        adminFeedback: e.feedback || '',
    };
}

export function buildCompletionLetterPdf(e: any): Buffer<ArrayBuffer> {
    const d = completionLetterData(e);
    const doc = new PdfDoc();

    doc.letterhead();
    doc.text(`Date: ${d.issueDate}`, { gap: 0 });
    doc.text(`Ref No: ${refNo(e, 'CMP')}`, { gap: 12 });

    doc.text('INTERNSHIP COMPLETION LETTER', { size: 14, bold: true, align: 'center', underline: true, gap: 10 });
    doc.text('To Whom It May Concern,', { size: 11.5, gap: 6 });
    doc.text(
        `This is to certify that ${d.studentName}${d.studentCollegeName !== 'N/A' ? ` from ${d.studentCollegeName}` : ''} has successfully completed the internship program at CodeSprint Labs.`,
        { align: 'justify', gap: 6 }
    );
    doc.text(
        `During the internship period from ${d.startDate} to ${d.endDate}, the intern was engaged in the ${d.internshipTitle} program${d.internshipDomain ? ` under the ${d.internshipDomain} domain` : ''}.`,
        { align: 'justify', gap: 10 }
    );

    if (e.marks !== null && e.marks !== undefined) {
        doc.highlight(d.grade, `${d.marks} / ${d.maxMarks} Marks`);
    }
    doc.box('Performance Summary', [
        ['Tasks Completed', `${d.tasksCompleted} / ${d.totalTasks}`],
        ['Total Points', String(d.totalPoints)],
        ['Percentage', `${d.percentage}%`],
        ['Review Date', d.reviewedAt],
    ]);

    if (d.adminFeedback) {
        doc.heading("Supervisor's Remarks:", 11);
        doc.text(d.adminFeedback, { align: 'justify', gap: 8 });
    }

    doc.text('We appreciate the dedication shown during the program and wish the intern every success in future endeavours.', { align: 'justify', gap: 14 });
    doc.text('Sincerely,', { size: 11.5, gap: 18 });
    doc.text('CodeSprint Labs', { size: 12, bold: true, gap: 0 });
    doc.text('Human Resources Department', { gap: 4 });

    doc.footer(COMPUTER_FOOTER);
    return doc.build();
}

export function buildCertificatePdf(cert: any, e?: any): Buffer<ArrayBuffer> {
    const doc = new PdfDoc({ landscape: true });
    const { pw } = doc;
    const accent: [number, number, number] = [0.0, 0.45, 0.62];

    const name = cert.studentName || e?.studentName || 'Student';
    const program = cert.internshipTitle || cert.courseTitle || e?.internshipTitle || 'Program';
    const marks = cert.marks !== null && cert.marks !== undefined ? Number(cert.marks) : null;
    const grade = cert.grade || (marks !== null ? gradeFor(marks) : null);

    doc.frame(CYAN, 24, 3);
    doc.frame([0.8, 0.85, 0.9], 32, 0.8);

    doc.centerText('CodeSprint Labs', 500, 30, true, CYAN);
    doc.centerText('Empowering Future Tech Leaders', 482, 11, false, MUTED);

    doc.centerText('CERTIFICATE OF COMPLETION', 432, 26, true, INK);
    doc.hline(pw / 2 - 120, pw / 2 + 120, 420, CYAN, 1.6);

    doc.centerText('This is to certify that', 390, 13, false, MUTED);
    const nameSize = doc.fitSize(name, 640, 34, true, 18);
    doc.centerText(name, 348, nameSize, true, accent);
    doc.hline(pw / 2 - 260, pw / 2 + 260, 338, INK, 0.8);

    doc.centerText('has successfully completed the internship program', 312, 13, false, INK);
    const progSize = doc.fitSize(program, 700, 20, true, 12);
    doc.centerText(program, 282, progSize, true, INK);

    const details = [
        e?.internshipDomain ? `Domain: ${e.internshipDomain}` : '',
        e?.internshipDuration ? `Duration: ${e.internshipDuration}` : '',
    ].filter(Boolean).join('   |   ');
    if (details) doc.centerText(details, 258, 11, false, MUTED);
    if (e?.startDate && e?.endDate) {
        doc.centerText(`Internship Period: ${fmt(e.startDate)} to ${fmt(e.endDate)}`, 242, 11, false, MUTED);
    }
    if (marks !== null && grade) {
        doc.centerText(`Grade: ${grade}   |   Marks: ${marks} / 50`, 214, 13, true, INK);
    }

    doc.leftText(`Date of Issue: ${fmt(cert.issueDate || new Date())}`, 90, 128, 10.5, false, INK);
    doc.hline(pw - 290, pw - 90, 128, INK, 0.8);
    doc.leftText('Authorized Signatory', pw - 240, 112, 10.5, true, INK);
    doc.leftText('CodeSprint Labs', pw - 232, 98, 10, false, MUTED);

    doc.centerText(`Certificate ID: ${cert.verificationCode || '-'}`, 70, 10, true, MUTED);
    doc.centerText('Verify this certificate using the Certificate ID above on the CodeSprint Labs website.', 56, 9, false, MUTED);
    return doc.build();
}

export function buildPartialCompletionPdf(e: any): Buffer<ArrayBuffer> {
    const p: Progress = e.progress || { totalTasks: 0, tasksCompleted: 0, totalPoints: 0 };
    const doc = new PdfDoc();
    const name = e.studentName || 'Intern';
    const left = e.withdrawalApprovedAt || new Date();

    doc.letterhead();
    doc.text(`Date: ${fmt(left)}`, { gap: 0 });
    doc.text(`Ref No: ${refNo(e, 'PCL')}`, { gap: 12 });

    doc.text('PARTIAL COMPLETION LETTER', { size: 14, bold: true, align: 'center', underline: true, gap: 10 });
    doc.text('To Whom It May Concern,', { size: 11.5, gap: 6 });
    doc.text(
        `This is to certify that ${name}${e.studentCollege ? ` from ${e.studentCollege}` : ''} was enrolled in the ${e.internshipTitle || 'internship'} program${e.internshipDomain ? ` (${e.internshipDomain})` : ''} at CodeSprint Labs from ${fmt(e.startDate, 'the date of enrollment')} and participated in the program until ${fmt(left)}, when the withdrawal request was accepted.`,
        { align: 'justify', gap: 10 }
    );

    doc.box('Participation Summary', [
        ['Program', e.internshipTitle || '-'],
        ['Domain', e.internshipDomain || '-'],
        ['Enrolled On', fmt(e.startDate, 'N/A')],
        ['Withdrawn On', fmt(left)],
        ['Tasks Completed', `${p.tasksCompleted} / ${p.totalTasks}`],
        ['Points Earned', String(p.totalPoints)],
        ['Progress', `${pctOf(p)}%`],
    ]);

    doc.text(
        'This letter records the intern\'s partial participation only. As the program was not completed in full, no Internship Completion Certificate has been issued.',
        { align: 'justify', gap: 6 }
    );
    doc.text('We thank the intern for the time and effort contributed and wish them success in future endeavours.', { align: 'justify', gap: 14 });
    doc.text('Sincerely,', { size: 11.5, gap: 18 });
    doc.text('CodeSprint Labs', { size: 12, bold: true, gap: 0 });
    doc.text('Human Resources Department', { gap: 4 });

    doc.footer(COMPUTER_FOOTER);
    return doc.build();
}

export function buildRelievingLetterPdf(e: any): Buffer<ArrayBuffer> {
    const doc = new PdfDoc();
    const name = e.studentName || 'Intern';
    const effective = e.withdrawalApprovedAt || new Date();

    doc.letterhead();
    doc.text(`Date: ${fmt(effective)}`, { gap: 0 });
    doc.text(`Ref No: ${refNo(e, 'REL')}`, { gap: 10 });
    studentBlock(doc, e, true);
    doc.spacer(10);

    doc.text('RELIEVING LETTER', { size: 14, bold: true, align: 'center', underline: true, gap: 10 });
    doc.text(`Dear ${name},`, { size: 11.5, gap: 6 });
    doc.text(
        `With reference to your request${e.withdrawalRequestedAt ? ` dated ${fmt(e.withdrawalRequestedAt)}` : ''} to withdraw from the ${e.internshipTitle || 'internship'} program, we confirm that your request has been accepted and you stand relieved from your internship responsibilities at CodeSprint Labs with effect from ${fmt(effective)}.`,
        { align: 'justify', gap: 10 }
    );

    doc.box('Relieving Details', [
        ['Position', e.internshipTitle || '-'],
        ['Domain', e.internshipDomain || '-'],
        ['Date of Joining', fmt(e.startDate, 'N/A')],
        ['Relieving Date', fmt(effective)],
    ]);

    doc.heading('Please note:', 11);
    doc.bullets([
        'You are no longer associated with CodeSprint Labs as an intern from the relieving date.',
        'Your obligation to keep all company information and project material confidential continues after relieving.',
        'There are no pending dues from either party in connection with this internship.',
    ]);

    doc.spacer(4);
    doc.text('We thank you for your time at CodeSprint Labs and wish you the very best for your future.', { gap: 14 });
    doc.text('Sincerely,', { size: 11.5, gap: 18 });
    doc.text('CodeSprint Labs', { size: 12, bold: true, gap: 0 });
    doc.text('Human Resources Department', { gap: 4 });

    doc.footer(COMPUTER_FOOTER);
    return doc.build();
}

export function pdfResponseHeaders(prefix: string, name: string) {
    return {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${prefix}_${String(name || 'student').replace(/[^A-Za-z0-9]+/g, '_')}.pdf"`,
    };
}
