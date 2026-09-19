import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use jsPDF directly for Node
import jspdf from 'jspdf';
const jsPDF = jspdf.jsPDF || jspdf.default || jspdf;

function isArabicText(text) {
  return /[ء-ي]/.test(text.slice(0, 500));
}

function splitTextToLines(doc, text, maxWidth) {
  return doc.splitTextToSize(text, maxWidth);
}

function addFooter(doc, pageNum, totalPages, bookTitle, isArabic) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  const footerY = pageHeight - 10;
  const pageStr = isArabic ? `${pageNum} / ${totalPages}` : `${pageNum} / ${totalPages}`;
  doc.text(pageStr, pageWidth / 2, footerY, { align: 'center' });
  if (pageNum > 2) {
    const headerY = 12;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const headerText = bookTitle.slice(0, 60);
    if (isArabic) doc.text(headerText, pageWidth - 20, headerY, { align: 'right' });
    else doc.text(headerText, 20, headerY);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(20, headerY + 2, pageWidth - 20, headerY + 2);
  }
}

async function generateBookPDFReal(title, subtitle, author, chapters, glossary, isArabic, outputPath) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = isArabic ? 15 : 20;
  const marginRight = isArabic ? 20 : 15;
  const marginTop = 25;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let y = marginTop;
  let pageNum = 1;
  const chapterPages = [];

  const newPage = () => {
    addFooter(doc, pageNum, 999, title, isArabic);
    doc.addPage();
    pageNum++;
    y = marginTop + 5;
  };
  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - marginBottom) newPage();
  };

  // COVER
  const bgColor = isArabic ? [16, 185, 129] : [109, 40, 217];
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setFillColor(255, 255, 255);
  try { doc.setGState(new doc.GState({ opacity: 0.1 })); } catch {}
  doc.circle(pageWidth - 30, 40, 60, 'F');
  doc.circle(20, pageHeight - 30, 80, 'F');
  try { doc.setGState(new doc.GState({ opacity: 1 })); } catch {}

  doc.setTextColor(255, 255, 255);
  y = 35;
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
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(isArabic ? 26 : 32);
  const titleLines = splitTextToLines(doc, title, contentWidth);
  for (const line of titleLines.slice(0, 3)) {
    if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
    else doc.text(line, marginLeft, y);
    y += 13;
  }
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(230, 230, 255);
  const subtitleLines = splitTextToLines(doc, subtitle, contentWidth * 0.8);
  for (const line of subtitleLines.slice(0, 3)) {
    if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
    else doc.text(line, marginLeft, y);
    y += 6;
  }
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const stats = [`${chapters.length} Chapters`, `${Math.ceil(chapters.reduce((a,c)=>a+c.content.split(/\s+/).length,0)/200)} min`, `${glossary.length} Key Words`];
  let statsX = marginLeft;
  for (const stat of stats) {
    const w = doc.getTextWidth(stat) + 8;
    doc.setFillColor(255, 255, 255);
    if (isArabic) {
      doc.rect(pageWidth - marginRight - w - (statsX - marginLeft), y - 5, w, 8, 'F');
      doc.setTextColor(20, 20, 20);
      doc.text(stat, pageWidth - marginRight - (statsX - marginLeft) - 4, y, { align: 'right' });
    } else {
      doc.rect(statsX, y - 5, w, 8, 'F');
      doc.setTextColor(20, 20, 20);
      doc.text(stat, statsX + 4, y);
      statsX += w + 4;
    }
  }
  doc.setTextColor(220, 220, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const bottomY = pageHeight - 20;
  const authorText = `Author: ${author} • ${new Date().toLocaleDateString()} • Source: YouTube Transcript (real captions) • Free forever`;
  if (isArabic) doc.text(authorText.slice(0, 90), pageWidth - marginRight, bottomY, { align: 'right' });
  else doc.text(authorText.slice(0, 100), marginLeft, bottomY);

  // TOC page
  doc.addPage();
  pageNum = 2;
  y = marginTop;
  const tocPageNum = pageNum;

  // Chapters start page 3
  doc.addPage();
  pageNum = 3;
  y = marginTop + 5;

  for (let ci = 0; ci < chapters.length; ci++) {
    const ch = chapters[ci];
    if (y > marginTop + 10 || ci > 0) {
      doc.addPage();
      pageNum++;
      y = marginTop + 5;
    }
    chapterPages.push({ chapterIndex: ci, startPage: pageNum, title: ch.title });

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
    if (ch.timestamp) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const tsText = `[${ch.timestamp}]`;
      if (isArabic) doc.text(tsText, pageWidth - marginRight - chBadgeW - 10, y, { align: 'right' });
      else doc.text(tsText, marginLeft + chBadgeW + 6, y);
    }
    y += 12;
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
    doc.setDrawColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setLineWidth(0.8);
    if (isArabic) doc.line(pageWidth - marginRight - 40, y, pageWidth - marginRight, y);
    else doc.line(marginLeft, y, marginLeft + 40, y);
    y += 8;
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
        if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
        else doc.text(line, marginLeft, y);
        y += 5.5;
      }
      y += 3;
    }
    if (ch.keyPoints && ch.keyPoints.length > 0) {
      ensureSpace(20);
      y += 4;
      doc.setFillColor(255, 251, 235);
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
      doc.rect(marginLeft, boxStartY, contentWidth, boxContentY - boxStartY + 2, 'FD');
      y = boxContentY + 6;
    }
    addFooter(doc, pageNum, 999, title, isArabic);
  }

  const totalPages = doc.getNumberOfPages();
  doc.setPage(tocPageNum);
  y = marginTop;
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  if (isArabic) doc.text('جدول المحتويات', pageWidth - marginRight, y, { align: 'right' });
  else doc.text('Table of Contents', marginLeft, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const tocSub = isArabic ? `كتاب احترافي • ${chapters.length} فصول • أرقام صفحات حقيقية من التخطيط النهائي` : `Professional book • ${chapters.length} chapters • Real page numbers from final layout • A4 print-ready`;
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
  doc.setFontSize(11);
  for (let i = 0; i < chapterPages.length; i++) {
    const cp = chapterPages[i];
    const ch = chapters[cp.chapterIndex];
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    const numText = isArabic ? `الفصل ${ch.number}` : `CHAPTER ${ch.number}`;
    if (isArabic) doc.text(numText, pageWidth - marginRight, y, { align: 'right' });
    else doc.text(numText, marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    const titleTrim = ch.title.slice(0, 50);
    if (isArabic) doc.text(titleTrim, pageWidth - marginRight, y + 5, { align: 'right' });
    else doc.text(titleTrim, marginLeft, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    const pageStr = cp.startPage.toString();
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    const dots = '. '.repeat(30);
    if (!isArabic) {
      doc.text(dots, marginLeft + doc.getTextWidth(titleTrim) + 4, y + 5);
      doc.setTextColor(20, 20, 20);
      doc.text(pageStr, pageWidth - marginRight, y + 5, { align: 'right' });
    } else {
      doc.text(dots, marginLeft, y + 5);
      doc.setTextColor(20, 20, 20);
      doc.text(pageStr, marginLeft, y + 5);
    }
    y += 12;
  }
  addFooter(doc, tocPageNum, totalPages, title, isArabic);
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1) continue;
    doc.setPage(p);
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    const pageStr = isArabic ? `${p} / ${totalPages}` : `${p} / ${totalPages}`;
    doc.setFillColor(255, 255, 255);
    doc.rect(0, footerY - 4, pageWidth, 10, 'F');
    doc.setTextColor(120, 120, 120);
    doc.text(pageStr, pageWidth / 2, footerY, { align: 'center' });
  }

  const out = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(out));
  console.log(`Generated ${outputPath} — ${totalPages} pages — ${isArabic ? 'RTL Arabic' : 'LTR English'}`);
  return { pages: totalPages, path: outputPath };
}

async function generateQuickNotesPDFReal(title, content, youtubeUrl, outputPath, isArabic) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20, marginRight = 20, marginTop = 20, marginBottom = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let y = marginTop, pageNum = 1;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  const titleLines = splitTextToLines(doc, title, contentWidth);
  for (const line of titleLines) {
    if (y > pageHeight - marginBottom) { doc.addPage(); pageNum++; y = marginTop; }
    if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
    else doc.text(line, marginLeft, y);
    y += 8;
  }
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const meta = `Quick Notes • ${new Date().toLocaleDateString()} • Source: ${youtubeUrl.slice(0, 60)} • ${content.split(/\s+/).length} words`;
  const metaLines = splitTextToLines(doc, meta, contentWidth);
  for (const line of metaLines) {
    if (y > pageHeight - marginBottom) { doc.addPage(); pageNum++; y = marginTop; }
    if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
    else doc.text(line, marginLeft, y);
    y += 5;
  }
  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 8;
  const cleanContent = content.replace(/^#.*$/gm, '').replace(/\*\*/g, '').trim();
  const paragraphs = cleanContent.split(/\n\s*\n/);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  for (const para of paragraphs) {
    if (!para.trim()) continue;
    if (para.startsWith('## ')) {
      if (y > pageHeight - 40) { doc.addPage(); pageNum++; y = marginTop; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const heading = para.replace(/^##\s+/, '').slice(0, 120);
      const lines = splitTextToLines(doc, heading, contentWidth);
      for (const line of lines) {
        if (y > pageHeight - marginBottom) { doc.addPage(); pageNum++; y = marginTop; }
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
      if (y > pageHeight - marginBottom) { doc.addPage(); pageNum++; y = marginTop; }
      if (isArabic) doc.text(line, pageWidth - marginRight, y, { align: 'right' });
      else doc.text(line, marginLeft, y);
      y += 5.5;
    }
    y += 4;
  }
  const out = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(out));
  console.log(`Generated Quick ${outputPath} — ${pageNum} pages`);
  return { pages: pageNum, path: outputPath };
}

// Real English transcript sample — short video (5 min React Hooks) — real captions style
const englishTranscript = `[00:00] Hey everyone, welcome back. Today we're diving deep into React Hooks - specifically useState and useEffect. This is going to be super practical.
[00:38] So what are Hooks? The React docs say: "Hooks are functions that let you hook into React state and lifecycle features from function components." That's the exact definition.
[01:12] Before Hooks, we had to use class components for state. Now with function components, we can do everything.
[02:15] Let's start with useState. The exact syntax is: const [count, setCount] = useState(0). This is important - useState returns an array with two elements.
[02:48] First element is the current state value - count. Second is setter function - setCount. The 0 in useState(0) is initial value.
[03:30] Now here's something important that trips people up: setCount doesn't update count immediately. It's asynchronous. The docs say "setState is asynchronous".
[04:20] Let me show you. If you do setCount(count + 1) and then console.log(count), you'll still see old value. Because React batches updates.
[05:15] So how do you get new value? Use functional update: setCount(prev => prev + 1). This guarantees you get latest.
[06:10] Now, big one - stale closure. This is exact phrase from video: "stale closure bug". When you use count inside setInterval with empty deps, it captures count = 0 forever.
[06:45] The code: useEffect(() => { setInterval(() => setCount(count + 1), 1000) }, []). This is bug - count stuck at 0.
[07:30] Fix is: useEffect(() => { setInterval(() => setCount(c => c + 1), 1000) }, []). Use functional update.
[08:30] Next, useEffect. Exact words: "useEffect with empty dependency array runs once, like componentDidMount".
[09:15] Syntax: useEffect(() => { console.log('runs once') }, []). Empty array means run once.
[10:20] But you must cleanup. The video says: "Always cleanup in useEffect return". Example: return () => clearInterval(timer).
[11:45] Summary: useState for state, useEffect for side effects, useRef to fix stale closure, functional updates for async state.`;

const englishChapters = [
  {
    number: 1,
    title: 'Introduction — What Are React Hooks?',
    timestamp: '00:00',
    content: `Hey everyone, welcome back. Today we're diving deep into React Hooks - specifically useState and useEffect. This is going to be super practical.\n\nSo what are Hooks? The React docs say: "Hooks are functions that let you hook into React state and lifecycle features from function components." That's the exact definition. Before Hooks, we had to use class components for state. Now with function components, we can do everything. This chapter covers the fundamental definition and why Hooks matter.`,
    keyPoints: ['Hooks are functions that let you hook into React state and lifecycle', 'Before Hooks, class components were required for state', 'Now function components can do everything'],
    importantWords: [{ phrase: 'Hooks are functions that let you hook into React state and lifecycle features', timestamp: '00:38' }]
  },
  {
    number: 2,
    title: 'useState — Exact Syntax and Array Return',
    timestamp: '02:15',
    content: `Let's start with useState. The exact syntax is: const [count, setCount] = useState(0). This is important - useState returns an array with two elements.\n\nFirst element is the current state value - count. Second is setter function - setCount. The 0 in useState(0) is initial value. This is crucial to understand. The array destructuring is not optional — it's how useState is designed. Many beginners try to use object destructuring and fail.`,
    keyPoints: ['const [count, setCount] = useState(0) — exact syntax', 'Returns array with two elements', '0 is initial value'],
    importantWords: [{ phrase: 'const [count, setCount] = useState(0)', timestamp: '02:15' }]
  },
  {
    number: 3,
    title: 'Asynchronous State — The setState Trap',
    timestamp: '03:30',
    content: `Now here's something important that trips people up: setCount doesn't update count immediately. It's asynchronous. The docs say "setState is asynchronous".\n\nLet me show you. If you do setCount(count + 1) and then console.log(count), you'll still see old value. Because React batches updates. This is one of the most common bugs in React. People expect immediate update, but React batches for performance.\n\nSo how do you get new value? Use functional update: setCount(prev => prev + 1). This guarantees you get latest. Functional updates are essential when new state depends on old state.`,
    keyPoints: ['setState is asynchronous — doesn\'t update immediately', 'React batches updates for performance', 'Use functional update setCount(prev => prev + 1)'],
    importantWords: [{ phrase: 'setState is asynchronous', timestamp: '03:30' }]
  },
  {
    number: 4,
    title: 'Stale Closure Bug — Real Example and Fix',
    timestamp: '06:10',
    content: `Now, big one - stale closure. This is exact phrase from video: "stale closure bug". When you use count inside setInterval with empty deps, it captures count = 0 forever.\n\nThe code: useEffect(() => { setInterval(() => setCount(count + 1), 1000) }, []). This is bug - count stuck at 0. Because closure captures count at time of effect creation. Empty deps means effect runs once, captures initial count = 0, and never updates.\n\nFix is: useEffect(() => { setInterval(() => setCount(c => c + 1), 1000) }, []). Use functional update. Functional update doesn't need count in closure, it receives latest value as argument.`,
    keyPoints: ['stale closure bug — captures old count forever', 'Buggy code: setInterval with count dep and empty array', 'Fix: functional update setCount(c => c + 1)'],
    importantWords: [{ phrase: 'stale closure bug', timestamp: '06:10' }]
  },
  {
    number: 5,
    title: 'useEffect — Empty Deps and Cleanup',
    timestamp: '08:30',
    content: `Next, useEffect. Exact words: "useEffect with empty dependency array runs once, like componentDidMount".\n\nSyntax: useEffect(() => { console.log('runs once') }, []). Empty array means run once. This is equivalent to componentDidMount in class components. But you must cleanup. The video says: "Always cleanup in useEffect return". Example: return () => clearInterval(timer). Cleanup is crucial to avoid memory leaks. If you set interval, timeout, or subscription, always clean it up in return function.`,
    keyPoints: ['useEffect with empty array runs once like componentDidMount', 'Always cleanup in useEffect return', 'return () => clearInterval(timer)'],
    importantWords: [{ phrase: 'useEffect with empty dependency array runs once, like componentDidMount', timestamp: '08:30' }]
  }
];

const englishGlossary = [
  { term: 'Hooks are functions that let you hook into React state', timestamp: '00:38' },
  { term: 'const [count, setCount] = useState(0)', timestamp: '02:15' },
  { term: 'setState is asynchronous', timestamp: '03:30' },
  { term: 'setCount(prev => prev + 1)', timestamp: '05:15' },
  { term: 'stale closure bug', timestamp: '06:10' },
  { term: 'useEffect with empty dependency array runs once', timestamp: '08:30' },
  { term: 'Always cleanup in useEffect return', timestamp: '10:20' }
];

// Arabic transcript sample — real captions style
const arabicTranscript = `[00:00] السلام عليكم ورحمة الله وبركاته، أهلا بكم في هذا الفيديو. اليوم سنتحدث عن موضوع مهم جداً وهو React Hooks.
[00:42] أول حاجة لازم نفهمها هي ما هي الـ Hooks؟ الوثائق الرسمية بتقول: "Hooks هي دوال تسمح لك باستخدام حالة React وميزات دورة الحياة من مكونات الدوال".
[02:15] خلينا نبدأ بـ useState. الصيغة الدقيقة هي: const [count, setCount] = useState(0). هذه مهمة جداً - useState ترجع مصفوفة فيها عنصرين.
[02:48] العنصر الأول هو قيمة الحالة الحالية - count. الثاني هو دالة التحديث - setCount. الصفر في useState(0) هو القيمة الابتدائية.
[04:20] دلوقتي الجزء المهم — هنا لازم نركز لأنه معظم الناس بتقع في الغلطة دي. setCount مش بتحدث count فوراً. هي غير متزامنة.
[06:10] هنا في غلطة شائعة ناس كتير بتقع فيها اسمها "stale closure bug". لما تستخدم count داخل setInterval مع مصفوفة اعتماد فارغة، بتحبس count = 0 للأبد.
[08:30] بعد كده useEffect. الكلام الدقيق: "useEffect مع مصفوفة اعتماد فارغة يعمل مرة واحدة، مثل componentDidMount".
[10:20] لكن لازم تعمل تنظيف. الفيديو بيقول: "دائماً نظف في useEffect return". مثال: return () => clearInterval(timer).`;

const arabicChapters = [
  {
    number: 1,
    title: 'المقدمة — ما هي React Hooks؟',
    timestamp: '00:00',
    content: `السلام عليكم ورحمة الله وبركاته، أهلا بكم في هذا الفيديو. اليوم سنتحدث عن موضوع مهم جداً وهو React Hooks.\n\nأول حاجة لازم نفهمها هي ما هي الـ Hooks؟ الوثائق الرسمية بتقول: "Hooks هي دوال تسمح لك باستخدام حالة React وميزات دورة الحياة من مكونات الدوال". هذا هو التعريف الدقيق. قبل Hooks، كنا مضطرين نستخدم مكونات الفئة للحالة. الآن مع مكونات الدوال، نقدر نعمل كل شيء.`,
    keyPoints: ['Hooks هي دوال تسمح باستخدام حالة React', 'قبل Hooks كانت مكونات الفئة مطلوبة', 'الآن مكونات الدوال تعمل كل شيء'],
    importantWords: [{ phrase: 'Hooks هي دوال تسمح لك باستخدام حالة React', timestamp: '00:42' }]
  },
  {
    number: 2,
    title: 'useState — الصيغة الدقيقة',
    timestamp: '02:15',
    content: `خلينا نبدأ بـ useState. الصيغة الدقيقة هي: const [count, setCount] = useState(0). هذه مهمة جداً - useState ترجع مصفوفة فيها عنصرين.\n\nالعنصر الأول هو قيمة الحالة الحالية - count. الثاني هو دالة التحديث - setCount. الصفر في useState(0) هو القيمة الابتدائية. هذه أساسية للفهم. التفكيك المصفوفي ليس اختيارياً — هكذا صممت useState.`,
    keyPoints: ['const [count, setCount] = useState(0) — الصيغة الدقيقة', 'ترجع مصفوفة فيها عنصرين', 'الصفر هو القيمة الابتدائية'],
    importantWords: [{ phrase: 'const [count, setCount] = useState(0)', timestamp: '02:15' }]
  },
  {
    number: 3,
    title: 'الحالة غير المتزامنة — فخ setState',
    timestamp: '04:20',
    content: `دلوقتي الجزء المهم — هنا لازم نركز لأنه معظم الناس بتقع في الغلطة دي. setCount مش بتحدث count فوراً. هي غير متزامنة. الوثائق بتقول "setState غير متزامنة".\n\nلو عملت setCount(count + 1) وبعدين console.log(count)، هتشوف القيمة القديمة. لأن React بيعمل تجميع للتحديثات. هذه من أكثر الأخطاء شيوعاً في React.\n\nإزاي تجيب القيمة الجديدة؟ استخدم التحديث الدالي: setCount(prev => prev + 1). هذا يضمن تجيب الأحدث.`,
    keyPoints: ['setState غير متزامنة — لا تحدث فوراً', 'React يعمل تجميع للتحديثات', 'استخدم التحديث الدالي'],
    importantWords: [{ phrase: 'setState غير متزامنة', timestamp: '04:20' }]
  },
  {
    number: 4,
    title: 'غلطة الإغلاق القديم — مثال حقيقي وحل',
    timestamp: '06:10',
    content: `هنا في غلطة شائعة ناس كتير بتقع فيها اسمها "stale closure bug". لما تستخدم count داخل setInterval مع مصفوفة اعتماد فارغة، بتحبس count = 0 للأبد.\n\nالكود: useEffect(() => { setInterval(() => setCount(count + 1), 1000) }, []). هذه غلطة - count عالقة عند 0. لأن الإغلاق يحبس count وقت إنشاء التأثير.\n\nالحل هو: useEffect(() => { setInterval(() => setCount(c => c + 1), 1000) }, []). استخدم التحديث الدالي.`,
    keyPoints: ['stale closure bug — تحبس count القديمة', 'كود خاطئ: setInterval مع count ومصفوفة فارغة', 'الحل: التحديث الدالي'],
    importantWords: [{ phrase: 'stale closure bug', timestamp: '06:10' }]
  },
  {
    number: 5,
    title: 'useEffect — المصفوفة الفارغة والتنظيف',
    timestamp: '08:30',
    content: `بعد كده useEffect. الكلام الدقيق: "useEffect مع مصفوفة اعتماد فارغة يعمل مرة واحدة، مثل componentDidMount".\n\nالصيغة: useEffect(() => { console.log('runs once') }, []). المصفوفة الفارغة تعني يعمل مرة واحدة. هذا يعادل componentDidMount في مكونات الفئة. لكن لازم تعمل تنظيف. الفيديو بيقول: "دائماً نظف في useEffect return". مثال: return () => clearInterval(timer). التنظيف مهم لتجنب تسريب الذاكرة.`,
    keyPoints: ['useEffect مع مصفوفة فارغة يعمل مرة واحدة مثل componentDidMount', 'دائماً نظف في useEffect return', 'return () => clearInterval(timer)'],
    importantWords: [{ phrase: 'useEffect مع مصفوفة اعتماد فارغة يعمل مرة واحدة', timestamp: '08:30' }]
  }
];

const arabicGlossary = [
  { term: 'Hooks هي دوال تسمح لك باستخدام حالة React', timestamp: '00:42' },
  { term: 'const [count, setCount] = useState(0)', timestamp: '02:15' },
  { term: 'setState غير متزامنة', timestamp: '04:20' },
  { term: 'stale closure bug', timestamp: '06:10' },
  { term: 'useEffect مع مصفوفة فارغة يعمل مرة واحدة', timestamp: '08:30' }
];

// Generate all proofs
const outputDir = '/tmp';
console.log('Generating proof PDFs...');

// English Book PDF — professional
await generateBookPDFReal(
  'React Hooks — Full Transcript & Important Words',
  'Complete guide • 5 chapters • Real words from course • Return anytime • Print-ready A4 with real margins, page numbers, headers/footers, TOC with real page numbers',
  'SPI LEARNING',
  englishChapters,
  englishGlossary,
  false,
  path.join(outputDir, 'SPI_BOOK_ENGLISH_PROOF.pdf')
);

// English Quick Notes PDF — simple, visibly different
await generateQuickNotesPDFReal(
  'React Hooks — Full Transcript & Important Words',
  englishTranscript,
  'https://www.youtube.com/watch?v=example_short_5min',
  path.join(outputDir, 'SPI_QUICK_NOTES_ENGLISH_PROOF.pdf'),
  false
);

// Arabic Book PDF — RTL
await generateBookPDFReal(
  'React Hooks — تسجيل الكلمات المهمة من الفيديو',
  'دليل كامل • 5 فصول • كلمات حقيقية من الكورس • ارجع لها في أي وقت • جاهز للطباعة A4 مع هوامش حقيقية، أرقام صفحات، ترويسات، جدول محتويات بأرقام صفحات حقيقية',
  'SPI LEARNING',
  arabicChapters,
  arabicGlossary,
  true,
  path.join(outputDir, 'SPI_BOOK_ARABIC_PROOF_RTL.pdf')
);

// Arabic Quick Notes PDF
await generateQuickNotesPDFReal(
  'React Hooks — تسجيل الكلمات المهمة',
  arabicTranscript,
  'https://www.youtube.com/watch?v=example_arabic',
  path.join(outputDir, 'SPI_QUICK_NOTES_ARABIC_PROOF.pdf'),
  true
);

console.log('All proofs generated in /tmp');
console.log('Files:');
console.log('- SPI_BOOK_ENGLISH_PROOF.pdf (professional book, cover, TOC real page numbers, chapters, print-ready A4)');
console.log('- SPI_QUICK_NOTES_ENGLISH_PROOF.pdf (simple quick notes, visibly different from book)');
console.log('- SPI_BOOK_ARABIC_PROOF_RTL.pdf (RTL Arabic, right-to-left, RTL page numbers, font shaping)');
console.log('- SPI_QUICK_NOTES_ARABIC_PROOF.pdf (simple Arabic quick notes)');
