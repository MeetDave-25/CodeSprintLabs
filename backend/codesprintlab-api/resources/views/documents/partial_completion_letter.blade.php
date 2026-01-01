<!DOCTYPE html>
<html>

<head>
    <title>Partial Internship Completion Letter</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            padding: 40px;
            line-height: 1.6;
            color: #333;
            font-size: 11pt;
        }

        .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 3px solid #f59e0b;
            padding-bottom: 15px;
        }

        .company-name {
            font-size: 26pt;
            font-weight: bold;
            color: #f59e0b;
            letter-spacing: 1px;
        }

        .tagline {
            font-size: 10pt;
            color: #666;
            margin-top: 5px;
            font-style: italic;
        }

        .contact-info {
            font-size: 9pt;
            color: #666;
            margin-top: 8px;
        }

        .meta-info {
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
        }

        .meta-left, .meta-right {
            font-size: 10pt;
        }

        .title {
            text-align: center;
            font-weight: bold;
            font-size: 16pt;
            margin: 30px 0;
            text-transform: uppercase;
            color: #f59e0b;
            border: 2px solid #f59e0b;
            padding: 10px;
            background: #fffbeb;
        }

        .partial-notice {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            font-size: 10pt;
        }

        p {
            margin-bottom: 12px;
            text-align: justify;
        }

        .details-box {
            border: 1px solid #ddd;
            padding: 20px;
            background-color: #f9f9f9;
            margin: 25px 0;
            border-radius: 8px;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
        }

        .details-table td {
            padding: 8px 5px;
            vertical-align: top;
            border-bottom: 1px dotted #ddd;
        }

        .details-table td:first-child {
            font-weight: bold;
            width: 35%;
            color: #555;
        }

        .progress-section {
            margin: 25px 0;
            padding: 20px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        }

        .progress-title {
            font-weight: bold;
            color: #f59e0b;
            margin-bottom: 15px;
            font-size: 12pt;
        }

        .signature-section {
            margin-top: 50px;
        }

        .signature-block {
            margin-top: 60px;
        }

        .signature-line {
            border-top: 1px solid #333;
            width: 200px;
            margin-bottom: 5px;
        }

        .seal-area {
            float: right;
            text-align: center;
            margin-top: -80px;
        }

        .seal-placeholder {
            width: 100px;
            height: 100px;
            border: 2px dashed #ccc;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 9pt;
        }

        .footer {
            position: fixed;
            bottom: 20px;
            left: 40px;
            right: 40px;
            text-align: center;
            font-size: 8pt;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }

        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80pt;
            color: rgba(245, 158, 11, 0.08);
            font-weight: bold;
            z-index: -1;
        }
    </style>
</head>

<body>
    <div class="watermark">PARTIAL</div>

    <div class="header">
        <div class="company-name">CodeSprint Labs</div>
        <div class="tagline">Empowering Future Tech Leaders</div>
        <div class="contact-info">
            Email: info@codesprintlabs.in | Phone: +91-8160901481 | Website: www.codesprintlabs.in
        </div>
    </div>

    <table width="100%" style="margin-bottom: 20px;">
        <tr>
            <td style="text-align: left;">
                <strong>Date:</strong> {{ $enrollment->withdrawalApprovedAt ? date('d F Y', strtotime($enrollment->withdrawalApprovedAt)) : date('d F Y') }}
            </td>
            <td style="text-align: right;">
                <strong>Ref No:</strong> CSL/PCL/{{ date('Y') }}/{{ substr($enrollment->id, -6) }}
            </td>
        </tr>
    </table>

    <div class="title">Partial Internship Completion Letter</div>

    <div class="partial-notice">
        <strong>Note:</strong> This letter certifies partial completion of the internship program. 
        The intern has voluntarily withdrawn from the program before its scheduled completion.
    </div>

    <p><strong>To Whom It May Concern,</strong></p>

    <p>
        This is to certify that <strong>{{ $enrollment->studentName }}</strong>, a student of 
        <strong>{{ $enrollment->studentCollegeName ?? 'N/A' }}</strong>, pursuing 
        <strong>{{ $enrollment->studentCourse ?? 'N/A' }}</strong>, has partially completed an internship 
        program at <strong>CodeSprint Labs</strong>.
    </p>

    <div class="details-box">
        <table class="details-table">
            <tr>
                <td>Intern Name:</td>
                <td>{{ $enrollment->studentName }}</td>
            </tr>
            <tr>
                <td>Email:</td>
                <td>{{ $enrollment->studentEmail }}</td>
            </tr>
            <tr>
                <td>College/University:</td>
                <td>{{ $enrollment->studentCollegeName ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Course/Program:</td>
                <td>{{ $enrollment->studentCourse ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Enrollment Number:</td>
                <td>{{ $enrollment->studentEnrollmentNumber ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Internship Domain:</td>
                <td>{{ $enrollment->internshipDomain ?? $enrollment->internshipTitle }}</td>
            </tr>
            <tr>
                <td>Internship Title:</td>
                <td>{{ $enrollment->internshipTitle }}</td>
            </tr>
            <tr>
                <td>Original Duration:</td>
                <td>{{ $enrollment->internshipDuration ?? '4 Weeks' }}</td>
            </tr>
            <tr>
                <td>Start Date:</td>
                <td>{{ $enrollment->startDate ? date('d F Y', strtotime($enrollment->startDate)) : 'N/A' }}</td>
            </tr>
            <tr>
                <td>Exit Date:</td>
                <td>{{ $enrollment->withdrawalApprovedAt ? date('d F Y', strtotime($enrollment->withdrawalApprovedAt)) : date('d F Y') }}</td>
            </tr>
            <tr>
                <td>Completion Status:</td>
                <td><strong style="color: #f59e0b;">Partial (Voluntary Exit)</strong></td>
            </tr>
        </table>
    </div>

    <div class="progress-section">
        <div class="progress-title">Progress Summary</div>
        <table class="details-table">
            <tr>
                <td>Tasks Completed:</td>
                <td>{{ $enrollment->tasksCompleted ?? 0 }} out of {{ $enrollment->totalTasks ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Points Earned:</td>
                <td>{{ $enrollment->totalPoints ?? 0 }} points</td>
            </tr>
            @if($enrollment->withdrawalReason)
            <tr>
                <td>Reason for Exit:</td>
                <td>{{ $enrollment->withdrawalReason }}</td>
            </tr>
            @endif
        </table>
    </div>

    <p>
        During the tenure of the internship, the intern has shown dedication and commitment towards 
        the assigned tasks. Although the internship was not completed in full, the skills and experience 
        gained during this period are valuable.
    </p>

    <p>
        We wish {{ $enrollment->studentName }} all the best in their future endeavors.
    </p>

    <div class="signature-section">
        <p>For <strong>CodeSprint Labs</strong></p>
        
        <div class="signature-block">
            <div class="signature-line"></div>
            <div><strong>Authorized Signatory</strong></div>
            <div style="font-size: 10pt; color: #666;">Program Coordinator</div>
        </div>

        <div class="seal-area">
            <div class="seal-placeholder">
                Company<br>Seal
            </div>
        </div>
    </div>

    <div class="footer">
        This is a computer-generated document. For verification, please contact info@codesprintlabs.in
        <br>
        CodeSrint Labs | Empowering Future Tech Leaders
    </div>
</body>

</html>
