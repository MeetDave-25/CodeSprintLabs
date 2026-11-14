/**
 * Zero-dependency PDF writer (PDF 1.4, built-in Helvetica) with a small flow-layout engine:
 * word-wrapping with real font metrics, justified text, bullets, numbered lists,
 * shaded boxes, rules and automatic page breaks. Supports landscape pages and
 * absolute-position helpers for certificates.
 */

const MARGIN = 56;
const BOTTOM = 60;

export type Color = [number, number, number];
export const CYAN: Color = [0.0, 0.78, 0.95];
export const INK: Color = [0.07, 0.07, 0.09];
export const MUTED: Color = [0.4, 0.43, 0.5];
export const RULE: Color = [0.85, 0.87, 0.9];

// Helvetica glyph widths (1/1000 em) for ASCII 32..126
const REG = [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const BOLD = [
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
    975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
    333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
    611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

function clean(s: string): string {
    return String(s ?? '')
        .replace(/[–—]/g, '-')
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/•/g, '-')
        .replace(/€/g, 'EUR')
        .replace(/ /g, ' ')
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/[^\x20-\x7E\xA1-\xFF]/g, '?');
}

function esc(s: string): string {
    return s
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/[\x80-\xFF]/g, (c) => `\\${c.charCodeAt(0).toString(8).padStart(3, '0')}`);
}

export function textWidth(s: string, size: number, bold: boolean): number {
    const table = bold ? BOLD : REG;
    let w = 0;
    for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        w += c >= 32 && c <= 126 ? table[c - 32] : 556;
    }
    return (w * size) / 1000;
}

function wrap(text: string, size: number, bold: boolean, maxW: number): string[] {
    const words = clean(text).split(' ').filter(Boolean);
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
        const trial = line ? `${line} ${word}` : word;
        if (textWidth(trial, size, bold) <= maxW || !line) {
            line = trial;
        } else {
            lines.push(line);
            line = word;
        }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [''];
}

const rgb = (c: Color) => `${c[0]} ${c[1]} ${c[2]}`;

export interface TextOpts {
    size?: number;
    bold?: boolean;
    color?: Color;
    align?: 'left' | 'center' | 'right' | 'justify';
    x?: number;
    width?: number;
    gap?: number;
    underline?: boolean;
}

export class PdfDoc {
    readonly pw: number;
    readonly ph: number;
    private readonly cw: number;
    private pages: string[][] = [];
    private ops: string[] = [];
    y: number;

    constructor(opts: { landscape?: boolean } = {}) {
        this.pw = opts.landscape ? 841.89 : 595.28;
        this.ph = opts.landscape ? 595.28 : 841.89;
        this.cw = this.pw - 2 * MARGIN;
        this.y = this.ph - MARGIN;
        this.newPage();
    }

    newPage() {
        if (this.ops.length) this.pages.push(this.ops);
        this.ops = [];
        this.y = this.ph - MARGIN;
    }

    ensure(h: number) {
        if (this.y - h < BOTTOM) this.newPage();
    }

    spacer(h = 10) {
        this.y -= h;
    }

    private put(
        s: string, x: number, y: number, size: number, bold: boolean, color: Color, wordSpace = 0
    ) {
        this.ops.push(
            `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${rgb(color)} rg ${wordSpace.toFixed(3)} Tw ${x.toFixed(2)} ${y.toFixed(2)} Td (${esc(s)}) Tj ET`
        );
    }

    /** Wrapped paragraph; advances y. */
    text(text: string, o: TextOpts = {}) {
        const size = o.size ?? 10.5;
        const bold = !!o.bold;
        const color = o.color ?? INK;
        const x0 = o.x ?? MARGIN;
        const width = o.width ?? this.cw - (x0 - MARGIN);
        const lead = size * 1.5;
        const lines = wrap(text, size, bold, width);
        lines.forEach((line, i) => {
            this.ensure(lead);
            this.y -= lead;
            const w = textWidth(line, size, bold);
            let x = x0;
            let ws = 0;
            if (o.align === 'center') x = x0 + (width - w) / 2;
            else if (o.align === 'right') x = x0 + width - w;
            else if (o.align === 'justify' && i < lines.length - 1) {
                const gaps = (line.match(/ /g) || []).length;
                if (gaps) ws = (width - w) / gaps;
            }
            this.put(line, x, this.y, size, bold, color, ws);
            if (o.underline) {
                this.ops.push(`${rgb(color)} RG 0.7 w ${x.toFixed(2)} ${(this.y - 2).toFixed(2)} m ${(x + w).toFixed(2)} ${(this.y - 2).toFixed(2)} l S`);
            }
        });
        this.y -= o.gap ?? 4;
    }

    rule(color: Color = RULE, weight = 0.8, gap = 8) {
        this.ensure(gap * 2);
        this.y -= gap;
        this.ops.push(`${rgb(color)} RG ${weight} w ${MARGIN} ${this.y.toFixed(2)} m ${(this.pw - MARGIN).toFixed(2)} ${this.y.toFixed(2)} l S`);
        this.y -= gap;
    }

    heading(text: string, size = 12) {
        this.ensure(size * 3);
        this.spacer(4);
        this.text(text, { size, bold: true, gap: 4 });
    }

    /** "Label:  value" pairs in a two-column layout. */
    kv(rows: [string, string][], labelW = 150) {
        for (const [k, v] of rows) {
            const lines = wrap(v || '-', 10.5, false, this.cw - labelW);
            const lead = 10.5 * 1.55;
            this.ensure(lead * lines.length);
            this.y -= lead;
            this.put(clean(k) + ':', MARGIN, this.y, 10.5, true, INK);
            lines.forEach((line, i) => {
                if (i > 0) this.y -= lead;
                this.put(line, MARGIN + labelW, this.y, 10.5, false, INK);
            });
        }
        this.y -= 4;
    }

    bullets(items: string[], size = 10.5) {
        for (const item of items) {
            const lines = wrap(item, size, false, this.cw - 22);
            const lead = size * 1.5;
            this.ensure(lead);
            lines.forEach((line, i) => {
                if (i > 0) this.ensure(lead);
                this.y -= lead;
                if (i === 0) {
                    this.ops.push(`${rgb(INK)} rg ${(MARGIN + 6).toFixed(2)} ${(this.y + size * 0.3).toFixed(2)} 3 3 re f`);
                }
                this.put(line, MARGIN + 20, this.y, size, false, INK);
            });
        }
        this.y -= 4;
    }

    numbered(items: string[], size = 10.5) {
        items.forEach((item, n) => {
            const lines = wrap(item, size, false, this.cw - 24);
            const lead = size * 1.5;
            lines.forEach((line, i) => {
                this.ensure(lead);
                this.y -= lead;
                if (i === 0) this.put(`${n + 1}.`, MARGIN + 4, this.y, size, false, INK);
                this.put(line, MARGIN + 24, this.y, size, false, INK);
            });
        });
        this.y -= 4;
    }

    /** Shaded, bordered box with a title and label/value rows. */
    box(title: string, rows: [string, string][]) {
        const pad = 14;
        const lead = 10.5 * 1.7;
        const labelW = 130;
        const laid = rows.map(([k, v]) => ({ k, lines: wrap(v || '-', 10.5, false, this.cw - 2 * pad - labelW) }));
        const height = pad * 2 + 18 + laid.reduce((a, r) => a + lead * r.lines.length, 0);
        this.ensure(height + 6);
        const top = this.y;
        const bottom = top - height;
        this.ops.push(`0.972 0.977 0.985 rg ${RULE.join(' ')} RG 0.8 w ${MARGIN} ${bottom.toFixed(2)} ${this.cw} ${height.toFixed(2)} re B`);
        let y = top - pad - 10;
        this.put(clean(title), MARGIN + pad, y, 11.5, true, INK);
        y -= 6;
        for (const r of laid) {
            r.lines.forEach((line, i) => {
                y -= lead;
                if (i === 0) this.put(clean(r.k) + ':', MARGIN + pad, y, 10.5, true, INK);
                this.put(line, MARGIN + pad + labelW, y, 10.5, false, INK);
            });
        }
        this.y = bottom - 12;
    }

    /** Large grade badge + headline marks, used in completion letters. */
    highlight(grade: string, caption: string) {
        const h = 62;
        this.ensure(h + 12);
        const top = this.y;
        const bottom = top - h;
        this.ops.push(`0.93 0.98 1 rg ${CYAN.join(' ')} RG 1 w ${MARGIN} ${bottom.toFixed(2)} ${this.cw} ${h} re B`);
        const gw = textWidth(grade, 26, true);
        this.put(clean(grade), MARGIN + 28, top - 40, 26, true, [0.0, 0.45, 0.62]);
        this.put(clean(caption), MARGIN + 28 + gw + 24, top - 37, 14, true, INK);
        this.y = bottom - 12;
    }

    /** Two labelled signature lines side by side. */
    signatures(left: string, right: string) {
        this.ensure(70);
        this.y -= 40;
        const mid = MARGIN + this.cw / 2 + 20;
        this.ops.push(`${rgb(INK)} RG 0.7 w ${MARGIN} ${this.y} m ${MARGIN + 190} ${this.y} l S`);
        this.ops.push(`${rgb(INK)} RG 0.7 w ${mid} ${this.y} m ${mid + 190} ${this.y} l S`);
        this.y -= 13;
        this.put(clean(left), MARGIN, this.y, 10, false, INK);
        this.put(clean(right), mid, this.y, 10, false, INK);
        this.y -= 8;
    }

    /** Centered brand header used at the top of the first page. */
    letterhead() {
        this.text('CodeSprint Labs', { size: 28, bold: true, color: CYAN, align: 'center', gap: 0 });
        this.text('Empowering Future Tech Leaders', { size: 11.5, color: MUTED, align: 'center', gap: 0 });
        this.text('Email: info@codesprintlabs.in  |  Phone: +91-8160901481', { size: 9.5, color: MUTED, align: 'center', gap: 2 });
        this.rule(CYAN, 1.6, 6);
        this.spacer(4);
    }

    footer(lines: string[]) {
        this.ensure(60);
        this.spacer(6);
        this.rule(RULE, 0.8, 5);
        for (const l of lines) this.text(l, { size: 9, color: MUTED, align: 'center', gap: 0 });
    }

    // ---- absolute-position helpers (certificates) ----

    frame(color: Color, inset: number, weight: number) {
        this.ops.push(
            `${rgb(color)} RG ${weight} w ${inset} ${inset} ${(this.pw - 2 * inset).toFixed(2)} ${(this.ph - 2 * inset).toFixed(2)} re S`
        );
    }

    centerText(text: string, y: number, size: number, bold = false, color: Color = INK) {
        const t = clean(text);
        const w = textWidth(t, size, bold);
        this.put(t, (this.pw - w) / 2, y, size, bold, color);
    }

    hline(x1: number, x2: number, y: number, color: Color = INK, weight = 0.8) {
        this.ops.push(`${rgb(color)} RG ${weight} w ${x1.toFixed(2)} ${y.toFixed(2)} m ${x2.toFixed(2)} ${y.toFixed(2)} l S`);
    }

    leftText(text: string, x: number, y: number, size: number, bold = false, color: Color = INK) {
        this.put(clean(text), x, y, size, bold, color);
    }

    fitSize(text: string, maxW: number, size: number, bold = false, min = 12): number {
        const t = clean(text);
        let s = size;
        while (s > min && textWidth(t, s, bold) > maxW) s -= 1;
        return s;
    }

    build(): Buffer<ArrayBuffer> {
        if (this.ops.length) this.pages.push(this.ops);
        this.ops = [];

        const n = this.pages.length;
        const objs: string[] = [];
        const fontReg = 3 + n * 2;
        const fontBold = fontReg + 1;
        const kids = this.pages.map((_, i) => `${3 + i * 2} 0 R`).join(' ');

        objs.push('<< /Type /Catalog /Pages 2 0 R >>');
        objs.push(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`);
        this.pages.forEach((ops, i) => {
            const contentId = 4 + i * 2;
            objs.push(
                `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.pw} ${this.ph}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontReg} 0 R /F2 ${fontBold} 0 R >> >> >>`
            );
            const stream = ops.join('\n');
            objs.push(`<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`);
        });
        objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

        const chunks: Buffer[] = [Buffer.from('%PDF-1.4\n', 'latin1')];
        const offsets: number[] = [];
        let pos = chunks[0].length;
        objs.forEach((o, i) => {
            offsets.push(pos);
            const b = Buffer.from(`${i + 1} 0 obj\n${o}\nendobj\n`, 'latin1');
            chunks.push(b);
            pos += b.length;
        });
        let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
        for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
        xref += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`;
        chunks.push(Buffer.from(xref, 'latin1'));
        return Buffer.concat(chunks) as Buffer<ArrayBuffer>;
    }
}
