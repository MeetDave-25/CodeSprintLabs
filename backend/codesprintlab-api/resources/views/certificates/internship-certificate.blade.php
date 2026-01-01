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
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Georgia', 'Times New Roman', serif;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            min-height: 100vh;
            color: #ffffff;
        }
        
        .certificate-wrapper {
            width: 100%;
            min-height: 100vh;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }

        /* Background Decorations */
        .bg-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(102, 126, 234, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 90% 80%, rgba(118, 75, 162, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.03) 0%, transparent 70%);
        }

        .certificate-container {
            position: relative;
            background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
            border-radius: 20px;
            padding: 30px 40px;
            border: 3px solid #d4af37;
            min-height: calc(100vh - 40px);
            box-shadow: 
                0 0 60px rgba(212, 175, 55, 0.15),
                inset 0 0 100px rgba(0,0,0,0.3);
        }

        /* Inner Border */
        .inner-border {
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 1px solid rgba(212, 175, 55, 0.4);
            border-radius: 12px;
            pointer-events: none;
        }

        /* Corner Ornaments */
        .corner-ornament {
            position: absolute;
            width: 70px;
            height: 70px;
        }
        .corner-tl { top: 5px; left: 5px; }
        .corner-tr { top: 5px; right: 5px; transform: rotate(90deg); }
        .corner-bl { bottom: 5px; left: 5px; transform: rotate(-90deg); }
        .corner-br { bottom: 5px; right: 5px; transform: rotate(180deg); }

        .corner-ornament svg {
            width: 100%;
            height: 100%;
        }

        /* Award Ribbon */
        .award-ribbon {
            position: absolute;
            top: -5px;
            right: 70px;
            width: 55px;
            text-align: center;
            z-index: 10;
        }

        .ribbon-body {
            background: linear-gradient(180deg, #d4af37 0%, #aa8c2c 100%);
            padding: 12px 8px 20px;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .ribbon-icon {
            font-size: 26px;
        }

        .ribbon-tail-left,
        .ribbon-tail-right {
            position: absolute;
            bottom: -12px;
            width: 22px;
            height: 18px;
            background: #aa8c2c;
        }
        .ribbon-tail-left {
            left: 5px;
            transform: skewY(20deg);
        }
        .ribbon-tail-right {
            right: 5px;
            transform: skewY(-20deg);
        }

        /* Header Section */
        .header {
            text-align: center;
            margin-bottom: 12px;
        }

        .logo-container {
            display: inline-block;
        }

        .logo-box {
            display: inline-block;
            width: 45px;
            height: 45px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            vertical-align: middle;
            margin-right: 12px;
            position: relative;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .logo-box::after {
            content: "CSL";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
            font-weight: bold;
            color: white;
            letter-spacing: 1px;
        }

        .company-info {
            display: inline-block;
            vertical-align: middle;
            text-align: left;
        }

        .company-name {
            font-size: 26px;
            font-weight: bold;
            color: #d4af37;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin: 0;
            text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
        }

        .tagline {
            font-size: 10px;
            color: rgba(255,255,255,0.5);
            letter-spacing: 4px;
            text-transform: uppercase;
        }

        /* Certificate Title */
        .certificate-title {
            text-align: center;
            margin: 15px 0;
        }

        .main-title {
            font-size: 50px;
            font-weight: normal;
            text-transform: uppercase;
            letter-spacing: 15px;
            color: #ffffff;
            text-shadow: 0 3px 20px rgba(102, 126, 234, 0.4);
            margin: 0;
        }

        .subtitle {
            font-size: 16px;
            color: #d4af37;
            letter-spacing: 6px;
            text-transform: uppercase;
            margin-top: 6px;
        }

        /* Decorative Divider */
        .divider {
            text-align: center;
            margin: 12px 0;
        }

        .divider-content {
            display: inline-block;
        }

        .divider-line {
            display: inline-block;
            width: 100px;
            height: 1px;
            background: linear-gradient(90deg, transparent, #d4af37, transparent);
            vertical-align: middle;
        }

        .divider-star {
            display: inline-block;
            color: #d4af37;
            font-size: 18px;
            margin: 0 12px;
            vertical-align: middle;
        }

        /* Recipient Section */
        .recipient-section {
            text-align: center;
            margin: 15px 0;
        }

        .certify-text {
            font-size: 12px;
            color: rgba(255,255,255,0.6);
            letter-spacing: 4px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .recipient-name {
            font-size: 48px;
            font-family: 'Brush Script MT', 'Segoe Script', cursive;
            color: #ffffff;
            margin: 5px 0;
            line-height: 1.1;
            text-shadow: 0 2px 15px rgba(255,255,255,0.2);
        }

        /* Program Section */
        .program-section {
            text-align: center;
            margin: 15px auto;
            padding: 15px 25px;
            max-width: 600px;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%);
            border-radius: 15px;
            border: 1px solid rgba(102, 126, 234, 0.25);
        }

        .completion-text {
            font-size: 11px;
            color: rgba(255,255,255,0.7);
            letter-spacing: 2px;
            margin-bottom: 6px;
        }

        .program-name {
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 6px;
        }

        .program-domain {
            display: inline-block;
            padding: 5px 16px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 20px;
            font-size: 11px;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #ffffff;
        }

        .program-duration {
            font-size: 11px;
            color: rgba(255,255,255,0.5);
            margin-top: 8px;
        }

        /* Performance Cards */
        .performance-section {
            display: table;
            width: 100%;
            margin: 15px 0;
            table-layout: fixed;
        }

        .performance-card {
            display: table-cell;
            width: 25%;
            text-align: center;
            padding: 8px 10px;
            vertical-align: middle;
        }

        .stat-box {
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 12px 8px;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .stat-value {
            font-size: 26px;
            font-weight: bold;
            color: #667eea;
        }

        .stat-label {
            font-size: 9px;
            color: rgba(255,255,255,0.5);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
        }

        /* Grade Card */
        .grade-box {
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(170, 140, 44, 0.1) 100%);
            border-radius: 15px;
            padding: 12px;
            border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .grade-circle {
            width: 65px;
            height: 65px;
            margin: 0 auto 6px;
            background: linear-gradient(135deg, #d4af37 0%, #f5d67b 50%, #d4af37 100%);
            border-radius: 50%;
            display: table;
            box-shadow: 0 5px 20px rgba(212, 175, 55, 0.4);
        }

        .grade-circle span {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            font-size: 30px;
            font-weight: bold;
            color: #1a1a2e;
        }

        .grade-label {
            font-size: 10px;
            color: #d4af37;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Footer Section */
        .footer-section {
            display: table;
            width: 100%;
            margin-top: 20px;
            table-layout: fixed;
        }

        .footer-column {
            display: table-cell;
            width: 33.33%;
            vertical-align: bottom;
            text-align: center;
            padding: 0 15px;
        }

        .signature-block {
            text-align: center;
        }

        .signature-line {
            width: 130px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #d4af37, transparent);
            margin: 0 auto 6px;
        }

        .signature-name {
            font-size: 12px;
            font-weight: bold;
            color: #ffffff;
        }

        .signature-title {
            font-size: 9px;
            color: rgba(255,255,255,0.5);
            margin-top: 2px;
        }

        /* Date Block */
        .date-block {
            text-align: center;
        }

        .date-icon {
            font-size: 18px;
            margin-bottom: 4px;
        }

        .date-value {
            font-size: 14px;
            color: #ffffff;
            font-weight: bold;
        }

        .date-label {
            font-size: 9px;
            color: rgba(255,255,255,0.5);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Seal */
        .official-seal {
            position: absolute;
            bottom: 45px;
            left: 45px;
            width: 80px;
            height: 80px;
        }

        .seal-outer {
            width: 100%;
            height: 100%;
            border: 3px solid #d4af37;
            border-radius: 50%;
            position: relative;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
        }

        .seal-inner {
            position: absolute;
            top: 6px;
            left: 6px;
            right: 6px;
            bottom: 6px;
            border: 1px solid rgba(212, 175, 55, 0.5);
            border-radius: 50%;
            display: table;
            width: calc(100% - 12px);
            height: calc(100% - 12px);
        }

        .seal-content {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
        }

        .seal-icon {
            font-size: 20px;
            color: #d4af37;
        }

        .seal-text {
            font-size: 7px;
            color: #d4af37;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: bold;
            line-height: 1.3;
            margin-top: 2px;
        }

        /* Verification Section */
        .verification-section {
            position: absolute;
            bottom: 45px;
            right: 45px;
            text-align: right;
        }

        .verification-box {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 10px 14px;
        }

        .verification-label {
            font-size: 8px;
            color: rgba(255,255,255,0.5);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .verification-code {
            font-size: 13px;
            font-family: 'Courier New', monospace;
            color: #d4af37;
            font-weight: bold;
            letter-spacing: 2px;
            margin-top: 2px;
        }

        .verify-link {
            font-size: 8px;
            color: rgba(255,255,255,0.4);
            margin-top: 3px;
        }
    </style>
</head>
<body>
    <div class="certificate-wrapper">
        <!-- Background Pattern -->
        <div class="bg-pattern"></div>

        <div class="certificate-container">
            <!-- Inner Border -->
            <div class="inner-border"></div>

            <!-- Corner Ornaments -->
            <div class="corner-ornament corner-tl">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0 L100 0 L100 8 L8 8 L8 100 L0 100 Z" fill="#d4af37"/>
                    <path d="M15 15 L15 80 L20 80 L20 20 L80 20 L80 15 Z" fill="#d4af37" opacity="0.5"/>
                    <circle cx="12" cy="12" r="4" fill="#d4af37"/>
                </svg>
            </div>
            <div class="corner-ornament corner-tr">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0 L100 0 L100 8 L8 8 L8 100 L0 100 Z" fill="#d4af37"/>
                    <path d="M15 15 L15 80 L20 80 L20 20 L80 20 L80 15 Z" fill="#d4af37" opacity="0.5"/>
                    <circle cx="12" cy="12" r="4" fill="#d4af37"/>
                </svg>
            </div>
            <div class="corner-ornament corner-bl">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0 L100 0 L100 8 L8 8 L8 100 L0 100 Z" fill="#d4af37"/>
                    <path d="M15 15 L15 80 L20 80 L20 20 L80 20 L80 15 Z" fill="#d4af37" opacity="0.5"/>
                    <circle cx="12" cy="12" r="4" fill="#d4af37"/>
                </svg>
            </div>
            <div class="corner-ornament corner-br">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0 L100 0 L100 8 L8 8 L8 100 L0 100 Z" fill="#d4af37"/>
                    <path d="M15 15 L15 80 L20 80 L20 20 L80 20 L80 15 Z" fill="#d4af37" opacity="0.5"/>
                    <circle cx="12" cy="12" r="4" fill="#d4af37"/>
                </svg>
            </div>

            <!-- Award Ribbon -->
            <div class="award-ribbon">
                <div class="ribbon-body">
                    <div class="ribbon-icon">🏆</div>
                </div>
                <div class="ribbon-tail-left"></div>
                <div class="ribbon-tail-right"></div>
            </div>

            <!-- Header -->
            <div class="header">
                <div class="logo-container">
                    <div class="logo-box"></div>
                    <div class="company-info">
                        <h2 class="company-name">CodeSprint Labs</h2>
                        <div class="tagline">Empowering Future Tech Leaders</div>
                    </div>
                </div>
            </div>

            <!-- Certificate Title -->
            <div class="certificate-title">
                <h1 class="main-title">Certificate</h1>
                <div class="subtitle">of Internship Completion</div>
            </div>

            <!-- Decorative Divider -->
            <div class="divider">
                <div class="divider-content">
                    <span class="divider-line"></span>
                    <span class="divider-star">✦</span>
                    <span class="divider-line"></span>
                </div>
            </div>

            <!-- Recipient Section -->
            <div class="recipient-section">
                <div class="certify-text">This is to certify that</div>
                <div class="recipient-name">{{ $studentName }}</div>
            </div>

            <!-- Program Section -->
            <div class="program-section">
                <div class="completion-text">Has successfully completed the virtual internship program in</div>
                <div class="program-name">{{ $internshipTitle }}</div>
                @if(isset($internshipDomain) && $internshipDomain)
                <div class="program-domain">{{ $internshipDomain }}</div>
                @endif
                <div class="program-duration">Duration: {{ $internshipDuration ?? 'N/A' }}</div>
            </div>

            <!-- Performance Section -->
            @if(isset($marks) && $marks !== null)
            <div class="performance-section">
                <div class="performance-card">
                    <div class="stat-box">
                        <div class="stat-value">{{ $tasksCompleted ?? '0' }}/{{ $totalTasks ?? '0' }}</div>
                        <div class="stat-label">Tasks Completed</div>
                    </div>
                </div>
                <div class="performance-card">
                    <div class="grade-box">
                        <div class="grade-circle">
                            <span>{{ $grade }}</span>
                        </div>
                        <div class="grade-label">Grade Achieved</div>
                    </div>
                </div>
                <div class="performance-card">
                    <div class="stat-box">
                        <div class="stat-value">{{ $marks }}/50</div>
                        <div class="stat-label">Final Score</div>
                    </div>
                </div>
                <div class="performance-card">
                    <div class="stat-box">
                        <div class="stat-value">{{ round(($marks / 50) * 100) }}%</div>
                        <div class="stat-label">Percentage</div>
                    </div>
                </div>
            </div>
            @endif

            <!-- Footer Section -->
            <div class="footer-section">
                <div class="footer-column">
                    <div class="signature-block">
                        <div class="signature-line"></div>
                        <div class="signature-name">Program Mentor</div>
                        <div class="signature-title">Technical Lead</div>
                    </div>
                </div>
                <div class="footer-column">
                    <div class="date-block">
                        <div class="date-icon">📅</div>
                        <div class="date-value">{{ $issueDate }}</div>
                        <div class="date-label">Date of Issue</div>
                    </div>
                </div>
                <div class="footer-column">
                    <div class="signature-block">
                        <div class="signature-line"></div>
                        <div class="signature-name">CEO & Founder</div>
                        <div class="signature-title">CodeSprint Labs</div>
                    </div>
                </div>
            </div>

            <!-- Official Seal -->
            <div class="official-seal">
                <div class="seal-outer">
                    <div class="seal-inner">
                        <div class="seal-content">
                            <div class="seal-icon">✓</div>
                            <div class="seal-text">Verified<br/>Certificate</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Verification Section -->
            <div class="verification-section">
                <div class="verification-box">
                    <div class="verification-label">Certificate ID</div>
                    <div class="verification-code">{{ $verificationCode }}</div>
                    <div class="verify-link">Verify at: codesprintlabs.com/verify</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
