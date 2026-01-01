<!DOCTYPE html>
<html>

<head>
    <title>Internship Relieving Letter</title>
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
            border-bottom: 3px solid #6366f1;
            padding-bottom: 15px;
        }

        .company-name {
            font-size: 26pt;
            font-weight: bold;
            color: #6366f1;
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

        .title {
            text-align: center;
            font-weight: bold;
            font-size: 16pt;
            margin: 30px 0;
            text-transform: uppercase;
            color: #6366f1;
            border: 2px solid #6366f1;
            padding: 10px;
            background: #eef2ff;
        }

        p {
            margin-bottom: 14px;
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

        .clearance-box {
            margin: 25px 0;
            padding: 20px;
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 8px;
        }

        .clearance-title {
            font-weight: bold;
            color: #16a34a;
            margin-bottom: 10px;
            font-size: 12pt;
        }

        .clearance-item {
            display: flex;
            align-items: center;
            margin: 8px 0;
        }

        .checkmark {
            color: #16a34a;
            font-weight: bold;
            margin-right: 10px;
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

        .note-box {
            margin: 20px 0;
            padding: 15px;
            background: #fefce8;
            border-left: 4px solid #eab308;
            font-size: 10pt;
        }
    </style>
</head>

<body>
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
                <strong>Ref No:</strong> CSL/REL/{{ date('Y') }}/{{ substr($enrollment->id, -6) }}
            </td>
        </tr>
    </table>

    <div class="title">Relieving Letter</div>

    <p><strong>To Whom It May Concern,</strong></p>

    <p>
        This is to certify that <strong>{{ $enrollment->studentName }}</strong> was associated with 
        <strong>CodeSprint Labs</strong> as an <strong>Intern</strong> in the 
        <strong>{{ $enrollment->internshipDomain ?? $enrollment->internshipTitle }}</strong> program.
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
                <td>Internship Program:</td>
                <td>{{ $enrollment->internshipTitle }}</td>
            </tr>
            <tr>
                <td>Date of Joining:</td>
                <td>{{ $enrollment->startDate ? date('d F Y', strtotime($enrollment->startDate)) : 'N/A' }}</td>
            </tr>
            <tr>
                <td>Date of Relieving:</td>
                <td>{{ $enrollment->withdrawalApprovedAt ? date('d F Y', strtotime($enrollment->withdrawalApprovedAt)) : date('d F Y') }}</td>
            </tr>
            <tr>
                <td>Reason for Leaving:</td>
                <td>{{ $enrollment->withdrawalReason ?? 'Personal Reasons' }}</td>
            </tr>
        </table>
    </div>

    <p>
        The intern has been relieved from their duties at <strong>CodeSprint Labs</strong> with effect from 
        <strong>{{ $enrollment->withdrawalApprovedAt ? date('d F Y', strtotime($enrollment->withdrawalApprovedAt)) : date('d F Y') }}</strong> 
        upon their request for voluntary withdrawal from the internship program.
    </p>

    <div class="clearance-box">
        <div class="clearance-title">Clearance Status</div>
        <div class="clearance-item">
            <span class="checkmark">✓</span>
            <span>No pending tasks or deliverables</span>
        </div>
        <div class="clearance-item">
            <span class="checkmark">✓</span>
            <span>All company assets/resources returned (if applicable)</span>
        </div>
        <div class="clearance-item">
            <span class="checkmark">✓</span>
            <span>No dues pending</span>
        </div>
        <div class="clearance-item">
            <span class="checkmark">✓</span>
            <span>Proper handover completed</span>
        </div>
    </div>

    <p>
        During their tenure, the intern demonstrated a positive attitude and willingness to learn. 
        We appreciate their contributions and wish them success in all their future endeavors.
    </p>

    <div class="note-box">
        <strong>Note:</strong> This relieving letter is issued upon the intern's request and does not 
        imply completion of the full internship program. A separate partial completion letter has been 
        provided documenting the work completed during the internship period.
    </div>

    <p>
        We wish <strong>{{ $enrollment->studentName }}</strong> all the best for their future career.
    </p>

    <div class="signature-section">
        <p>For <strong>CodeSprint Labs</strong></p>
        
        <div class="signature-block">
            <div class="signature-line"></div>
            <div><strong>Authorized Signatory</strong></div>
            <div style="font-size: 10pt; color: #666;">HR Department</div>
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
        CodeSprint Labs | Empowering Future Tech Leaders
    </div>
</body>

</html>
