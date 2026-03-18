<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Certificate of Completion - CodeSprint Labs</title>
    <!-- Use Google Fonts for better typography -->
    <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Great+Vibes&display=swap"
        rel="stylesheet">
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }

        body {
            font-family: 'Montserrat', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f4f6f9;
            /* Outer background */
            color: #1a1a2e;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;

            @media print {
                background: white;
            }
        }

        .cert-container {
            width: 29.7cm;
            height: 21cm;
            padding: 20px;
            box-sizing: border-box;
            background: #ffffff;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
            /* Modern shadow effect */
            position: relative;
        }

        .page-border {
            position: relative;
            width: 100%;
            height: 100%;
            background: #ffffff;
            border: 15px solid #002d5b;
            box-shadow: inset 0 0 0 4px #d4af37, inset 0 0 0 10px #ffffff, inset 0 0 0 12px #002d5b;
            padding: 2px;
            box-sizing: border-box;
            overflow: hidden;
            border-radius: 4px;
            /* Slight rounding */
        }

        .inner-border {
            position: relative;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(246, 249, 252, 1) 100%);
            border: 2px solid #d4af37;
            box-sizing: border-box;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        /* Elaborate Background Pattern */
        .bg-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.04;
            z-index: 0;
            pointer-events: none;
            background-image: radial-gradient(#002d5b 1px, transparent 1px);
            background-size: 20px 20px;
        }

        .corner-decoration {
            position: absolute;
            width: 140px;
            height: 140px;
            z-index: 1;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
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
            padding: 30px 60px 40px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            box-sizing: border-box;
        }

        /* Header Logo */
        .header-logo {
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }

        .logo-svg {
            width: 65px;
            height: 65px;
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }

        .logo-text {
            text-align: left;
        }

        .logo-main {
            font-size: 26pt;
            font-weight: 800;
            font-family: 'Cinzel', serif;
            color: #002d5b;
            line-height: 1;
            letter-spacing: 1px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
            /* Text shadow effect */
        }

        .logo-sub {
            font-size: 8.5pt;
            color: #d4af37;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            font-weight: 600;
            margin-top: 5px;
        }

        /* Main Title */
        .cert-label {
            font-size: 11pt;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 5px;
            margin-top: 15px;
            font-weight: 600;
        }

        .cert-title {
            font-size: 46pt;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            color: #002d5b;
            margin: 5px 0 20px;
            letter-spacing: 2px;
            text-transform: uppercase;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .presentation-text {
            font-size: 13pt;
            color: #666;
            margin-bottom: 5px;
            font-style: italic;
            font-weight: 500;
        }

        /* Student Name */
        .student-name {
            font-size: 48pt;
            font-family: 'Great Vibes', cursive;
            /* Fancy cursive font */
            color: #003a7a;
            margin: 0px 0 10px;
            padding: 10px 40px;
            display: inline-block;
            position: relative;
            text-shadow: 1px 1px 2px rgba(0, 100, 204, 0.2);
        }

        .student-name-wrapper {
            position: relative;
            margin: 0 auto 10px;
            display: inline-block;
        }

        .student-name-line {
            height: 2px;
            width: 100%;
            background: linear-gradient(90deg, transparent, #d4af37, transparent);
            margin: 0 auto;
        }

        /* Program Details */
        .program-block {
            margin: 15px 0;
        }

        .program-title {
            font-size: 22pt;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            color: #002d5b;
            margin: 10px 0;
            letter-spacing: 1px;
            text-transform: uppercase;
            position: relative;
            display: inline-block;
        }

        .info-grid {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 20px auto 0;
            max-width: 900px;
        }

        .info-cell {
            flex: 1;
            background: #ffffff;
            border: 1px solid rgba(212, 175, 55, 0.4);
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
            /* Subtle card shadow */
            transition: transform 0.3s ease;
        }

        .info-cell:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
        }

        .info-icon {
            color: #d4af37;
            margin-bottom: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .info-label {
            font-size: 9pt;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 4px;
            font-weight: 600;
        }

        .info-value {
            font-size: 12pt;
            font-weight: 700;
            color: #002d5b;
        }

        /* Footer / Signatures */
        .signatures-section {
            margin-top: 35px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 40px;
            box-sizing: border-box;
        }

        .sig-block {
            width: 250px;
            text-align: center;
            position: relative;
        }

        .sig-image {
            height: 60px;
            margin-bottom: 5px;
            /* In a real app, use an img tag for actual signatures */
            font-family: 'Great Vibes', cursive;
            font-size: 32pt;
            color: #001a33;
            opacity: 0.8;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .sig-line {
            width: 100%;
            border-bottom: 1.5px solid #002d5b;
            margin-bottom: 10px;
        }

        .sig-name {
            font-weight: 700;
            font-size: 11pt;
            color: #1a1a2e;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .sig-title {
            font-size: 9pt;
            color: #666;
            margin-top: 2px;
            font-weight: 500;
        }

        .badge-block {
            flex-shrink: 0;
            position: relative;
            top: 10px;
        }

        /* Official Gold Seal with 3D Effect */
        .gold-seal {
            width: 120px;
            height: 120px;
            margin: 0 auto;
            position: relative;
            filter: drop-shadow(0 8px 12px rgba(212, 175, 55, 0.3));
        }

        /* Verification Bar at bottom */
        .verification-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: #002d5b;
            color: rgba(255, 255, 255, 0.9);
            padding: 10px 40px;
            font-size: 9pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 20;
            border-top: 2px solid #d4af37;
        }

        .verification-bar strong {
            color: #fff;
            letter-spacing: 0.5px;
        }

        .qr-code {
            position: absolute;
            bottom: 55px;
            right: 40px;
            width: 75px;
            height: 75px;
            background: white;
            padding: 4px;
            border: 2px solid #e0e0e0;
            border-radius: 4px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
            /* Nice drop shadow on QR */
            z-index: 20;
        }

        /* Ribbons for the seal */
        .ribbon-left,
        .ribbon-right {
            position: absolute;
            bottom: -15px;
            width: 30px;
            height: 40px;
            background: linear-gradient(135deg, #a50d12, #e52d27);
            z-index: -1;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
        }

        .ribbon-left {
            left: 20px;
            transform: rotate(15deg);
            clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
        }

        .ribbon-right {
            right: 20px;
            transform: rotate(-15deg);
            clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
        }
    </style>
</head>

<body>
    <div class="cert-container">
        <div class="page-border">
            <div class="inner-border">

                <!-- Subtle Background Pattern -->
                <div class="bg-pattern"></div>

                <!-- Ornate Decorative Corners (SVG with Gold Gradients) -->
                <svg class="corner-decoration top-left" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#bf953f" />
                            <stop offset="50%" stop-color="#fcf6ba" />
                            <stop offset="100%" stop-color="#b38728" />
                        </linearGradient>
                        <linearGradient id="blue" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#001a33" />
                            <stop offset="100%" stop-color="#004080" />
                        </linearGradient>
                    </defs>
                    <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="url(#blue)" />
                    <path d="M25 25 L80 25 L80 32 L32 32 L32 80 L25 80 Z" fill="url(#gold)" />
                    <circle cx="12" cy="12" r="3" fill="#d4af37" />
                </svg>
                <svg class="corner-decoration top-right" viewBox="0 0 100 100">
                    <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="url(#blue)" />
                    <path d="M25 25 L80 25 L80 32 L32 32 L32 80 L25 80 Z" fill="url(#gold)" />
                    <circle cx="12" cy="12" r="3" fill="#d4af37" />
                </svg>
                <svg class="corner-decoration bottom-left" viewBox="0 0 100 100">
                    <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="url(#blue)" />
                    <path d="M25 25 L80 25 L80 32 L32 32 L32 80 L25 80 Z" fill="url(#gold)" />
                    <circle cx="12" cy="12" r="3" fill="#d4af37" />
                </svg>
                <svg class="corner-decoration bottom-right" viewBox="0 0 100 100">
                    <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="url(#blue)" />
                    <path d="M25 25 L80 25 L80 32 L32 32 L32 80 L25 80 Z" fill="url(#gold)" />
                    <circle cx="12" cy="12" r="3" fill="#d4af37" />
                </svg>

                <div class="content">
                    <!-- Header with Logo -->
                    <div class="header-logo">
                        <div class="logo-svg">
                            <!-- CodeSprint Hex Logo SVG -->
                            <svg viewBox="0 0 100 100" width="100%" height="100%">
                                <polygon points="50,2 98,25 98,75 50,98 2,75 2,25" fill="url(#blue)" />
                                <polygon points="50,12 85,32 85,68 50,88 15,68 15,32" fill="#ffffff" />
                                <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="url(#gold)" />
                                <text x="50" y="65" font-family="'Cinzel', serif" font-size="36" font-weight="bold"
                                    fill="#ffffff" text-anchor="middle">CS</text>
                            </svg>
                        </div>
                        <div class="logo-text">
                            <div class="logo-main">CodeSprint Labs</div>
                            <div class="logo-sub">Empowering Future Tech Leaders</div>
                        </div>
                    </div>

                    <!-- Titles -->
                    <div class="cert-label">Official Document of Achievement</div>
                    <div class="cert-title">Certificate of Completion</div>

                    <div class="presentation-text">This certificate is proudly awarded to</div>

                    <!-- Name -->
                    <div class="student-name-wrapper">
                        <div class="student-name">{{ $studentName }}</div>
                        <div class="student-name-line"></div>
                    </div>

                    <div class="presentation-text">For the successful completion of the internship program</div>

                    <!-- Program -->
                    <div class="program-title">
                        {{ $internshipTitle }}
                    </div>

                    <!-- Info Grid with Icons -->
                    <div class="info-grid">
                        <div class="info-cell">
                            <div class="info-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8v2h14V8H5z" />
                                </svg>
                            </div>
                            <div class="info-label">Period</div>
                            <div class="info-value">
                                {{ \Carbon\Carbon::parse($startDate)->format('M d, Y') }} -
                                {{ \Carbon\Carbon::parse($endDate)->format('M d, Y') }}
                            </div>
                        </div>

                        <div class="info-cell">
                            <div class="info-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 7.13l.97 2.29.47 1.11 1.2.1 2.47.21-1.88 1.63-.91.79.27 1.18.56 2.41-2.12-1.28-1.03-.64-1.03.62-2.11 1.28.56-2.41.27-1.18-.91-.79-1.88-1.63 2.47-.21 1.2-.1.47-1.11.97-2.27M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                                </svg>
                            </div>
                            <div class="info-label">Performance</div>
                            <div class="info-value">{{ $grade ?? 'A' }} Grade ({{ $marks ?? 'N/A' }})</div>
                        </div>

                        <div class="info-cell">
                            <div class="info-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
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
                            <div class="sig-image">M. Sharma</div>
                            <div class="sig-line"></div>
                            <div class="sig-name">Mahesh Sharma</div>
                            <div class="sig-title">Program Director</div>
                        </div>

                        <div class="badge-block">
                            <!-- Official Gold Seal -->
                            <div class="gold-seal">
                                <div class="ribbon-left"></div>
                                <div class="ribbon-right"></div>
                                <svg viewBox="0 0 100 100" width="100%" height="100%">
                                    <!-- Rays Base -->
                                    <circle cx="50" cy="50" r="48" fill="url(#gold)" />
                                    <!-- Starburst points -->
                                    <path
                                        d="M50 0 L58 15 L74 6 L72 23 L89 20 L81 35 L98 38 L85 50 L98 62 L81 65 L89 80 L72 77 L74 94 L58 85 L50 100 L42 85 L26 94 L28 77 L11 80 L19 65 L2 62 L15 50 L2 38 L19 35 L11 20 L28 23 L26 6 L42 15 Z"
                                        fill="url(#gold)" />
                                    <!-- Inner circles -->
                                    <circle cx="50" cy="50" r="38" fill="#ffffff" />
                                    <circle cx="50" cy="50" r="35" fill="none" stroke="url(#gold)"
                                        stroke-width="1.5" stroke-dasharray="2,2" />
                                    <circle cx="50" cy="50" r="32" fill="url(#blue)" />

                                    <!-- Content inside seal -->
                                    <path id="curve" d="M 28 50 A 22 22 0 1 1 72 50" fill="transparent" />
                                    <text font-family="'Cinzel', serif" font-size="8.5" font-weight="bold"
                                        fill="#ffffff" letter-spacing="1px">
                                        <textPath href="#curve" startOffset="50%" text-anchor="middle">OFFICIAL
                                        </textPath>
                                    </text>

                                    <text x="50" y="58" font-family="'Cinzel', serif" font-size="9"
                                        font-weight="bold" fill="#d4af37" text-anchor="middle">VERIFIED</text>
                                    <text x="50" y="68" font-family="'Montserrat', sans-serif" font-size="5"
                                        font-weight="600" fill="#ffffff" text-anchor="middle">CERTIFICATE</text>

                                    <!-- Small stars -->
                                    <polygon points="30,55 32,58 35,55 33,52" fill="#d4af37" />
                                    <polygon points="70,55 68,58 65,55 67,52" fill="#d4af37" />
                                </svg>
                            </div>
                        </div>

                        <div class="sig-block">
                            <!-- Simulated Signature -->
                            <div class="sig-image">K. Patel</div>
                            <div class="sig-line"></div>
                            <div class="sig-name">Kunal Patel</div>
                            <div class="sig-title">CEO & Founder</div>
                        </div>
                    </div>

                </div>

                <!-- Bottom Verification Bar -->
                <div class="verification-bar">
                    <div class="ver-left">
                        CERTIFICATE ID: <strong>{{ $verificationCode }}</strong>
                    </div>
                    <div class="ver-right">
                        ISSUED ON: <strong>{{ \Carbon\Carbon::parse($issueDate)->format('d F Y') }}</strong>
                    </div>
                </div>
            </div>

            <!-- QR Code Block - Overlay on top of everything -->
            <div class="qr-code">
                <!-- Generic static QR stand-in, backend might replace this with real QR library output -->
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <rect width="100" height="100" fill="white" />
                    <path d="M10 10 h25 v25 h-25 z M65 10 h25 v25 h-25 z M10 65 h25 v25 h-25 z" fill="#002d5b" />
                    <path d="M15 15 h15 v15 h-15 z M70 15 h15 v15 h-15 z M15 70 h15 v15 h-15 z" fill="white" />
                    <path d="M18 18 h9 v9 h-9 z M73 18 h9 v9 h-9 z M18 73 h9 v9 h-9 z" fill="#002d5b" />
                    <rect x="42" y="42" width="16" height="16" fill="#002d5b" />
                    <rect x="45" y="10" width="12" height="25" fill="#d4af37" />
                    <rect x="10" y="45" width="25" height="12" fill="#002d5b" />
                    <rect x="65" y="65" width="25" height="25" fill="#d4af37" />
                    <rect x="70" y="70" width="15" height="15" fill="white" />
                    <rect x="73" y="73" width="9" height="9" fill="#002d5b" />
                </svg>
            </div>
        </div>
    </div>
</body>

</html>
