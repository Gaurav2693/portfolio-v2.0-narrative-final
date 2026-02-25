import { jsPDF } from 'jspdf';
import resumePng from 'figma:asset/31dcbe0f08a923fe1733275f991d1ff5df562d54.png';

/* ═══════════════════════════════════════════════════════════════════════
   RESUME DOWNLOAD — PNG → PDF converter
   ──────────────────────────────────────
   Loads the resume PNG, draws it onto a canvas to get base64 data,
   then uses jsPDF to produce a single-page A4 PDF and triggers download.
   ═══════════════════════════════════════════════════════════════════════ */

let cachedDataUrl: string | null = null;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function getImageDataUrl(): Promise<string> {
  if (cachedDataUrl) return cachedDataUrl;

  const img = await loadImage(resumePng);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  cachedDataUrl = canvas.toDataURL('image/png');
  return cachedDataUrl;
}

export async function downloadResumePdf() {
  try {
    const dataUrl = await getImageDataUrl();
    const img = await loadImage(resumePng);

    // A4 dimensions in mm
    const pageWidth = 210;
    const pageHeight = 297;

    // Calculate image aspect ratio and fit to A4
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const pageAspect = pageWidth / pageHeight;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX = 0;
    let offsetY = 0;

    if (imgAspect > pageAspect) {
      // Image is wider than A4 — fit to width
      drawWidth = pageWidth;
      drawHeight = pageWidth / imgAspect;
      offsetY = (pageHeight - drawHeight) / 2;
    } else {
      // Image is taller or same — fit to height
      drawHeight = pageHeight;
      drawWidth = pageHeight * imgAspect;
      offsetX = (pageWidth - drawWidth) / 2;
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, drawWidth, drawHeight);
    pdf.save('Gaurav_Mishra_Resume.pdf');
  } catch (err) {
    console.error('[ResumeDownload] Failed to generate PDF:', err);
    // Fallback: open the PNG in a new tab
    window.open(resumePng, '_blank');
  }
}
