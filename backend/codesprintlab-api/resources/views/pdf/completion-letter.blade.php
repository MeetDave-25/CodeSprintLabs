<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Internship Completion Letter - {{ $studentName }}</title>
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
            margin: 20px 0;
            padding: 15px;
            background: linear-gradient(90deg, #e8f5e9 0%, #c8e6c9 100%);
            border-radius: 8px;
            border: 1px solid #a5d6a7;
        }

        .title-section h2 {
            margin: 0;
            font-size: 18pt;
            color: #2e7d32;
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
            margin: 15px 0;
            background: #fff;
        }

        .info-table th {
            background: #0066cc;
            color: white;
            padding: 8px 15px;
            text-align: left;
            font-size: 10pt;
            font-weight: 600;
        }

        .info-table td {
            padding: 8px 15px;
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
            margin: 15px 0;
            border-collapse: separate;
            border-spacing: 10px 0;
        }

        .party-cell {
            width: 48%;
            vertical-align: top;
            padding: 12px;
            background: #f9fbfd;
            border: 1px solid #e0e8f0;
            border-radius: 8px;
        }

        .party-title {
            margin: 0 0 8px 0;
            padding-bottom: 6px;
            border-bottom: 2px solid #0066cc;
            color: #0066cc;
            font-size: 10pt;
            font-weight: bold;
        }

        .party-cell p {
            margin: 4px 0;
            font-size: 9pt;
        }

        /* Section */
        .section {
            margin: 15px 0;
        }

        .section-title {
            font-size: 11pt;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e0e8f0;
        }

        .section p {
            text-align: justify;
            margin: 6px 0;
        }

        .section ul {
            margin: 8px 0;
            padding-left: 25px;
        }

        .section li {
            margin: 4px 0;
            text-align: justify;
        }

        /* Performance Box */
        .performance-box {
            background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%);
            border: 1px solid #90caf9;
            border-left: 4px solid #2196f3;
            padding: 12px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
        }

        .performance-box h4 {
            margin: 0 0 10px 0;
            color: #1565c0;
        }

        .grade-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12pt;
            font-weight: bold;
            background: #4caf50;
            color: white;
        }

        /* Success Box */
        .success-box {
            background: linear-gradient(90deg, #e8f5e9 0%, #c8e6c9 100%);
            border: 1px solid #a5d6a7;
            border-left: 4px solid #4caf50;
            padding: 12px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
        }

        .success-box h4 {
            margin: 0 0 8px 0;
            color: #2e7d32;
        }

        /* Skills Box */
        .skills-box {
            background: #f5f5f5;
            border: 1px solid #ddd;
            padding: 12px;
            margin: 15px 0;
            border-radius: 5px;
            font-size: 10pt;
        }

        .skills-box h5 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 10pt;
        }

        .skill-tag {
            display: inline-block;
            padding: 3px 10px;
            margin: 2px;
            background: #e3f2fd;
            border: 1px solid #90caf9;
            border-radius: 15px;
            font-size: 9pt;
            color: #1565c0;
        }

        /* Signature Section */
        .signature-section {
            margin-top: 30px;
            page-break-inside: avoid;
        }

        .signature-table {
            width: 100%;
            margin-top: 15px;
            border-collapse: separate;
            border-spacing: 20px 0;
        }

        .signature-cell {
            width: 45%;
            vertical-align: top;
        }

        .signature-box {
            border: 1px solid #ddd;
            padding: 15px;
            min-height: 80px;
            background: #fafafa;
            border-radius: 5px;
        }

        .signature-box-title {
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 10px;
            font-size: 10pt;
        }

        .signature-line {
            border-bottom: 1px solid #333;
            height: 30px;
            margin: 15px 0 5px 0;
        }

        .signature-label {
            font-size: 8pt;
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
            padding: 8px 40px;
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

        .badge-success {
            background: #4caf50;
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
                            <p class="company-name">CodeSprint Labs</p>
                            <p class="company-tagline">Empowering Future Tech Leaders</p>
                        </div>
                    </td>
                    <td class="header-right">
                        <strong>Document ID:</strong> CSL/COMP/{{ date('Y') }}/{{ strtoupper(substr(md5($studentName . $internshipTitle), 0, 6)) }}<br>
                        <strong>Issue Date:</strong> {{ $issueDate ?? date('d M Y') }}<br>
                        <strong>Reference:</strong> {{ $enrollmentNumber ?? 'N/A' }}
                    </td>
                </tr>
            </table>
        </div>

        <!-- Title -->
        <div class="title-section">
            <h2>Internship Completion Letter</h2>
            <p>Certificate of Successful Completion | Academic Year {{ date('Y') }}-{{ date('Y') + 1 }}</p>
        </div>

        <!-- To Whom It May Concern -->
        <div class="section">
            <p><strong>TO WHOM IT MAY CONCERN</strong></p>
        </div>

        <!-- Intern Details -->
        <table class="parties-table">
            <tr>
                <td class="party-cell">
                    <h4 class="party-title">INTERN DETAILS</h4>
                    <p><strong>{{ $studentName }}</strong></p>
                    <p><strong>Email:</strong> {{ $studentEmail ?? 'N/A' }}</p>
                    <p><strong>Phone:</strong> {{ $studentPhone ?? 'N/A' }}</p>
                    <p><strong>Enrollment No:</strong> {{ $enrollmentNumber ?? 'N/A' }}</p>
                    @if (!empty($studentRollNumber))
                        <p><strong>Roll No:</strong> {{ $studentRollNumber }}</p>
                    @endif
                </td>
                <td class="party-cell">
                    <h4 class="party-title">INSTITUTION DETAILS</h4>
                    <p><strong>{{ $studentCollegeName ?? 'N/A' }}</strong></p>
                    <p><strong>Course:</strong> {{ $studentCourse ?? 'N/A' }}</p>
                    @if (!empty($studentDivision))
                        <p><strong>Division:</strong> {{ $studentDivision }}</p>
                    @endif
                    <p><strong>City:</strong> {{ $studentCity ?? 'N/A' }}</p>
                </td>
            </tr>
        </table>

        <!-- Certification Statement -->
        <div class="section">
            <p>This is to certify that <strong>{{ $studentName }}</strong> from <strong>{{ $studentCollegeName ?? 'the University' }}</strong>
               has <strong>successfully completed</strong> the internship program at <strong>CodeSprint Labs</strong>.</p>
        </div>

        <!-- Internship Details Table -->
        <table class="info-table">
            <tr>
                <th colspan="2">INTERNSHIP PROGRAM DETAILS</th>
            </tr>
            <tr>
                <td class="label">Position/Role</td>
                <td class="value"><strong>{{ $internshipTitle }}</strong></td>
            </tr>
            <tr>
                <td class="label">Domain</td>
                <td class="value">{{ $internshipDomain ?? 'Technology' }}</td>
            </tr>
            <tr>
                <td class="label">Duration</td>
                <td class="value">{{ $internshipDuration }}</td>
            </tr>
            <tr>
                <td class="label">Start Date</td>
                <td class="value">{{ $startDate ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Completion Date</td>
                <td class="value">{{ $endDate ?? date('d F Y') }}</td>
            </tr>
            <tr>
                <td class="label">Mode of Work</td>
                <td class="value"><span class="badge">{{ $internshipType ?? 'Work From Home' }}</span></td>
            </tr>
            <tr>
                <td class="label">Status</td>
                <td class="value"><span class="badge badge-success">COMPLETED</span></td>
            </tr>
        </table>

        <!-- Performance Evaluation -->
        <div class="performance-box">
            <h4>PERFORMANCE EVALUATION</h4>
            <table style="width: 100%; font-size: 10pt;">
                <tr>
                    <td style="width: 50%;"><strong>Overall Score:</strong> {{ $marks ?? '50' }}/50</td>
                    <td style="width: 50%; text-align: right;">
                        <strong>Grade:</strong> {{ $grade ?? 'A' }}
                        <span style="font-size: 9pt; color: #666; margin-left: 5px;">
                            @if(($grade ?? 'A') == 'A+')
                                [Outstanding]
                            @elseif(($grade ?? 'A') == 'A')
                                [Excellent]
                            @elseif(($grade ?? 'A') == 'B+')
                                [Very Good]
                            @elseif(($grade ?? 'A') == 'B')
                                [Good]
                            @else
                                [Satisfactory]
                            @endif
                        </span>
                    </td>
                </tr>
            </table>
            <p style="font-size: 9pt; color: #555; margin-top: 10px; margin-bottom: 0;">
                Evaluation based on: Technical Skills, Problem-Solving, Teamwork, Communication, and Overall Contribution.
            </p>
        </div>

        <!-- Areas of Work -->
        <div class="success-box">
            <h4>AREAS OF WORK & RESPONSIBILITIES</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 10pt;">
                @forelse($responsibilities ?? [] as $resp)
                    <li>{{ $resp }}</li>
                @empty
                    <li>Worked on real-world projects related to {{ $internshipTitle }}.</li>
                    <li>Completed daily tasks and assignments through the learning platform.</li>
                    <li>Participated in training sessions, workshops, and team meetings.</li>
                    <li>Collaborated with mentors and team members on project deliverables.</li>
                    <li>Maintained proper documentation of work and learning progress.</li>
                @endforelse
            </ul>
        </div>

        <!-- Technical Skills -->
        <div class="skills-box">
            <h5>TECHNICAL SKILLS DEVELOPED</h5>
            <div>
                @if (!empty($skills))
                    @foreach($skills as $skill)
                        <span class="skill-tag">{{ $skill }}</span>
                    @endforeach
                @else
                    <span class="skill-tag">Project Development</span>
                    <span class="skill-tag">Problem Solving</span>
                    <span class="skill-tag">Technical Documentation</span>
                    <span class="skill-tag">Team Collaboration</span>
                    <span class="skill-tag">Communication</span>
                    <span class="skill-tag">Time Management</span>
                @endif
            </div>
        </div>

        <!-- Closing Statement -->
        <div class="section">
            <p>During the internship period, <strong>{{ $studentName }}</strong> demonstrated exceptional dedication, 
               professionalism, and technical competence. The intern actively participated in various projects and 
               successfully completed all assigned tasks and responsibilities.</p>
            <p>We are confident that <strong>{{ $studentName }}</strong> will be an asset to any organization and 
               wish them all the best for their future endeavors.</p>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <table class="signature-table">
                <tr>
                    <td class="signature-cell">
                        <div class="signature-box">
                            <div class="signature-box-title">AUTHORIZED SIGNATORY</div>
                            <div class="signature-line"></div>
                            <p class="signature-label">Signature</p>
                            <p style="margin: 5px 0;"><strong>CodeSprint Labs</strong></p>
                            <p style="font-size: 8pt; color: #666;">Date: {{ $issueDate ?? date('d/m/Y') }}</p>
                        </div>
                    </td>
                    <td class="signature-cell">
                        <div class="signature-box">
                            <div class="signature-box-title">COMPANY SEAL</div>
                            <div style="text-align: center; padding: 15px;">
                                <div style="display: inline-block; width: 80px; height: 80px; border: 2px dashed #ccc; border-radius: 50%; text-align: center; line-height: 80px; color: #ccc; font-size: 9pt;">
                                    [SEAL]
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                <strong>CodeSprint Labs</strong> | info@codesprintlabs.in | +91-8160901481 | www.codesprintlabs.in
            </p>
            <p style="margin-top: 3px; font-size: 7pt;">
                This is a computer-generated document. Document ID: CSL/COMP/{{ date('Y') }}/{{ strtoupper(substr(md5($studentName . $internshipTitle), 0, 6)) }}
            </p>
        </div>
    </div>
</body>

</html>
