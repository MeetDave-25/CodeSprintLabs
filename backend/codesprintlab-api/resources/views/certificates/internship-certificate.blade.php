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
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #1a1a2e;
        }

        .page-border {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 20px solid #f0f4f8;
            padding: 20px;
            box-sizing: border-box;
        }

        .inner-border {
            position: relative;
            width: 100%;
            height: 100%;
            border: 1px solid #cce0ff;
            background: #fff;
            box-sizing: border-box;
            overflow: hidden;
        }

        /* Elaborate Background Pattern */
        .bg-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.03;
            z-index: 0;
        }

        .corner-decoration {
            position: absolute;
            width: 150px;
            height: 150px;
            z-index: 1;
        }

        .top-left {
            top: 0;
            left: 0;
        }

        .top-right {
            top: 0;
            right: 0;
            transform: rotate(90deg);
        }

        .bottom-left {
            bottom: 0;
            left: 0;
            transform: rotate(-90deg);
        }

        .bottom-right {
            bottom: 0;
            right: 0;
            transform: rotate(180deg);
        }

        .content {
            position: relative;
            z-index: 10;
            text-align: center;
            padding: 40px 60px;
            height: 100%;
            box-sizing: border-box;
        }

        /* Header Logo */
        .header-logo {
            margin-bottom: 20px;
        }

        .logo-svg {
            width: 60px;
            height: 60px;
            display: inline-block;
            vertical-align: middle;
        }

        .logo-text {
            display: inline-block;
            vertical-align: middle;
            text-align: left;
            margin-left: 15px;
        }

        .logo-main {
            font-size: 24pt;
            font-weight: 800;
            color: #0066cc;
            line-height: 1;
            letter-spacing: -0.5px;
        }

        .logo-sub {
            font-size: 8pt;
            color: #666;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-top: 3px;
        }

        /* Main Title */
        .cert-label {
            font-size: 14pt;
            color: #d4af37;
            text-transform: uppercase;
            letter-spacing: 4px;
            margin-top: 30px;
            font-weight: 600;
        }

        .cert-title {
            font-size: 42pt;
            font-family: 'Times New Roman', serif;
            color: #1a1a2e;
            margin: 5px 0 30px;
            letter-spacing: 1px;
        }

        .presentation-text {
            font-size: 12pt;
            color: #666;
            margin-bottom: 10px;
            font-style: italic;
        }

        /* Student Name */
        .student-name {
            font-size: 36pt;
            font-family: 'Times New Roman', serif;
            font-weight: bold;
            color: #0066cc;
            margin: 10px 0 20px;
            background: linear-gradient(to right, transparent, #f0f7ff, transparent);
            padding: 10px 0;
            border-top: 1px solid #e0e8f0;
            border-bottom: 1px solid #e0e8f0;
        }

        /* Program Details */
        .program-block {
            margin: 30px 0;
        }

        .program-intro {
            font-size: 14pt;
            color: #444;
        }

        .program-title {
            font-size: 20pt;
            font-weight: bold;
            color: #1a1a2e;
            margin: 10px 0;
        }

        .info-grid {
            display: table;
            width: 100%;
            margin: 20px 0;
            border-collapse: separate;
            border-spacing: 20px;
        }

        .info-cell {
            display: table-cell;
            width: 33%;
            vertical-align: middle;
            background: #fdfdfd;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 12px;
        }

        .info-icon {
            color: #d4af37;
            font-size: 16pt;
            margin-bottom: 5px;
            display: block;
        }

        .info-label {
            font-size: 9pt;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 2px;
        }

        .info-value {
            font-size: 12pt;
            font-weight: bold;
            color: #333;
        }

        /* Footer / Signatures */
        .signatures-section {
            margin-top: 50px;
            width: 100%;
            display: table;
        }

        .sig-block {
            display: table-cell;
            width: 35%;
            text-align: center;
            vertical-align: bottom;
        }

        .sig-line {
            width: 80%;
            margin: 0 auto;
            border-bottom: 1px solid #bbb;
            margin-bottom: 8px;
        }

        .sig-name {
            font-weight: bold;
            font-size: 11pt;
            color: #1a1a2e;
        }

        .sig-title {
            font-size: 9pt;
            color: #666;
        }

        .badge-block {
            display: table-cell;
            width: 30%;
            text-align: center;
            vertical-align: middle;
        }

        /* Official Gold Seal */
        .gold-seal {
            width: 100px;
            height: 100px;
            margin: 0 auto;
        }

        /* Verification Bar at bottom */
        .verification-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: #0066cc;
            color: white;
            padding: 8px 40px;
            font-size: 9pt;
            display: table;
            width: 100%;
        }

        .ver-left {
            display: table-cell;
            text-align: left;
        }

        .ver-right {
            display: table-cell;
            text-align: right;
        }

        .qr-code {
            position: absolute;
            bottom: 60px;
            right: 40px;
            width: 70px;
            height: 70px;
            border: 4px solid white;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>

<body>
    <div class="page-border">
        <div class="inner-border">

            <!-- SVG Background Pattern -->
            <svg class="bg-pattern" width="100%" height="100%">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M0 40 L40 0 H20 L0 20 M40 40 V20 L20 40" stroke="#0066cc" stroke-width="0.5"
                            fill="none" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            <!-- Decorative Corners (SVG) -->
            <svg class="corner-decoration top-left" viewBox="0 0 100 100">
                <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="#0066cc" />
                <path d="M25 25 L80 25 L80 30 L30 30 L30 80 L25 80 Z" fill="#d4af37" />
            </svg>
            <svg class="corner-decoration top-right" viewBox="0 0 100 100">
                <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="#0066cc" />
                <path d="M25 25 L80 25 L80 30 L30 30 L30 80 L25 80 Z" fill="#d4af37" />
            </svg>
            <svg class="corner-decoration bottom-left" viewBox="0 0 100 100">
                <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="#0066cc" />
                <path d="M25 25 L80 25 L80 30 L30 30 L30 80 L25 80 Z" fill="#d4af37" />
            </svg>
            <svg class="corner-decoration bottom-right" viewBox="0 0 100 100">
                <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="#0066cc" />
                <path d="M25 25 L80 25 L80 30 L30 30 L30 80 L25 80 Z" fill="#d4af37" />
            </svg>

            <div class="content">
                <!-- Header with Logo -->
                <div class="header-logo">
                    <div class="logo-svg">
                        <!-- CodeSprint Hex Logo SVG -->
                        <svg viewBox="0 0 100 100" width="60" height="60">
                            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#0066cc" />
                            <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#ffffff" />
                            <text x="50" y="65" font-family="Arial" font-size="40" font-weight="bold" fill="#0066cc"
                                text-anchor="middle">CS</text>
                        </svg>
                    </div>
                    <div class="logo-text">
                        <div class="logo-main">CodeSprint Labs</div>
                        <div class="logo-sub">Empowering Future Tech Leaders</div>
                    </div>
                </div>

                <!-- Titles -->
                <div class="cert-label">Official Document</div>
                <div class="cert-title">Certificate of Completion</div>

                <div class="presentation-text">This certificate is proudly awarded to</div>

                <!-- Name -->
                <div class="student-name">{{ $studentName }}</div>

                <div class="presentation-text">For the successful completion of the internship program</div>

                <!-- Program -->
                <div class="program-title" style="color: #0066cc; text-transform: uppercase; letter-spacing: 1px;">
                    {{ $internshipTitle }}
                </div>

                <!-- Info Grid with Icons -->
                <div class="info-grid">
                    <div class="info-cell">
                        <div class="info-icon">
                            <!-- Calendar Icon -->
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8v2h14V8H5z" />
                            </svg>
                        </div>
                        <div class="info-label">Period</div>
                        <div class="info-value">
                            {{ \Carbon\Carbon::parse($startDate)->format('M Y') }} -
                            {{ \Carbon\Carbon::parse($endDate)->format('M Y') }}
                        </div>
                    </div>

                    <div class="info-cell">
                        <div class="info-icon">
                            <!-- Medal Icon -->
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 7.13l.97 2.29.47 1.11 1.2.1 2.47.21-1.88 1.63-.91.79.27 1.18.56 2.41-2.12-1.28-1.03-.64-1.03.62-2.11 1.28.56-2.41.27-1.18-.91-.79-1.88-1.63 2.47-.21 1.2-.1.47-1.11.97-2.27M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                            </svg>
                        </div>
                        <div class="info-label">Performance</div>
                        <div class="info-value">{{ $grade }} Grade ({{ $marks ?? 'N/A' }})</div>
                    </div>

                    <div class="info-cell">
                        <div class="info-icon">
                            <!-- Clock/Duration Icon -->
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                            </svg>
                        </div>
                        <div class="info-label">Duration</div>
                        <div class="info-value">{{ $internshipDuration ?? 'Unknown' }}</div>
                    </div>
                </div>

                <!-- Signatures & Seal -->
                <div class="signatures-section">
                    <div class="sig-block">
                        <!-- Simulated Signature -->
                        <div
                            style="font-family: 'Brush Script MT', cursive; font-size: 24pt; color: #0066cc; margin-bottom: 5px;">
                            M. Sharma</div>
                        <div class="sig-line"></div>
                        <div class="sig-name">Mahesh Sharma</div>
                        <div class="sig-title">Program Director</div>
                    </div>

                    <div class="badge-block">
                        <!-- Official Gold Seal SVG -->
                        <div class="gold-seal">
                            <svg viewBox="0 0 100 100">
                                <!-- Rays -->
                                <circle cx="50" cy="50" r="48" fill="#d4af37" opacity="0.2" />
                                <path
                                    d="M50 0 L60 20 L80 10 L80 30 L100 40 L80 50 L100 60 L80 70 L80 90 L60 80 L50 100 L40 80 L20 90 L20 70 L0 60 L20 50 L0 40 L20 30 L20 10 L40 20 Z"
                                    fill="#d4af37" />
                                <!-- Inner Circle -->
                                <circle cx="50" cy="50" r="35" fill="#ffffff" />
                                <circle cx="50" cy="50" r="30" fill="none" stroke="#0066cc"
                                    stroke-width="2" />
                                <!-- Content -->
                                <text x="50" y="45" font-family="Arial" font-size="8" font-weight="bold"
                                    fill="#0066cc" text-anchor="middle">VERIFIED</text>
                                <text x="50" y="55" font-family="Arial" font-size="8" font-weight="bold"
                                    fill="#0066cc" text-anchor="middle">CERTIFICATE</text>
                                <path d="M35 65 L45 75 L65 55" fill="none" stroke="#d4af37" stroke-width="3" />
                            </svg>
                        </div>
                    </div>

                    <div class="sig-block">
                        <!-- Simulated Signature -->
                        <div
                            style="font-family: 'Brush Script MT', cursive; font-size: 24pt; color: #0066cc; margin-bottom: 5px;">
                            K. Patel</div>
                        <div class="sig-line"></div>
                        <div class="sig-name">Kunal Patel</div>
                        <div class="sig-title">CEO & Founder</div>
                    </div>
                </div>

                <!-- QR Code Block -->
                <div class="qr-code">
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                        <rect width="100" height="100" fill="white" />
                        <path d="M10 10 h30 v30 h-30 z M60 10 h30 v30 h-30 z M10 60 h30 v30 h-30 z" fill="black" />
                        <path d="M20 20 h10 v10 h-10 z M70 20 h10 v10 h-10 z M20 70 h10 v10 h-10 z" fill="white"
                            stroke="black" stroke-width="2" />
                        <rect x="45" y="45" width="10" height="10" fill="black" />
                        <rect x="45" y="10" width="10" height="30" fill="black" />
                        <rect x="10" y="45" width="30" height="10" fill="black" />
                        <rect x="60" y="60" width="30" height="30" fill="black" opacity="0.5" />
                    </svg>
                </div>
            </div>

            <!-- Bottom Verification Bar -->
            <div class="verification-bar">
                <div class="ver-left">
                    Certificate ID: <strong>{{ $verificationCode }}</strong>
                </div>
                <div class="ver-right">
                    Issued on: <strong>{{ \Carbon\Carbon::parse($issueDate)->format('d F Y') }}</strong>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
