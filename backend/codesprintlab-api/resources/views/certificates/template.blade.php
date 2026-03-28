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
            margin-top: 50px;
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
            font-size: 14pt;
            color: #666;
            margin-bottom: 10px;
            font-style: italic;
        }

        /* Student Name */
        .student-name {
            font-size: 40pt;
            font-family: 'Times New Roman', serif;
            font-weight: bold;
            color: #0066cc;
            margin: 10px 0 30px;
            background: linear-gradient(to right, transparent, #f0f7ff, transparent);
            padding: 10px 0;
            border-top: 1px solid #e0e8f0;
            border-bottom: 1px solid #e0e8f0;
        }

        /* Program Details */
        .program-title {
            font-size: 24pt;
            font-weight: bold;
            color: #1a1a2e;
            margin: 20px 0 40px;
            text-transform: uppercase;
            letter-spacing: 1px;
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
            width: 110px;
            height: 110px;
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
                <div class="student-name">{{ $name }}</div>

                <div class="presentation-text">For the successful completion of the course</div>

                <!-- Program -->
                <div class="program-title" style="color: #0066cc;">
                    {{ $course }}
                </div>

                <!-- Signatures & Seal -->
                <div class="signatures-section">
                    <div class="sig-block">
                        <!-- Simulated Signature -->
                        <div
                            style="font-family: 'Brush Script MT', cursive; font-size: 24pt; color: #0066cc; margin-bottom: 5px;">
                            M. Sharma
                        </div>
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
                                <text x="50" y="45" font-family="Arial" font-size="8" font-weight="bold" fill="#0066cc"
                                    text-anchor="middle">VERIFIED</text>
                                <text x="50" y="55" font-family="Arial" font-size="8" font-weight="bold" fill="#0066cc"
                                    text-anchor="middle">CERTIFICATE</text>
                                <path d="M35 65 L45 75 L65 55" fill="none" stroke="#d4af37" stroke-width="3" />
                            </svg>
                        </div>
                    </div>

                    <div class="sig-block">
                        <!-- Simulated Signature -->
                        <div
                            style="font-family: 'Brush Script MT', cursive; font-size: 24pt; color: #0066cc; margin-bottom: 5px;">
                            K. Patel
                        </div>
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
                    Certificate ID: <strong>{{ $id }}</strong>
                </div>
                <div class="ver-right">
                    Issued on: <strong>{{ $date }}</strong>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
