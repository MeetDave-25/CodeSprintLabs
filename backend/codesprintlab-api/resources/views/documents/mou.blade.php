<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Memorandum of Understanding - {{ $enrollment->studentName }}</title>
    <style>
        @page {
            margin: 0;
        }

        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            font-size: 11pt;
            line-height: 1.6;
        }

        .page {
            padding: 15px 40px 30px 40px;
            min-height: 100%;
        }

        /* Header */
        .header {
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 15px;
        }

        .header-table {
            width: 100%;
        }

        .logo-section {
            vertical-align: middle;
        }

        .logo-box {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 8px 15px;
            border-radius: 8px;
            margin-right: 10px;
            vertical-align: middle;
        }

        .logo-text {
            color: white;
            font-weight: bold;
            font-size: 18pt;
        }

        .company-info {
            display: inline-block;
            vertical-align: middle;
        }

        .company-name {
            margin: 0;
            font-size: 20pt;
            color: #0066cc;
            font-weight: bold;
        }

        .company-tagline {
            margin: 0;
            font-size: 9pt;
            color: #666;
        }

        .header-right {
            vertical-align: middle;
            text-align: right;
            font-size: 8pt;
            color: #666;
        }

        /* Title Section */
        .title-section {
            text-align: center;
            margin: 25px 0;
            padding: 15px;
            background: linear-gradient(90deg, #f0f7ff 0%, #e6f2ff 100%);
            border-radius: 8px;
            border: 1px solid #cce0ff;
        }

        .title-section h2 {
            margin: 0;
            font-size: 18pt;
            color: #0066cc;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .title-section p {
            margin: 5px 0 0 0;
            font-size: 10pt;
            color: #666;
        }

        /* Info Table */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: #fff;
        }

        .info-table th {
            background: #0066cc;
            color: white;
            padding: 10px 15px;
            text-align: left;
            font-size: 10pt;
            font-weight: 600;
        }

        .info-table td {
            padding: 10px 15px;
            border-bottom: 1px solid #eee;
            font-size: 10pt;
        }

        .info-table tr:nth-child(even) td {
            background: #f9fbfd;
        }

        .info-table .label {
            width: 35%;
            font-weight: 600;
            color: #444;
        }

        .info-table .value {
            color: #333;
        }

        /* Two Column Layout */
        .parties-table {
            width: 100%;
            margin: 20px 0;
            border-collapse: separate;
            border-spacing: 10px 0;
        }

        .party-cell {
            width: 48%;
            vertical-align: top;
            padding: 15px;
            background: #f9fbfd;
            border: 1px solid #e0e8f0;
            border-radius: 8px;
        }

        .party-title {
            margin: 0 0 10px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #0066cc;
            color: #0066cc;
            font-size: 11pt;
            font-weight: bold;
        }

        .party-cell p {
            margin: 5px 0;
            font-size: 10pt;
        }

        /* Section */
        .section {
            margin: 20px 0;
        }

        .section-title {
            font-size: 12pt;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e0e8f0;
        }

        .section p {
            text-align: justify;
            margin: 8px 0;
        }

        .section ul {
            margin: 10px 0;
            padding-left: 25px;
        }

        .section li {
            margin: 6px 0;
            text-align: justify;
        }

        /* Highlight Box */
        .highlight-box {
            background: linear-gradient(90deg, #fff5e6 0%, #fff0d9 100%);
            border: 1px solid #ffcc80;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }

        .highlight-box h4 {
            margin: 0 0 10px 0;
            color: #e65100;
        }

        /* Terms Box */
        .terms-box {
            background: #f5f5f5;
            border: 1px solid #ddd;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            font-size: 10pt;
        }

        .terms-box h5 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 11pt;
        }

        .terms-box:nth-of-type(4),
        .terms-box:nth-of-type(8) {
            page-break-inside: avoid;
            page-break-after: avoid;
        }

        /* Signature Section */
        .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
            page-break-after: avoid;
        }

        .signature-table {
            width: 100%;
            margin-top: 20px;
            border-collapse: separate;
            border-spacing: 20px 0;
        }

        .signature-cell {
            width: 45%;
            vertical-align: top;
        }

        .signature-box {
            border: 1px solid #ddd;
            padding: 20px;
            min-height: 100px;
            background: #fafafa;
            border-radius: 5px;
        }

        .signature-box-title {
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 15px;
            font-size: 11pt;
        }

        .signature-line {
            border-bottom: 1px solid #333;
            height: 40px;
            margin: 20px 0 5px 0;
        }

        .signature-label {
            font-size: 9pt;
            color: #666;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #0066cc;
            color: white;
            padding: 10px 40px;
            font-size: 8pt;
            text-align: center;
        }

        .footer p {
            margin: 0;
        }

        /* Watermark */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80pt;
            color: rgba(0, 102, 204, 0.05);
            z-index: -1;
            white-space: nowrap;
        }

        /* Badge */
        .badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 9pt;
            font-weight: bold;
            background: #0066cc;
            color: white;
        }

        .acknowledgment-box {
            margin-top: 30px;
            padding: 15px;
            background: #f0f7ff;
            border-radius: 5px;
            border: 1px solid #cce0ff;
            page-break-inside: avoid;
            page-break-after: avoid;
        }

        .acknowledgment-box p {
            margin: 0;
            font-size: 10pt;
        }
    </style>
</head>

<body>
    <div class="watermark">CODESPRINT LABS</div>

    <div class="page">
        <!-- Header -->
        <div class="header">
            <table class="header-table">
                <tr>
                    <td class="logo-section">
                        <div class="logo-box">
                            <span class="logo-text">CS</span>
                        </div>
                        <div class="company-info">
                            <p class="company-name"
                                style="font-size: 16pt; color: #0066cc; font-weight: bold; margin: 0;">Memorandum of Understanding</p>
                            <p class="company-tagline" style="font-size: 8pt;">Internship Collaboration Agreement</p>
                        </div>
                    </td>
                    <td class="header-right" style="font-size: 7pt;">
                        Academic Year: {{ date('Y') }}-{{ date('Y') + 1 }}<br>
                        <strong>Date:</strong> {{ $enrollment->approvedAt ? \Carbon\Carbon::parse($enrollment->approvedAt)->format('d F Y') : date('d F Y') }}
                    </td>
                </tr>
            </table>
        </div>

        <div class="section" style="text-align:center; margin-top: 10px; margin-bottom: 10px;">
            <p style="font-size: 10pt;">This Memorandum of Understanding (MoU) is entered into on <strong>{{ $enrollment->approvedAt ? \Carbon\Carbon::parse($enrollment->approvedAt)->format('d F Y') : date('d F Y') }}</strong>, between:</p>
        </div>

        <!-- Parties -->
        <table class="parties-table" style="margin-bottom: 10px;">
            <tr>
                <td class="party-cell">
                    <h4 class="party-title" style="font-size: 10pt;">PARTY 1:</h4>
                    <p style="font-size: 9pt;"><strong>CodeSprint Labs</strong></p>
                    <p style="font-size: 8pt;">Empowering Future Tech Leaders</p>
                    <p style="font-size: 8pt;">Registration No: GJ-01-0562717</p>
                    <p style="font-size: 8pt;">Email: info@codesprintlabs.in</p>
                    <p style="font-size: 8pt;">Phone: +91-8160901481</p>
                    <p style="margin-top: 10px; font-style: italic; color: #666; font-size: 8pt;">(Hereinafter referred to as "The Company")</p>
                </td>
                <td class="party-cell">
                    <h4 class="party-title" style="font-size: 10pt;">PARTY 2:</h4>
                    <p style="font-size: 9pt;"><strong>{{ $enrollment->studentCollegeName }}</strong></p>
                    <p style="font-size: 8pt;">For and on behalf of the student:</p>
                    <p style="font-size: 9pt;"><strong>{{ $enrollment->studentName }}</strong></p>
                    <p style="font-size: 8pt;">Email: {{ $enrollment->studentEmail }}</p>
                    <p style="font-size: 8pt;">Phone: {{ $enrollment->studentPhone }}</p>
                    <p style="font-size: 8pt;">Program: {{ $enrollment->studentCourse }}</p>
                    <p style="font-size: 8pt;">Department: {{ $enrollment->studentDepartment ?? 'N/A' }}</p>
                    <p style="font-size: 8pt;">Semester: {{ $enrollment->studentSemester ?? 'N/A' }}</p>
                    <p style="font-size: 8pt;">Enrollment Number: {{ $enrollment->studentEnrollmentNumber ?? $enrollment->studentRollNumber }}</p>
                    <p style="margin-top: 10px; font-style: italic; color: #666; font-size: 8pt;">(Hereinafter referred to as "The Institution and Student")</p>
                </td>
            </tr>
        </table>

        <!-- Preamble -->
        <div class="section" style="margin-top: 10px; margin-bottom: 10px;">
            <div class="section-title" style="font-size: 10pt;">PREAMBLE:</div>
            <p style="font-size: 9pt;">WHEREAS, The Company is engaged in providing quality technology education, training, and internship opportunities to students across various domains;</p>
            <p style="font-size: 9pt;">AND WHEREAS, The Institution is desirous of providing practical industry exposure to its students through internship programs;</p>
            <p style="font-size: 9pt;">NOW THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree to collaborate for the internship program under the following terms and conditions:</p>
        </div>

        <!-- Internship Program Details -->
        <div class="section" style="page-break-before: avoid; page-break-after: avoid; margin-top: 5px; margin-bottom: 5px;">
            <div class="section-title" style="font-size: 10pt;">INTERNSHIP PROGRAM DETAILS:</div>
            <table class="info-table" style="page-break-inside: avoid; page-break-before: avoid; page-break-after: avoid; font-size: 9pt;">
                <tr>
                    <td class="label">Position</td>
                    <td class="value"><strong>{{ $enrollment->internshipTitle }}</strong></td>
                </tr>
                <tr>
                    <td class="label">Company</td>
                    <td class="value">CodeSprint Labs</td>
                </tr>
                <tr>
                    <td class="label">Location</td>
                    <td class="value">{{ $enrollment->internship->location ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="label">Duration</td>
                    <td class="value">{{ $enrollment->internshipDuration ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="label">Type</td>
                    <td class="value">{{ $enrollment->internship->type ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="label">Stipend</td>
                    <td class="value">{{ $enrollment->internship->stipend ?? 'Unpaid' }}</td>
                </tr>
            </table>
        </div>

        <!-- Terms and Conditions -->
        <div class="section" style="page-break-before: always;">
            <div class="section-title">TERMS AND CONDITIONS:</div>
            <div class="terms-box">
                <ol style="padding-left: 20px;">
                    <li><strong>Scope of Collaboration:</strong><br>
                        Provide internship opportunities to qualified students.<br>
                        Facilitate practical, hands-on experience in {{ $enrollment->internshipTitle }}.
                    </li>
                    <li><strong>Company Obligations:</strong><br>
                        Provide training, mentorship, and meaningful projects.<br>
                        Ensure safe working environment and pay stipend.<br>
                        Issue certificate upon successful completion.
                    </li>
                    <li><strong>Student Obligations:</strong><br>
                        Ensure regular attendance and professional conduct.<br>
                        Complete tasks within deadlines and adhere to company policies.<br>
                        Maintain confidentiality and submit reports as required.
                    </li>
                    <li><strong>Intellectual Property:</strong><br>
                        All IP created belongs to Company. No disclosure without consent.
                    </li>
                    <li><strong>Duration & Termination:</strong><br>
                        Valid for internship duration. 7-day notice for termination. Company may terminate for misconduct.
                    </li>
                    <li><strong>Evaluation:</strong><br>
                        Regular evaluation. Certificate upon completion. Recommendation for exceptional performance.
                    </li>
                    <li><strong>Liability:</strong><br>
                        Company not liable for injury/loss. Student advised to maintain insurance.
                    </li>
                    <li><strong>General:</strong><br>
                        Entire agreement. Amendments in writing. Governed by Indian law.
                    </li>
                </ol>
            </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <p style="font-weight: bold; text-align: center; margin-bottom: 20px;">
                IN WITNESS WHEREOF, parties have executed this MoU on the date mentioned above.
            </p>
            <table class="signature-table">
                <tr>
                    <td class="signature-cell">
                        <div class="signature-box">
                            <div class="signature-box-title">COMPANY:</div>
                            <div class="signature-line"></div>
                            <p class="signature-label">Authorized Signatory</p>
                        </div>
                    </td>
                    <td class="signature-cell">
                        <div class="signature-box">
                            <div class="signature-box-title">INSTITUTION:</div>
                            <div class="signature-line"></div>
                            <p class="signature-label">Authorized Signatory</p>
                        </div>
                    </td>
                    <td class="signature-cell">
                        <div class="signature-box">
                            <div class="signature-box-title">STUDENT:</div>
                            <div class="signature-line"></div>
                            <p class="signature-label">{{ $enrollment->studentName }}</p>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                Computer-generated document. Contact: info@codesprintlabs.in | +91-8160901481
            </p>
        </div>
    </div>
</body>

</html>
