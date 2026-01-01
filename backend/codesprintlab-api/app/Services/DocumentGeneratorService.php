<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DocumentGeneratorService
{
    protected $companyName = 'CodeSprint Labs';
    protected $companyAddress = 'Bangalore, India';
    protected $companyEmail = 'contact@codesprintlabs.com';
    protected $companyWebsite = 'www.codesprintlabs.com';

    /**
     * Generate MOU (Memorandum of Understanding) document
     */
    public function generateMOU(array $data): string
    {
        $html = $this->getMOUTemplate($data);
        return $this->generatePDF($html, 'mou', $data['enrollmentId']);
    }

    /**
     * Generate Offer Letter document
     */
    public function generateOfferLetter(array $data): string
    {
        $html = $this->getOfferLetterTemplate($data);
        return $this->generatePDF($html, 'offer_letter', $data['enrollmentId']);
    }

    /**
     * Generate PDF from HTML content
     */
    protected function generatePDF(string $html, string $type, string $enrollmentId): string
    {
        // Create directory if not exists
        $directory = 'documents/' . $type;
        if (!Storage::exists($directory)) {
            Storage::makeDirectory($directory);
        }

        $filename = $type . '_' . $enrollmentId . '_' . time() . '.pdf';
        $path = $directory . '/' . $filename;

        // For now, we'll save HTML and convert to PDF
        // In production, you would use a PDF library like dompdf, mpdf, or wkhtmltopdf
        
        // Try to use dompdf if available
        if (class_exists('\Dompdf\Dompdf')) {
            $dompdf = new \Dompdf\Dompdf();
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();
            
            Storage::put($path, $dompdf->output());
        } else {
            // Fallback: Save as HTML file (can be converted later)
            $path = str_replace('.pdf', '.html', $path);
            Storage::put($path, $html);
            
            Log::warning('dompdf not installed. Saving as HTML. Install with: composer require dompdf/dompdf');
        }

        return $path;
    }

    /**
     * Get MOU HTML template
     */
    protected function getMOUTemplate(array $data): string
    {
        $date = date('F d, Y');
        
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Memorandum of Understanding</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #333;
            padding: 40px 60px;
            background: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px double #1a365d;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 28pt;
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 10pt;
            color: #666;
            letter-spacing: 2px;
        }
        .title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            color: #1a365d;
            margin: 30px 0;
            text-decoration: underline;
        }
        .date {
            text-align: right;
            margin-bottom: 20px;
            font-style: italic;
        }
        .section {
            margin: 20px 0;
        }
        .section-title {
            font-weight: bold;
            font-size: 13pt;
            color: #1a365d;
            margin-bottom: 10px;
        }
        .parties {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #1a365d;
        }
        .terms {
            margin: 20px 0;
        }
        .terms li {
            margin: 10px 0;
            padding-left: 10px;
        }
        .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 60px;
            padding-top: 10px;
        }
        .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 10pt;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .highlight {
            background: #e8f4f8;
            padding: 2px 5px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">{$this->companyName}</div>
        <div class="subtitle">INTERNSHIP PROGRAM</div>
    </div>

    <div class="title">MEMORANDUM OF UNDERSTANDING</div>

    <div class="date">Date: {$date}</div>

    <div class="parties">
        <div class="section-title">PARTIES TO THIS AGREEMENT:</div>
        <p><strong>Party A (Company):</strong> {$this->companyName}, located at {$this->companyAddress}</p>
        <p><strong>Party B (Intern):</strong> {$data['studentName']}, Email: {$data['studentEmail']}</p>
    </div>

    <div class="section">
        <div class="section-title">INTERNSHIP DETAILS:</div>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd; width: 40%;"><strong>Internship Program:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">{$data['internshipTitle']}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Domain:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">{$data['internshipDomain']}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Duration:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">{$data['internshipDuration']}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Start Date:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">{$data['startDate']}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>End Date:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">{$data['endDate']}</td>
            </tr>
        </table>
    </div>

    <div class="terms">
        <div class="section-title">TERMS AND CONDITIONS:</div>
        <ol>
            <li><strong>Purpose:</strong> This MOU establishes the terms of the internship program between the Company and the Intern.</li>
            <li><strong>Responsibilities of the Intern:</strong>
                <ul>
                    <li>Complete all assigned tasks and projects within the specified deadlines</li>
                    <li>Maintain professional conduct throughout the internship period</li>
                    <li>Attend all mandatory training sessions and meetings</li>
                    <li>Submit daily/weekly progress reports as required</li>
                </ul>
            </li>
            <li><strong>Responsibilities of the Company:</strong>
                <ul>
                    <li>Provide necessary training materials and resources</li>
                    <li>Assign a mentor for guidance and support</li>
                    <li>Provide constructive feedback on work submitted</li>
                    <li>Issue a completion certificate upon successful completion</li>
                </ul>
            </li>
            <li><strong>Confidentiality:</strong> The Intern agrees to maintain confidentiality of all proprietary information.</li>
            <li><strong>Intellectual Property:</strong> All work created during the internship remains the property of the Company.</li>
            <li><strong>Termination:</strong> Either party may terminate this agreement with 7 days written notice.</li>
        </ol>
    </div>

    <div class="section">
        <div class="section-title">ACKNOWLEDGMENT:</div>
        <p>Both parties acknowledge that they have read, understood, and agree to abide by the terms and conditions set forth in this Memorandum of Understanding.</p>
    </div>

    <div style="margin-top: 50px;">
        <table style="width: 100%;">
            <tr>
                <td style="width: 50%; padding: 20px;">
                    <p><strong>For {$this->companyName}</strong></p>
                    <div style="margin-top: 50px; border-top: 1px solid #333; width: 200px; padding-top: 5px;">
                        Authorized Signatory
                    </div>
                    <p style="margin-top: 5px;">Date: {$date}</p>
                </td>
                <td style="width: 50%; padding: 20px;">
                    <p><strong>Intern</strong></p>
                    <div style="margin-top: 50px; border-top: 1px solid #333; width: 200px; padding-top: 5px;">
                        {$data['studentName']}
                    </div>
                    <p style="margin-top: 5px;">Date: {$date}</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>{$this->companyName} | {$this->companyAddress}</p>
        <p>Email: {$this->companyEmail} | Website: {$this->companyWebsite}</p>
        <p style="margin-top: 10px; font-size: 9pt;">This is a computer-generated document. Reference ID: MOU-{$data['enrollmentId']}</p>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Get Offer Letter HTML template
     */
    protected function getOfferLetterTemplate(array $data): string
    {
        $date = date('F d, Y');
        $refNumber = 'OL-' . strtoupper(substr($data['enrollmentId'], -8)) . '-' . date('Y');
        
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Offer Letter</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.8;
            color: #333;
            padding: 40px 60px;
            background: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #6b21a8;
        }
        .logo {
            font-size: 32pt;
            font-weight: bold;
            background: linear-gradient(135deg, #6b21a8, #db2777);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .tagline {
            font-size: 10pt;
            color: #666;
            letter-spacing: 3px;
            margin-top: 5px;
        }
        .letter-info {
            display: flex;
            justify-content: space-between;
            margin: 30px 0;
        }
        .ref-number {
            font-size: 11pt;
            color: #6b21a8;
            font-weight: bold;
        }
        .title {
            text-align: center;
            font-size: 20pt;
            font-weight: bold;
            color: #6b21a8;
            margin: 30px 0;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .greeting {
            margin: 20px 0;
        }
        .content {
            margin: 20px 0;
            text-align: justify;
        }
        .highlight-box {
            background: linear-gradient(135deg, #f3e8ff, #fce7f3);
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            border-left: 4px solid #6b21a8;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .details-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        .details-table td:first-child {
            font-weight: bold;
            color: #6b21a8;
            width: 35%;
        }
        .benefits {
            margin: 20px 0;
        }
        .benefits li {
            margin: 10px 0;
            padding-left: 10px;
        }
        .benefits li::marker {
            color: #6b21a8;
        }
        .signature-section {
            margin-top: 50px;
        }
        .signature-line {
            margin-top: 60px;
            border-top: 2px solid #333;
            width: 250px;
            padding-top: 10px;
        }
        .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 10pt;
            color: #666;
            border-top: 2px solid #6b21a8;
            padding-top: 20px;
        }
        .congrats-banner {
            background: linear-gradient(135deg, #6b21a8, #db2777);
            color: white;
            text-align: center;
            padding: 15px;
            font-size: 14pt;
            font-weight: bold;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">{$this->companyName}</div>
        <div class="tagline">EMPOWERING FUTURE TECH LEADERS</div>
    </div>

    <table style="width: 100%; margin: 20px 0;">
        <tr>
            <td style="text-align: left;"><span class="ref-number">Ref: {$refNumber}</span></td>
            <td style="text-align: right;">Date: {$date}</td>
        </tr>
    </table>

    <div class="greeting">
        <p><strong>To,</strong></p>
        <p>{$data['studentName']}</p>
        <p>Email: {$data['studentEmail']}</p>
    </div>

    <div class="title">Internship Offer Letter</div>

    <div class="congrats-banner">
        🎉 Congratulations on Your Selection! 🎉
    </div>

    <div class="content">
        <p>Dear <strong>{$data['studentName']}</strong>,</p>
        
        <p style="margin-top: 15px;">
            We are delighted to inform you that your application for the internship program at 
            <strong>{$this->companyName}</strong> has been <strong>approved</strong>. We are impressed 
            with your profile and believe you will be a valuable addition to our internship program.
        </p>
    </div>

    <div class="highlight-box">
        <h3 style="color: #6b21a8; margin-bottom: 15px;">📋 Internship Details</h3>
        <table class="details-table">
            <tr>
                <td>Program Title:</td>
                <td>{$data['internshipTitle']}</td>
            </tr>
            <tr>
                <td>Domain:</td>
                <td>{$data['internshipDomain']}</td>
            </tr>
            <tr>
                <td>Duration:</td>
                <td>{$data['internshipDuration']}</td>
            </tr>
            <tr>
                <td>Start Date:</td>
                <td>{$data['startDate']}</td>
            </tr>
            <tr>
                <td>End Date:</td>
                <td>{$data['endDate']}</td>
            </tr>
            <tr>
                <td>Mode:</td>
                <td>Virtual / Work From Home</td>
            </tr>
        </table>
    </div>

    <div class="content">
        <h3 style="color: #6b21a8;">What You'll Receive:</h3>
        <ul class="benefits">
            <li><strong>Industry-Standard Training:</strong> Access to curated learning materials and real-world projects</li>
            <li><strong>Mentorship:</strong> Guidance from experienced professionals in the field</li>
            <li><strong>Hands-on Experience:</strong> Work on practical tasks that build your portfolio</li>
            <li><strong>Completion Certificate:</strong> Official certificate upon successful completion</li>
            <li><strong>Letter of Recommendation:</strong> Based on your performance during the internship</li>
        </ul>
    </div>

    <div class="content">
        <h3 style="color: #6b21a8;">Next Steps:</h3>
        <ol style="margin: 15px 0; padding-left: 20px;">
            <li>Login to your student dashboard at {$this->companyWebsite}</li>
            <li>Review and complete your profile information</li>
            <li>Access your assigned tasks from the Tasks section</li>
            <li>Begin your internship journey!</li>
        </ol>
    </div>

    <div class="content" style="margin-top: 30px;">
        <p>
            We look forward to a productive and enriching internship experience. Should you have 
            any questions, please don't hesitate to reach out to us at <strong>{$this->companyEmail}</strong>.
        </p>
        
        <p style="margin-top: 20px;">
            Welcome aboard!
        </p>
    </div>

    <div class="signature-section">
        <p>Warm Regards,</p>
        <div class="signature-line">
            <strong>HR Department</strong><br>
            {$this->companyName}
        </div>
    </div>

    <div class="footer">
        <p><strong>{$this->companyName}</strong></p>
        <p>{$this->companyAddress}</p>
        <p>📧 {$this->companyEmail} | 🌐 {$this->companyWebsite}</p>
        <p style="margin-top: 15px; font-size: 9pt; color: #999;">
            This is an official document generated by {$this->companyName}. 
            Document ID: {$refNumber}
        </p>
    </div>
</body>
</html>
HTML;
    }
}
