<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificate of Completion</title>
    <style>
        @page { margin: 0; }
        body { margin: 0; padding: 0; font-family: 'Helvetica', 'Arial', sans-serif; }
        
        .background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        }

        /* If no custom image, use a fallback border style */
        .fallback-border {
            width: 100%;
            height: 100vh;
            border: 20px solid #6d28d9;
            box-sizing: border-box;
            position: absolute;
            top: 0;
            left: 0;
        }

        .content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            text-align: center;
        }

        /* Adjust these top margins based on where the text should sit on the custom image */
        .header { margin-top: 150px; }
        .recipient {
            font-size: 40px;
            font-weight: bold;
            color: #111827;
            margin-top: 60px;
            margin-bottom: 20px;
        }
        .course {
            font-size: 28px;
            font-weight: bold;
            color: #6d28d9;
            margin-top: 30px;
        }
        .date {
            position: absolute;
            bottom: 120px;
            left: 150px;
            font-size: 16px;
        }
        .code {
            position: absolute;
            bottom: 20px;
            right: 20px;
            font-size: 10px;
            color: #999;
        }
    </style>
</head>
<body>
    <!-- 
      LOGIC: If 'certificate_bg.jpg' exists in public/images, use it. 
      Otherwise, use the simple border design.
    -->
    @php
        $bgPath = public_path('images/certificate_bg.jpg');
        $hasCustomBg = file_exists($bgPath);
    @endphp

    @if($hasCustomBg)
        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents($bgPath)) }}" class="background" />
    @else
        <div class="fallback-border"></div>
    @endif

    <div class="content">
        @if(!$hasCustomBg)
            <!-- Only show default header text if NO custom background (assuming custom bg has its own text) -->
            <div class="header" style="margin-top: 60px">
                <h1 style="color: #6d28d9; margin-bottom: 10px;">CodeSprint Labs</h1>
                <h2 style="color: #333; text-transform: uppercase;">Certificate of Completion</h2>
                <p style="color: #666; font-size: 18px;">This is to certify that</p>
            </div>
        @else
            <!-- If custom background, we might need invisible spacers or specific margins -->
            <div style="height: 250px;"></div> 
        @endif

        <div class="recipient">
            {{ $name }}
        </div>

        @if(!$hasCustomBg)
            <div style="font-size: 18px; color: #666; margin: 20px 0;">has successfully completed the course</div>
        @else
            <!-- Adjust spacing for custom bg -->
            <div style="height: 20px;"></div>
        @endif

        <div class="course">
            {{ $course }}
        </div>

        @if($hasCustomBg)
            <!-- Custom positioning for Date and ID usually needed for pre-designed certs -->
            <div style="position: absolute; bottom: 150px; left: 200px; font-size: 18px;">
                {{ $date }}
            </div>
             <div style="position: absolute; bottom: 50px; right: 50px; font-size: 12px; color: #555;">
                ID: {{ $id }}
            </div>
        @else
            <div style="margin-top: 60px; font-size: 14px; color: #999;">
                Issued: {{ $date }} <br>
                Certificate ID: {{ $id }} <br>
                Verify at: {{ env('APP_URL') }}/verify-certificate/{{ $id }}
            </div>
        @endif
    </div>
</body>
</html>
