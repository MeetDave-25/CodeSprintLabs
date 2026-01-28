<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Certificate of Completion - CodeSprint Labs</title>
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }

        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #333;
        }

        .page-border {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 5px solid #0066cc;
            padding: 5px;
        }

        .inner-border {
            position: relative;
            width: 100%;
            height: 100%;
            border: 2px solid #d4af37;
            background: #fff;
            /* Watermark */
            background-image: radial-gradient(circle at 50% 50%, rgba(0, 102, 204, 0.03) 0%, transparent 60%);
        }

        /* Decorative Corners */
        .corner {
            position: absolute;
            width: 40px;
            height: 40px;
            border-color: #0066cc;
            border-style: solid;
        }

        .top-left {
            top: -1px;
            left: -1px;
            border-width: 4px 0 0 4px;
        }

        .top-right {
            top: -1px;
            right: -1px;
            border-width: 4px 4px 0 0;
        }

        .bottom-left {
            bottom: -1px;
            left: -1px;
            border-width: 0 0 4px 4px;
        }

        .bottom-right {
            bottom: -1px;
            right: -1px;
            border-width: 0 4px 4px 0;
        }

        .content {
            text-align: center;
            padding: 40px;
            position: relative;
            z-index: 10;
        }

        /* Header */
        .header {
            margin-bottom: 30px;
        }

        .logo-text {
            font-size: 28pt;
            font-weight: bold;
            color: #0066cc;
            margin: 0;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .logo-sub {
            font-size: 10pt;
            color: #666;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-top: 5px;
        }

        /* Title */
        .cert-title {
            font-size: 36pt;
            font-family: 'Georgia', serif;
            color: #d4af37;
            margin: 20px 0 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .cert-subtitle {
            font-size: 14pt;
            color: #666;
            margin-bottom: 30px;
        }

        /* Body Text */
        .body-text {
            font-size: 14pt;
            color: #555;
            margin: 10px 0;
        }

        .student-name {
            font-size: 32pt;
            font-weight: bold;
            color: #1a1a2e;
            margin: 10px 0;
            font-family: 'Georgia', serif;
            border-bottom: 2px solid #ddd;
            display: inline-block;
            padding: 0 40px 10px;
            min-width: 400px;
        }

        .program-title {
            font-size: 22pt;
            font-weight: bold;
            color: #0066cc;
            margin: 15px 0;
        }

        .details-text {
            font-size: 14pt;
            margin: 20px 0;
            line-height: 1.6;
        }

        /* Performance Box */
        .performance-box {
            display: inline-block;
            margin: 20px 0;
            padding: 15px 40px;
            background: #f9fbfd;
            border: 1px solid #e0e8f0;
            border-radius: 8px;
        }

        .grade-text {
            font-size: 16pt;
            font-weight: bold;
            color: #333;
        }

        .grade-val {
            color: #0066cc;
            font-size: 20pt;
        }

        /* Signatures */
        .signatures {
            margin-top: 60px;
            width: 100%;
            display: table;
            table-layout: fixed;
        }

        .sig-col {
            display: table-cell;
            text-align: center;
            vertical-align: top;
        }

        .sig-line {
            width: 200px;
            border-bottom: 2px solid #333;
            margin: 0 auto 10px;
        }

        .sig-name {
            font-weight: bold;
            font-size: 12pt;
            color: #0066cc;
        }

        .sig-role {
            font-size: 10pt;
            color: #666;
        }

        /* Footer */
        .footer {
            margin-top: 40px;
            font-size: 9pt;
            color: #999;
        }

        .verification {
            margin-top: 10px;
            font-size: 10pt;
            color: #555;
            background: #f5f5f5;
            display: inline-block;
            padding: 5px 15px;
            border-radius: 4px;
        }

        /* Badge/Seal */
        .seal {
            position: absolute;
            bottom: 50px;
            right: 50px;
            width: 100px;
            height: 100px;
            opacity: 0.9;
        }
    </style>
</head>

<body>
    <div class="page-border">
        <div class="inner-border">
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>

            <div class="content">
                <!-- Header -->
                <div class="header">
                    <h1 class="logo-text">CodeSprint Labs</h1>
                    <div class="logo-sub">Empowering Future Tech Leaders</div>
                </div>

                <!-- Title -->
                <div class="cert-title">Certificate of Completion</div>
                <div class="cert-subtitle">is proudly presented to</div>

                <!-- Recipient -->
                <div class="student-name">{{ $studentName }}</div>

                <div class="body-text">for successfully completing the internship program in</div>

                <!-- Program -->
                <div class="program-title">{{ $internshipTitle }}</div>

                <!-- Details -->
                <div class="details-text">
                    This internship was conducted from
                    <strong>{{ \Carbon\Carbon::parse($startDate)->format('d F Y') }}</strong>
                    to <strong>{{ \Carbon\Carbon::parse($endDate)->format('d F Y') }}</strong>.<br>
                    The student has demonstrated dedication, skill, and professional conduct throughout the program.
                </div>

                <!-- Performance -->
                @if (isset($grade))
                    <div class="performance-box">
                        <span class="grade-text">Grade Achieved: <span
                                class="grade-val">{{ $grade }}</span></span>
                        @if (isset($marks))
                            <br>
                            <span style="font-size: 10pt; color: #666;">Score:
                                {{ $marks }}/{{ $maxMarks ?? 50 }}</span>
                        @endif
                    </div>
                @endif

                <!-- Signatures -->
                <div class="signatures">
                    <div class="sig-col">
                        <div style="height: 50px;">
                            <!-- Digital Signature Placeholder -->
                            <img src="{{ public_path('images/signature_placeholder.png') }}"
                                style="height: 40px; opacity: 0.5;" onerror="this.style.display='none'" />
                        </div>
                        <div class="sig-line"></div>
                        <div class="sig-name">Program Mentor</div>
                        <div class="sig-role">Technical Lead</div>
                    </div>

                    <div class="sig-col">
                        <div style="height: 50px;"></div>
                        <div class="date-val" style="font-weight: bold; font-size: 12pt; margin-bottom: 5px;">
                            {{ \Carbon\Carbon::parse($issueDate)->format('d F Y') }}</div>
                        <div class="sig-role">Date of Issue</div>
                    </div>

                    <div class="sig-col">
                        <div style="height: 50px;">
                            <!-- Digital Signature Placeholder -->
                            <img src="{{ public_path('images/ceo_signature_placeholder.png') }}"
                                style="height: 40px; opacity: 0.5;" onerror="this.style.display='none'" />
                        </div>
                        <div class="sig-line"></div>
                        <div class="sig-name">CEO & Founder</div>
                        <div class="sig-role">CodeSprint Labs</div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <div class="verification">
                        Certificate ID: <strong>{{ $verificationCode }}</strong>
                    </div>
                    <div style="margin-top: 5px;">
                        Verify at: codesprintlabs.in/verify-certificate
                    </div>
                </div>
            </div>

            <!-- Seal Decoration -->
            <div class="seal">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" stroke="#d4af37" stroke-width="2" fill="none" />
                    <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z"
                        fill="rgba(212, 175, 55, 0.1)" />
                    <text x="50" y="55" font-family="Arial" font-size="10" fill="#d4af37" text-anchor="middle"
                        font-weight="bold">VALID</text>
                </svg>
            </div>
        </div>
    </div>
</body>

</html>
