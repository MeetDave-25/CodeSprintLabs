/**
 * Minimal PDF generator — no external dependencies.
 * Produces PDF 1.4 documents with Helvetica (built-in font) and basic layout.
 */

type Line = { text: string; x: number; y: number; size?: number; bold?: boolean };

function escPdf(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/[^\x20-\x7E]/g, (c) => {
            const code = c.charCodeAt(0);
            return `\\${code.toString(8).padStart(3, '0')}`;
        });
}

export interface PdfSection {
    type: 'title' | 'heading' | 'subheading' | 'body' | 'spacer' | 'divider' | 'kv';
    text?: string;
    key?: string;
    value?: string;
}

export function buildPdf(sections: PdfSection[], title: string): Buffer<ArrayBuffer> {
    const W = 595, H = 842; // A4 points
    const margin = 60;
    const lineHeight = 18;
    let y = H - margin;

    const lines: Line[] = [];

    function addLine(text: string, x: number, size: number, bold: boolean) {
        lines.push({ text, x, y, size, bold });
        y -= lineHeight * (size / 11);
    }

    // Header bar (blue rect drawn via PDF graphics)
    const headerRects: string[] = [];
    headerRects.push(`${margin} ${H - margin - 60} ${W - 2 * margin} 60 re f`);

    // Company name in header
    lines.push({ text: 'CodeSprint Labs', x: margin + 10, y: H - margin - 15, size: 20, bold: true });
    lines.push({ text: 'codesprintlabs@gmail.com | Ahmedabad, Gujarat, India', x: margin + 10, y: H - margin - 35, size: 9, bold: false });
    lines.push({ text: title, x: W - margin - 10, y: H - margin - 25, size: 14, bold: true });

    y = H - margin - 80;

    for (const sec of sections) {
        if (y < margin + 40) {
            y = H - margin - 20;
        }
        switch (sec.type) {
            case 'title':
                addLine(sec.text!, margin, 18, true);
                y -= 6;
                break;
            case 'heading':
                y -= 4;
                addLine(sec.text!, margin, 13, true);
                y -= 4;
                break;
            case 'subheading':
                addLine(sec.text!, margin, 11, true);
                break;
            case 'body':
                // Word-wrap at ~95 chars wide
                const words = (sec.text || '').split(' ');
                let line = '';
                for (const w of words) {
                    if ((line + ' ' + w).trim().length > 90) {
                        addLine(line.trim(), margin, 10, false);
                        line = w;
                    } else {
                        line = line ? line + ' ' + w : w;
                    }
                }
                if (line) addLine(line.trim(), margin, 10, false);
                y -= 4;
                break;
            case 'kv':
                lines.push({ text: `${sec.key}:`, x: margin, y, size: 10, bold: true });
                lines.push({ text: sec.value || '', x: margin + 180, y, size: 10, bold: false });
                y -= lineHeight;
                break;
            case 'spacer':
                y -= 14;
                break;
            case 'divider':
                // drawn as a horizontal line in graphics
                headerRects.push(`${margin} ${y + 4} ${W - 2 * margin} 0.5 re f`);
                y -= 10;
                break;
        }
    }

    // Build PDF objects
    const objs: string[] = [];

    // Object 1: Catalog
    objs.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

    // Object 2: Pages
    objs.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');

    // Build stream: graphics + text
    const streamParts: string[] = [];

    // Header background (blue)
    streamParts.push('q');
    streamParts.push('0.098 0.302 0.761 rg'); // brand blue
    streamParts.push(`${margin} ${H - margin - 65} ${W - 2 * margin} 65 re f`);
    streamParts.push('Q');

    // Dividers (grey lines)
    for (const r of headerRects.slice(1)) {
        streamParts.push('q 0.7 0.7 0.7 rg');
        streamParts.push(r);
        streamParts.push('Q');
    }

    // Text
    streamParts.push('BT');
    for (const l of lines) {
        const font = l.bold ? '/F2' : '/F1';
        const size = l.size ?? 10;
        // Header text in white, rest in dark
        const isHeader = l.y > H - margin - 70;
        if (isHeader) {
            streamParts.push('1 1 1 rg');
        } else {
            streamParts.push('0.1 0.1 0.1 rg');
        }
        streamParts.push(`${font} ${size} Tf`);
        streamParts.push(`${l.x} ${l.y} Td`);
        streamParts.push(`(${escPdf(l.text)}) Tj`);
        streamParts.push(`${-l.x} ${-l.y} Td`);
    }
    streamParts.push('ET');

    const stream = streamParts.join('\n');

    // Object 3: Page
    objs.push(
        `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents 4 0 R\n   /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj`
    );

    // Object 4: Content stream
    const streamBytes = Buffer.from(stream, 'latin1');
    objs.push(`4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream\nendobj`);

    // Object 5: Regular font
    objs.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj');

    // Object 6: Bold font
    objs.push('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj');

    // Build the PDF byte array
    const header = '%PDF-1.4\n';
    const offsets: number[] = [];
    let body = header;

    for (let i = 0; i < objs.length; i++) {
        offsets.push(body.length);
        body += objs[i] + '\n';
    }

    const xrefOffset = body.length;
    body += 'xref\n';
    body += `0 ${objs.length + 1}\n`;
    body += '0000000000 65535 f \n';
    for (const off of offsets) {
        body += String(off).padStart(10, '0') + ' 00000 n \n';
    }
    body += 'trailer\n';
    body += `<< /Size ${objs.length + 1} /Root 1 0 R >>\n`;
    body += 'startxref\n';
    body += `${xrefOffset}\n`;
    body += '%%EOF\n';

    return Buffer.from(body, 'latin1');
}
