import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generatePdf(data) {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    let { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const margin = 50;
    const lineHeight = fontSize + 5;

    let y = height - margin;

    // Helper to sanitize text for WinAnsi encoding (removes unsupported characters)
    const sanitizeText = (text) => {
        if (!text) return '';
        // Keep only characters in the WinAnsi range (roughly Latin-1)
        // This regex matches characters that are NOT in the range 0x00-0x7F (ASCII) or 0xA0-0xFF (Latin-1 Supplement)
        return text.replace(/[^\x00-\x7F\xA0-\xFF]/g, '').trim();
    };

    const checkPageBottom = () => {
        if (y < margin) {
            page = pdfDoc.addPage();
            y = height - margin;
        }
    };

    const drawTextLine = (text, size = fontSize) => {
        checkPageBottom();
        page.drawText(sanitizeText(text), {
            x: margin,
            y,
            size,
            font,
            color: rgb(0, 0, 0),
        });
        y -= size + 5;
    };

    drawTextLine(`Position: ${data.position}`, 18);
    y -= 10;
    drawTextLine(`Company: ${data.companyName}`);
    drawTextLine(`Presence: ${data.presenceMode}`);
    drawTextLine(`Type: ${data.jobType}`);
    drawTextLine(`Source: ${data.sourceUrl}`);

    y -= 20;
    checkPageBottom();
    drawTextLine('Description:', 14);
    y -= 10;

    // Improved text wrapping that respects paragraphs
    const paragraphs = data.description.split('\n');

    for (const paragraph of paragraphs) {
        const sanitizedPara = sanitizeText(paragraph);
        if (!sanitizedPara) {
            // Empty line (paragraph break)
            y -= lineHeight;
            checkPageBottom();
            continue;
        }

        const words = sanitizedPara.split(/\s+/);
        let line = '';

        for (const word of words) {
            // Calculate width of the line + word
            const textWidth = font.widthOfTextAtSize(line + word, fontSize);
            const maxWidth = width - (margin * 2);

            if (textWidth > maxWidth) {
                drawTextLine(line);
                line = word + ' ';
            } else {
                line += word + ' ';
            }
        }
        if (line) drawTextLine(line);

        // Add a small gap after each paragraph
        y -= 5;
        checkPageBottom();
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
