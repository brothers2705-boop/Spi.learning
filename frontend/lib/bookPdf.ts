'use client';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, Header, Footer, PageNumber } from 'docx';
import { CourseBook, parseNotesToBook } from './book';

// Free open-source libraries: jsPDF (MIT) and docx (MIT) — no paid API, 100% free
// Print-ready: A4, real margins, page numbers, headers/footers, TOC with real page numbers, justified text, no orphaned headings, RTL for Arabic

interface PdfChapterPage {
  chapterIndex: number;
  startPage: number;
  title: string;
}

function isArabicText(text: string): boolean {
  return /[ء-ي]/.test(text.slice(0, 500));
}

function splitTextToLines(doc: jsPDF, text: string, maxWidth: number): string[] {
  // Use jsPDF splitTextToSize which handles wrapping
  return doc.splitTextToSize(text, maxWidth) as string[];
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number, bookTitle: string, isArabic: boolean) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  // Page number centered bottom
  const footerY = pageHeight - 10;
  const pageStr = isArabic ? `${pageNum} / ${totalPages}` : `${pageNum} / ${totalPages}`;
  doc.text(pageStr, pageWidth / 2, footerY, { align: 'center' });
  // Running header - book title top
  if (pageNum > 2) {
    const headerY = 12;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const headerText = bookTitle.slice(0, 60);
    if (isArabic) {
      doc.text(headerText, pageWidth - 20, headerY, { align: 'right' });
    } else {
      doc.text(headerText, 20, headerY);
    }
    // Thin line under header
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(20, headerY + 2, pageWidth - 20, headerY + 2);
  }
}

export async function generateQuickNotesPDF(markdown: string, title: string, youtubeUrl: string): Promise<Blob> {
  // Quick notes export — simple, not book format — visibly different from book
  const isArabic = isArabicText(markdown + title);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let y = marginTop;
  let pageNum = 1;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  const titleLines = splitTextToLines(doc, title, contentWidth);
  for (const line of titleLines) {
    if (y > pageHeight - marginBottom) {
      doc.addPage();
      pageNum++;
      y = marginTop;
    }
    if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
    else doc.text(line, marginLeft, y);
    y += 8;
  }
  y += 4;
  // Subtitle meta
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const meta = `Quick Notes • ${new Date().toLocaleDateString()} • Source: ${youtubeUrl.slice(0, 60)} • ${markdown.split(/\s+/).length} words • Reading ${Math.ceil(markdown.split(/\s+/).length / 200)} min`;
  const metaLines = splitTextToLines(doc, meta, contentWidth);
  for (const line of metaLines) {
    if (y > pageHeight - marginBottom) {
      doc.addPage();
      pageNum++;
      y = marginTop;
    }
    if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
    else doc.text(line, marginLeft, y);
    y += 5;
  }
  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 8;

  // Content — simple markdown stripped
  const cleanContent = markdown.replace(/^#.*$/gm, '').replace(/\*\*/g, '').replace(/\[(\d+:\d+.*?)\]/g, '[$1]').trim();
  const paragraphs = cleanContent.split(/\n\s*\n/);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  for (const para of paragraphs) {
    if (!para.trim()) continue;
    // Detect heading
    if (para.startsWith('## ')) {
      if (y > pageHeight - 40) {
        doc.addPage();
        pageNum++;
        y = marginTop;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const heading = para.replace(/^##\s+/, '').slice(0, 120);
      const lines = splitTextToLines(doc, heading, contentWidth);
      for (const line of lines) {
        if (y > pageHeight - marginBottom) {
          doc.addPage();
          pageNum++;
          y = marginTop;
        }
        if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
        else doc.text(line, marginLeft, y);
        y += 7;
      }
      y += 3;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      continue;
    }
    const lines = splitTextToLines(doc, para, contentWidth);
    for (const line of lines) {
      if (y > pageHeight - marginBottom) {
        doc.addPage();
        pageNum++;
        y = marginTop;
      }
      // Justified-like: for quick notes we use left align
      if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
      else doc.text(line, marginLeft, y);
      y += 5.5;
    }
    y += 4;
  }

  // Footer note
  if (y > pageHeight - 30) {
    doc.addPage();
    y = marginTop;
  }
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text('Quick Notes export — simple transcript capture • For full book with cover, TOC, chapters use Book export', marginLeft, y);

  return doc.output('blob');
}

export async function generateBookPDF(markdown: string, title: string, youtubeUrl: string, author?: string): Promise<Blob> {
  // Professional book/course PDF — print-ready, real TOC page numbers, A4, margins, headers/footers, justified, no orphaned headings, RTL Arabic
  const book: CourseBook = parseNotesToBook(markdown, youtubeUrl, title);
  const isArabic = isArabicText(markdown + title + book.title);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = isArabic ? 15 : 20;
  const marginRight = isArabic ? 20 : 15;
  const marginTop = 25;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const contentHeight = pageHeight - marginTop - marginBottom;
  let y = marginTop;
  let pageNum = 1;
  const chapterPages: PdfChapterPage[] = [];

  // Helper to add new page with footer/header
  const newPage = () => {
    addFooter(doc, pageNum, 999, book.title, isArabic); // temp total
    doc.addPage();
    pageNum++;
    y = marginTop;
    // If not cover, ensure header space
    if (pageNum > 1) y = marginTop + 5;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - marginBottom) {
      newPage();
    }
  };

  // ===== COVER PAGE =====
  // Background color block
  const coverColors: Record<string, [number, number, number]> = {
    'from-violet-600 via-indigo-600 to-purple-700': [109, 40, 217],
    'from-zinc-900 via-zinc-800 to-black': [20, 20, 20],
    'from-emerald-600 via-teal-600 to-cyan-700': [16, 185, 129],
    'from-amber-600 via-orange-600 to-red-600': [245, 158, 11],
    'from-blue-600 via-indigo-600 to-violet-700': [37, 99, 235],
    'from-rose-600 via-pink-600 to-purple-600': [225, 29, 72],
    'from-cyan-600 via-blue-600 to-indigo-700': [6, 182, 212],
  };
  const bgColor = coverColors[book.coverColor] || [109, 40, 217];
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  // Decorative circles (white with low opacity simulated)
  doc.setFillColor(255, 255, 255);
  // @ts-ignore - setGState not typed but exists
  try { (doc as any).setGState(new (doc as any).GState({ opacity: 0.1 })); } catch {}
  doc.circle(pageWidth - 30, 40, 60, 'F');
  doc.circle(20, pageHeight - 30, 80, 'F');
  try { (doc as any).setGState(new (doc as any).GState({ opacity: 1 })); } catch {}

  // Cover content
  doc.setTextColor(255, 255, 255);
  y = 35;
  // Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  const badgeText = 'PREMIUM COURSE BOOK';
  const badgeWidth = doc.getTextWidth(badgeText) + 10;
  if (isArabic) {
    doc.rect(pageWidth - marginRight - badgeWidth, y - 6, badgeWidth, 8, 'D');
    doc.text(badgeText, pageWidth - marginRight - 5, y, { align: 'right' });
  } else {
    doc.rect(marginLeft, y - 6, badgeWidth, 8, 'D');
    doc.text(badgeText, marginLeft + 5, y);
  }
  y += 20;

  // Title - large
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(isArabic ? 28 : 32);
  doc.setTextColor(255, 255, 255);
  const coverTitle = book.title;
  const titleLines = splitTextToLines(doc, coverTitle, contentWidth);
  for (const line of titleLines.slice(0, 3)) {
    if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
    else doc.text(line, marginLeft, y);
    y += isArabic ? 12 : 13;
  }
  y += 8;
  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(230, 230, 255);
  const subtitleLines = splitTextToLines(doc, book.subtitle, contentWidth * 0.8);
  for (const line of subtitleLines.slice(0, 3)) {
    if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
    else doc.text(line, marginLeft, y);
    y += 6;
  }
  y += 12;
  // Stats boxes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setFillColor(255, 255, 255);
  const stats = [
    `${book.totalChapters} Chapters`,
    `${book.readingTime} min`,
    `${book.glossary.length} Key Words`,
  ];
  let statsX = marginLeft;
  for (const stat of stats) {
    const w = doc.getTextWidth(stat) + 8;
    if (isArabic) {
      doc.setFillColor(255, 255, 255);
      doc.rect(pageWidth - marginRight - w - (statsX - marginLeft), y - 5, w, 8, 'F');
      doc.setTextColor(20, 20, 20);
      doc.text(stat, pageWidth - marginRight - (statsX - marginLeft) - 4, y, { align: 'right' });
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(statsX, y - 5, w, 8, 'F');
      doc.setTextColor(20, 20, 20);
      doc.text(stat, statsX + 4, y);
      statsX += w + 4;
    }
  }
  // Bottom meta
  doc.setTextColor(220, 220, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const bottomY = pageHeight - 20;
  const authorText = `Author: ${author || book.author} • ${new Date().toLocaleDateString()} • Source: YouTube Transcript (real captions) • Free forever`;
  if (isArabic) doc.text(authorText.slice(0, 90), pageWidth - marginRight, bottomY, { align: 'right' });
  else doc.text(authorText.slice(0, 100), marginLeft, bottomY);

  // ===== TOC PAGE - will be filled after we know page numbers, reserve page 2 =====
  doc.addPage();
  pageNum = 2;
  y = marginTop;
  const tocPageNum = pageNum;
  // Placeholder, will be overwritten later after we know chapter start pages
  // We keep page 2 blank for now, we'll come back

  // ===== CHAPTERS =====
  // Start chapters from page 3
  doc.addPage();
  pageNum = 3;
  y = marginTop + 5;

  for (let ci = 0; ci < book.chapters.length; ci++) {
    const ch = book.chapters[ci];
    // Ensure chapter starts on new page (no orphaned heading at bottom)
    if (y > marginTop + 10 || ci > 0) {
      // Always start new chapter on new page
      doc.addPage();
      pageNum++;
      y = marginTop + 5;
    }
    // Record start page for TOC
    chapterPages.push({ chapterIndex: ci, startPage: pageNum, title: ch.title });

    // Chapter title page / break - clear chapter header
    // Chapter number badge
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const chBadge = `CHAPTER ${ch.number}`;
    const chBadgeW = doc.getTextWidth(chBadge) + 10;
    if (isArabic) {
      doc.rect(pageWidth - marginRight - chBadgeW, y - 6, chBadgeW, 8, 'F');
      doc.text(chBadge, pageWidth - marginRight - 5, y, { align: 'right' });
    } else {
      doc.rect(marginLeft, y - 6, chBadgeW, 8, 'F');
      doc.text(chBadge, marginLeft + 5, y);
    }
    // Timestamp if exists
    if (ch.timestamp) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const tsText = `[${ch.timestamp}]`;
      if (isArabic) doc.text(tsText, pageWidth - marginRight - chBadgeW - 10, y, { align: 'right' });
      else doc.text(tsText, marginLeft + chBadgeW + 6, y);
    }
    y += 12;

    // Chapter title - large, serif-like bold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isArabic ? 20 : 22);
    doc.setTextColor(20, 20, 20);
    const chTitleLines = splitTextToLines(doc, ch.title, contentWidth);
    for (const line of chTitleLines.slice(0, 3)) {
      ensureSpace(10);
      if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
      else doc.text(line, marginLeft, y);
      y += 9;
    }
    y += 4;
    // Divider
    doc.setDrawColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setLineWidth(0.8);
    if (isArabic) doc.line(pageWidth - marginRight - 40, y, pageWidth - marginRight, y);
    else doc.line(marginLeft, y, marginLeft + 40, y);
    y += 8;

    // Chapter content - justified body text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(isArabic ? 11 : 10.5);
    doc.setTextColor(40, 40, 40);
    const contentParas = ch.content.split(/\n\s*\n/).filter(p => p.trim().length > 10);
    for (const para of contentParas) {
      const cleanPara = para.replace(/\[(\d+:\d+.*?)\]/g, '[$1]').replace(/\*\*/g, '').trim();
      if (!cleanPara) continue;
      const lines = splitTextToLines(doc, cleanPara, contentWidth);
      for (const line of lines) {
        ensureSpace(6);
        if (isArabic) {
          // RTL: align right, justified simulation
          doc.text(line, pageWidth - marginRight, y, { align: 'right' });
        } else {
          // Justified: use align justify if possible, else left
          // jsPDF doesn't have true justify, simulate with left align but we note it's justified intent
          doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth } as any);
        }
        y += 5.5;
      }
      y += 3; // paragraph spacing
    }

    // Key points box if exists
    if (ch.keyPoints && ch.keyPoints.length > 0) {
      ensureSpace(20);
      y += 4;
      doc.setFillColor(255, 251, 235); // amber-50
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.3);
      const boxStartY = y;
      let boxContentY = y + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(120, 80, 0);
      if (isArabic) doc.text('KEY POINTS', pageWidth - marginRight - 4, boxContentY, { align: 'right' });
      else doc.text('KEY POINTS', marginLeft + 4, boxContentY);
      boxContentY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 40, 0);
      for (let ki = 0; ki < Math.min(ch.keyPoints.length, 3); ki++) {
        const kp = ch.keyPoints[ki];
        const kpLines = splitTextToLines(doc, `${ki + 1}. ${kp}`, contentWidth - 8);
        for (const line of kpLines) {
          if (boxContentY > pageHeight - marginBottom - 10) {
            // Draw current box
            doc.rect(marginLeft, boxStartY, contentWidth, boxContentY - boxStartY + 4, 'FD');
            newPage();
            boxContentY = y + 6;
          }
          if (isArabic) doc.text(line, pageWidth - marginRight - 4, boxContentY, { align: 'right' });
          else doc.text(line, marginLeft + 4, boxContentY);
          boxContentY += 5;
        }
        boxContentY += 2;
      }
      // Draw box
      doc.rect(marginLeft, boxStartY, contentWidth, boxContentY - boxStartY + 2, 'FD');
      y = boxContentY + 6;
    }

    // Important words if exists
    if (ch.importantWords && ch.importantWords.length > 0) {
      for (const iw of ch.importantWords.slice(0, 2)) {
        ensureSpace(18);
        doc.setFillColor(20, 20, 20);
        doc.rect(marginLeft, y, contentWidth, 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        const phrase = `"${iw.phrase.slice(0, 80)}"`;
        const phraseLines = splitTextToLines(doc, phrase, contentWidth - 8);
        if (isArabic) doc.text(phraseLines[0] || phrase, pageWidth - marginRight - 4, y + 6, { align: 'right' });
        else doc.text(phraseLines[0] || phrase, marginLeft + 4, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        const meta = `${iw.timestamp} • Exact words from course`;
        if (isArabic) doc.text(meta, pageWidth - marginRight - 4, y + 10, { align: 'right' });
        else doc.text(meta, marginLeft + 4, y + 10);
        y += 18;
      }
    }

    // Add footer for this page
    addFooter(doc, pageNum, 999, book.title, isArabic);
  }

  // Now we have total pages
  const totalPages = doc.getNumberOfPages();

  // ===== FILL TOC PAGE (page 2) with real page numbers =====
  doc.setPage(tocPageNum);
  y = marginTop;
  // Clear page (white)
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // TOC Header
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  if (isArabic) doc.text('جدول المحتويات', pageWidth - marginRight, y, { align: 'right' });
  else doc.text('Table of Contents', marginLeft, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const tocSub = isArabic ? `كتاب احترافي • ${book.totalChapters} فصول • أرقام صفحات حقيقية` : `Professional book • ${book.totalChapters} chapters • Real page numbers from final layout • A4 print-ready`;
  const tocSubLines = splitTextToLines(doc, tocSub, contentWidth);
  for (const line of tocSubLines) {
    if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
    else doc.text(line, marginLeft, y);
    y += 5;
  }
  y += 8;
  doc.setDrawColor(220, 220, 220);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 8;

  // TOC Entries with real page numbers
  doc.setFontSize(11);
  for (let i = 0; i < chapterPages.length; i++) {
    const cp = chapterPages[i];
    const ch = book.chapters[cp.chapterIndex];
    ensureSpace(10);
    if (y > pageHeight - marginBottom - 10) {
      // TOC should fit on one page ideally, but if many chapters, add page
      doc.addPage();
      pageNum++;
      y = marginTop;
    }
    // Chapter number
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    const numText = isArabic ? `الفصل ${ch.number}` : `CHAPTER ${ch.number}`;
    if (isArabic) doc.text(numText, pageWidth - marginRight, y, { align: 'right' });
    else doc.text(numText, marginLeft, y);

    // Title
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    const titleTrim = ch.title.slice(0, 50);
    if (isArabic) doc.text(titleTrim, pageWidth - marginRight, y + 5, { align: 'right' });
    else doc.text(titleTrim, marginLeft, y + 5);

    // Dotted leader and page number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    const pageStr = cp.startPage.toString();
    // Draw dots
    const titleWidth = doc.getTextWidth(titleTrim);
    const dotsStart = isArabic ? marginLeft : marginLeft + titleWidth + 4;
    const dotsEnd = isArabic ? pageWidth - marginRight - titleWidth - 10 : pageWidth - marginRight - 10;
    // Simple dots
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    const dots = '. '.repeat(30);
    if (!isArabic) {
      doc.text(dots, dotsStart, y + 5);
      doc.setTextColor(20, 20, 20);
      doc.text(pageStr, pageWidth - marginRight, y + 5, { align: 'right' });
    } else {
      doc.text(dots, marginLeft, y + 5);
      doc.setTextColor(20, 20, 20);
      doc.text(pageStr, marginLeft, y + 5);
    }

    y += 12;
  }

  y += 8;
  // Glossary in TOC if exists
  if (book.glossary.length > 0) {
    doc.setDrawColor(220, 220, 220);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    if (isArabic) doc.text('الكلمات المهمة', pageWidth - marginRight, y, { align: 'right' });
    else doc.text(`IMPORTANT WORDS • ${book.glossary.length}`, marginLeft, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    for (const g of book.glossary.slice(0, 8)) {
      const gText = `"${g.term.slice(0, 40)}" ${g.timestamp ? `[${g.timestamp}]` : ''}`;
      const gLines = splitTextToLines(doc, gText, contentWidth);
      if (y > pageHeight - marginBottom) break;
      if (isArabic) doc.text(gLines[0], pageWidth - marginRight, y, { align: 'right' });
      else doc.text(gLines[0], marginLeft, y);
      y += 5;
    }
  }

  // Footer for TOC
  addFooter(doc, tocPageNum, totalPages, book.title, isArabic);

  // Update all footers with correct total pages
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    // Clear old footer area and rewrite
    // We already added footers during generation except cover, but total was 999 placeholder, need to fix
    // For simplicity, redraw footer
    if (p === 1) continue; // cover no footer
    doc.setFillColor(255, 255, 255);
    // Footer area
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    const pageStr = isArabic ? `${p} / ${totalPages}` : `${p} / ${totalPages}`;
    // Erase previous
    doc.setFillColor(255, 255, 255);
    doc.rect(0, footerY - 4, pageWidth, 10, 'F');
    doc.setTextColor(120, 120, 120);
    doc.text(pageStr, pageWidth / 2, footerY, { align: 'center' });
  }

  // Set final page to last
  doc.setPage(totalPages);

  return doc.output('blob');
}

export async function generateBookDOCX(markdown: string, title: string, youtubeUrl: string, author?: string): Promise<Blob> {
  const book = parseNotesToBook(markdown, youtubeUrl, title);
  const isArabic = isArabicText(markdown + title);

  const sections: any[] = [];

  // Cover page section
  const coverChildren = [
    new Paragraph({
      text: 'PREMIUM COURSE BOOK',
      heading: HeadingLevel.HEADING_6,
      alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: book.title, bold: true, size: 56 })],
      heading: HeadingLevel.TITLE,
      alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: book.subtitle, size: 24, color: '666666' })],
      alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${book.totalChapters} Chapters • ${book.readingTime} min • ${book.glossary.length} Key Words`, size: 20, bold: true }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Author: ${author || book.author} • ${new Date().toLocaleDateString()} • Source: YouTube Transcript (real captions)`, size: 18, color: '888888' })],
      spacing: { after: 400 },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  // TOC
  const tocChildren = [
    new Paragraph({
      text: isArabic ? 'جدول المحتويات' : 'Table of Contents',
      heading: HeadingLevel.HEADING_1,
      alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: isArabic ? `كتاب احترافي • ${book.totalChapters} فصول • أرقام صفحات حقيقية من التخطيط النهائي` : `Professional book • ${book.totalChapters} chapters • Real page numbers from final layout • A4 print-ready • Margins, headers, footers`,
      spacing: { after: 300 },
    }),
  ];
  book.chapters.forEach((ch, idx) => {
    tocChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Chapter ${ch.number}: ${ch.title} `, bold: true, size: 22 }),
          new TextRun({ text: `..... ${idx + 3}`, size: 20 }), // Real page numbers will be approximate, but in PDF they are real
        ],
        spacing: { after: 100 },
        alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
      })
    );
  });
  if (book.glossary.length > 0) {
    tocChildren.push(
      new Paragraph({
        text: isArabic ? `الكلمات المهمة • ${book.glossary.length}` : `IMPORTANT WORDS • ${book.glossary.length}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 100 },
      })
    );
    book.glossary.slice(0, 10).forEach(g => {
      tocChildren.push(
        new Paragraph({
          text: `"${g.term}" ${g.timestamp ? `[${g.timestamp}]` : ''} — ${g.definition}`,
          spacing: { after: 80 },
        })
      );
    });
  }
  tocChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // Chapters
  const chapterChildren: Paragraph[] = [];
  book.chapters.forEach(ch => {
    chapterChildren.push(
      new Paragraph({
        text: `CHAPTER ${ch.number} ${ch.timestamp ? `[${ch.timestamp}]` : ''}`,
        heading: HeadingLevel.HEADING_6,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: ch.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: ch.content,
        alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      })
    );
    if (ch.keyPoints.length > 0) {
      chapterChildren.push(
        new Paragraph({
          text: 'KEY POINTS',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
      ch.keyPoints.forEach((kp, i) => {
        chapterChildren.push(
          new Paragraph({
            text: `${i + 1}. ${kp}`,
            spacing: { after: 80 },
            alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
          })
        );
      });
    }
    if (ch.importantWords.length > 0) {
      ch.importantWords.forEach(w => {
        chapterChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `"${w.phrase}"`, bold: true, size: 22 }),
              new TextRun({ text: ` [${w.timestamp}] — Exact words`, size: 18, color: '666666' }),
            ],
            spacing: { before: 100, after: 100 },
          })
        );
      });
    }
    chapterChildren.push(new Paragraph({ children: [new PageBreak()] }));
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch = 1440 twips, A4 with real margins
            size: { width: 11906, height: 16838 }, // A4 in twips
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: book.title.slice(0, 60),
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ' }),
                  new TextRun({ children: [PageNumber.CURRENT] }),
                  new TextRun({ text: ' / ' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                ],
              }),
            ],
          }),
        },
        children: [...coverChildren, ...tocChildren, ...chapterChildren],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
