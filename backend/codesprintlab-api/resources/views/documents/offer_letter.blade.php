<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Offer Letter - {{ $enrollment->studentName }}</title>
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
            font-size: 22pt;
            color: #0066cc;
            font-weight: bold;
            letter-spacing: 1px;
            text-shadow: 0 1px 2px #bbb;
        }

        .company-tagline {
            margin: 0;
            font-size: 10pt;
            font-weight: 500;
            color: #666;
        }

        .header-right {
            vertical-align: middle;
            text-align: right;
            font-size: 9pt;
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

        /* Signature Section */
        .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
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
        }

        .acknowledgment-box p {
            margin: 0;
            font-size: 10pt;
        }

        /* Green Success Box */
        .success-box {
            background: linear-gradient(90deg, #e8f5e9 0%, #c8e6c9 100%);
            border: 1px solid #a5d6a7;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }

        .success-box h4 {
            margin: 0 0 10px 0;
            color: #2e7d32;
        }
    </style>
</head>

<body>
    <div class="watermark">CODESPRINT LABS</div>

    <div class="page">
        <!-- Header -->
        <div class="header">
            <table class="header-table" style="width: 100%;">
                <tr>
                    <td colspan="2" style="text-align: center;">
                        <div class="logo-box" style="display: inline-block; vertical-align: middle;">
                            <span class="logo-text">CS</span>
                        </div>
                        <div class="company-info" style="display: inline-block; vertical-align: middle;">
                            <p class="company-name" style="font-size: 22pt; color: #0066cc; font-weight: bold; margin: 0; letter-spacing: 1px; text-shadow: 0 1px 2px #bbb; text-align: center;">CodeSprint Labs</p>
                            <p class="company-tagline" style="font-size: 10pt; font-weight: 500; text-align: center;">Empowering Future Tech Leaders</p>
                            <p style="font-size: 9pt; margin: 0; text-align: center;">Registration No: GJ-01-0562717</p>
                            <p style="font-size: 9pt; margin: 0; text-align: center;">Email: info@codesprintlabs.in &nbsp; Phone: +91-8160901481</p>
                        </div>
                    </td>
                </tr>
                </table>
                <div style="width: 100%; text-align: left; margin-top: 10px; margin-bottom: 10px;">
                    <div style="display: inline-block; border-bottom: 1px solid #0066cc; padding-bottom: 2px; min-width: 220px;">
                        <span style="font-size: 10pt;"><strong>Date:</strong> {{ $enrollment->approvedAt ? \Carbon\Carbon::parse($enrollment->approvedAt)->format('d F Y') : date('d F Y') }}</span><br>
                        <span style="font-size: 10pt;"><strong>Ref No:</strong> CSL/INT/{{ date('Y') }}/{{ $enrollment->studentEnrollmentNumber ?? $enrollment->studentRollNumber }}</span>
                    </div>
                </div>
            </table>
        </div>

        <!-- Candidate & Internship Details -->
        <div class="section" style="margin-top: 0px;">
            <p style="font-size: 11pt; font-weight: bold; margin-bottom: 2px;">{{ $enrollment->studentName }}</p>
            <p style="font-size: 9pt; margin: 0;">{{ $enrollment->studentCollegeName }}</p>
            <p style="font-size: 9pt; margin: 0;">{{ $enrollment->studentCourse }} - {{ $enrollment->studentSemester ?? 'N/A' }}</p>
            <p style="font-size: 9pt; margin: 0;">Department: {{ $enrollment->studentDepartment ?? 'N/A' }}</p>
            <p style="font-size: 9pt; margin: 0;">Enrollment No: {{ $enrollment->studentEnrollmentNumber ?? $enrollment->studentRollNumber }}</p>
            <p style="font-size: 9pt; margin: 0;">Email: {{ $enrollment->studentEmail }}</p>
            <p style="font-size: 9pt; margin: 0;">Phone: {{ $enrollment->studentPhone }}</p>
        </div>

        <div class="title-section" style="margin-top: 10px;">
            <h2 style="font-size: 14pt;">OFFER LETTER - {{ $enrollment->internshipTitle }}</h2>
        </div>

        <div class="section" style="margin-top: 10px;">
            <p>Dear <strong>{{ $enrollment->studentName }}</strong>,</p>
            <p>We are pleased to inform you of your selection for <strong>{{ $enrollment->internshipTitle }}</strong> at <strong>CodeSprint Labs</strong>. We were impressed by your credentials and believe you will be a valuable addition to our team.</p>
        </div>

        <!-- Internship Details Table -->
        <div class="section" style="margin-top: 10px;">
            <div class="section-title" style="font-size: 10pt;">Internship Details:</div>
            <table class="info-table" style="font-size: 9pt;">
                <tr>
                    <td class="label">Position</td>
                    <td class="value">{{ $enrollment->internshipTitle }}</td>
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
                <tr>
                    <td class="label">Start Date</td>
                    <td class="value">{{ $enrollment->startDate ? \Carbon\Carbon::parse($enrollment->startDate)->format('d F Y') : date('d F Y') }}</td>
                </tr>
                <tr>
                    <td class="label">Location</td>
                    <td class="value">{{ $enrollment->internship->location ?? 'N/A' }}</td>
                </tr>
            </table>
        </div>

        <!-- Terms and Conditions -->
        <div class="section" style="margin-top: 10px;">
            <div class="section-title" style="font-size: 10pt;">Terms and Conditions:</div>
            <div class="terms-box" style="font-size: 9pt;">
                <ol style="padding-left: 20px;">
                    <li>This internship is for a fixed duration as mentioned above.</li>
                    <li>You will report to the designated mentor/supervisor assigned by CodeSprint Labs.</li>
                    <li>You are required to maintain confidentiality of all company information and projects.</li>
                    <li>Regular attendance and timely completion of assigned tasks are expected.</li>
                    <li>The internship may be terminated by either party with a notice period of 7 days.</li>
                    <li>A certificate of completion will be provided upon successful completion of the internship.</li>
                    <li>Outstanding performance may lead to a full-time employment opportunity.</li>
                </ol>
            </div>
        </div>

        <div class="section" style="margin-top: 10px;">
            <p>Please confirm your acceptance of this offer by signing and returning a copy of this letter by <strong>{{ $enrollment->acceptanceDeadline ?? date('j F Y', strtotime('+7 days')) }}</strong>. We look forward to your joining and wish you a productive and enriching internship experience.</p>
            <p>Sincerely,</p>
            <p><strong>CodeSprint Labs</strong><br>HR Department<br>
                <span style="font-size: 9pt; color: #666;">Date: {{ $enrollment->approvedAt ? \Carbon\Carbon::parse($enrollment->approvedAt)->format('d F Y') : date('d F Y') }}</span><br>
                <span style="font-size: 9pt; color: #666;">Ref No: CSL/INT/{{ date('Y') }}/{{ $enrollment->studentEnrollmentNumber ?? $enrollment->studentRollNumber }}</span>
            </p>
        </div>

        <div class="section" style="margin-top: 20px;">
            <div class="section-title" style="font-size: 10pt;">ACCEPTANCE</div>
            <p style="font-size: 9pt;">I, <strong>{{ $enrollment->studentName }}</strong>, accept this offer for {{ $enrollment->internshipTitle }} at CodeSprint Labs under the terms mentioned.</p>
            <table style="width: 100%; margin-top: 20px;">
                <tr>
                    <td style="width: 50%;">
                        <span style="font-size: 9pt;">Signature</span>
                        <div style="border-bottom: 1px solid #333; height: 30px; width: 80%;"></div>
                    </td>
                    <td style="width: 50%;">
                        <span style="font-size: 9pt;">Date</span>
                        <div style="border-bottom: 1px solid #333; height: 30px; width: 80%;"></div>
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
