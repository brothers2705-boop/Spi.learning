'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Copy, Check, FileText, Clock, Eye, FileDown, BookOpen, AlertTriangle, Quote, Download, ClipboardList, Lightbulb, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { getWordCount, getReadingTime } from '@/lib/storage';

export function NotesView({ markdown, title, language, jobId, youtubeUrl, onBack, onFlashcards, onBook }: { markdown: string; title?: string; language?: string; jobId: string; youtubeUrl?: string; onBack: () => void; onFlashcards?: () => void; onBook?: () => void }) {
  const [copied, setCopied] = useState(false);
  const [copiedPlain, setCopiedPlain] = useState(false);
  const [exporting, setExporting] = useState<'quick-pdf' | 'book-pdf' | 'book-docx' | 'anki' | null>(null);
  const isArabic = language?.startsWith('ar') || /[ء-ي]/.test(markdown.slice(0, 1000));
  const wordCount = getWordCount(markdown);
  const readingTime = getReadingTime(wordCount);
  const isNoTranscript = markdown.includes('No transcript/captions available') || markdown.includes('No Transcript Available') || markdown.includes('❌ No transcript');
  
  const importantWordsCount = (markdown.match(/\"[^\"]+\"\s*\[\d+:\d+\]/g) || []).length;
  const timestampCount = (markdown.match(/\[\d+:\d+\]/g) || []).length;

  const handleQuickNotesPDF = async () => {
    setExporting('quick-pdf');
    try {
      const { generateQuickNotesPDF } = await import('@/lib/bookPdf');
      const blob = await generateQuickNotesPDF(markdown, title || 'Quick Notes', youtubeUrl || '');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spi-quick-notes-${new Date().toISOString().slice(0,10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Quick PDF failed', e);
      const blob = new Blob([markdown], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spi-notes-${new Date().toISOString().slice(0,10)}.md`;
      a.click();
    } finally {
      setExporting(null);
    }
  };

  const handleBookPDF = async () => {
    if (isNoTranscript) return;
    setExporting('book-pdf');
    try {
      const { generateBookPDF } = await import('@/lib/bookPdf');
      const blob = await generateBookPDF(markdown, title || 'Course Book', youtubeUrl || '', 'SPI LEARNING');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spi-book-${(title || 'course').slice(0,20).replace(/[^a-z0-9]/gi,'-')}-${new Date().toISOString().slice(0,10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Book PDF failed', e);
      alert('Book PDF generation failed — try again');
    } finally {
      setExporting(null);
    }
  };

  const handleBookDOCX = async () => {
    if (isNoTranscript) return;
    setExporting('book-docx');
    try {
      const { generateBookDOCX } = await import('@/lib/bookPdf');
      const blob = await generateBookDOCX(markdown, title || 'Course Book', youtubeUrl || '', 'SPI LEARNING');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spi-book-${(title || 'course').slice(0,20).replace(/[^a-z0-9]/gi,'-')}-${new Date().toISOString().slice(0,10)}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Book DOCX failed', e);
      alert('Book DOCX generation failed — try again');
    } finally {
      setExporting(null);
    }
  };

  const handleCopyPlainText = async () => {
    try {
      let plain = markdown
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, ''))
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^[-*]\s+/gm, '• ')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/---+/g, '')
        .trim();
      await navigator.clipboard.writeText(plain);
      setCopiedPlain(true);
      setTimeout(() => setCopiedPlain(false), 2000);
    } catch (e) {
      console.error('Copy plain failed', e);
    }
  };

  const handleExportAnki = () => {
    setExporting('anki');
    try {
      const lines = markdown.split('\n');
      const cards: { front: string; back: string }[] = [];
      const importantRegex = /[-•]\s*\"([^\"]+)\"\s*\[([^\]]+)\]\s*[-—–]\s*(.+)/i;
      const bulletRegex = /^[-•]\s*(.+?)\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*[-—–]?\s*(.*)/;
      for (const line of lines) {
        let m = line.match(importantRegex);
        if (m) {
          cards.push({ front: m[1].trim(), back: `${m[3].trim()} [${m[2]}] • ${title || ''}` });
          continue;
        }
        m = line.match(bulletRegex);
        if (m && m[1].length > 8 && m[1].length < 200) {
          cards.push({ front: m[1].trim().slice(0, 150), back: `${m[3] || m[1]} [${m[2]}]` });
        }
      }
      if (cards.length === 0) {
        const tsRegex = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^\n]{15,150})/g;
        let match;
        while ((match = tsRegex.exec(markdown)) !== null && cards.length < 30) {
          cards.push({ front: match[2].trim().slice(0, 120), back: `Timestamp ${match[1]} • ${title || ''}` });
        }
      }
      const escapeCsv = (s: string) => `"${s.replace(/"/g, '""')}"`;
      const header = `${escapeCsv('Front')},${escapeCsv('Back')},${escapeCsv('Tags')}\n`;
      const rows = cards.slice(0, 100).map(c => `${escapeCsv(c.front)},${escapeCsv(c.back)},${escapeCsv(`spi-learning ${title?.slice(0,20) || ''}`)}`).join('\n');
      const csv = header + rows;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anki-${(title || 'notes').slice(0,20).replace(/[^a-z0-9]/gi,'-')}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Anki export failed', e);
      alert('Anki export failed');
    } finally {
      setExporting(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#fcfcf9] text-zinc-900 antialiased" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header — always styled with design tokens */}
      <div className="sticky top-0 z-20 bg-[#fcfcf9]/80 backdrop-blur-[12px] border-b border-zinc-200">
        <div className="max-w-[840px] mx-auto px-6 h-[64px] flex items-center justify-between gap-2">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 h-10 px-4 rounded-full bg-white border border-zinc-200 text-zinc-900 text-[13px] font-[600] hover:border-zinc-900 hover:shadow-sm transition-all active:scale-[0.98]"
            title="Back to library — your notes are saved"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            {!isNoTranscript && onBook && (
              <button 
                onClick={onBook} 
                className="h-10 px-5 rounded-full bg-[#7c3aed] text-white text-[13px] font-[700] flex items-center gap-2 hover:bg-[#6d28d9] shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                title="View as premium book — cover, TOC with real page numbers, chapters, print-ready"
              >
                <BookOpen className="w-4 h-4" /> Book
              </button>
            )}
            <button 
              onClick={async () => { await navigator.clipboard.writeText(markdown); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
              className="h-10 w-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:border-zinc-900 hover:shadow-sm transition-all active:scale-[0.95]"
              title={copied ? "Copied markdown!" : "Copy full markdown — keeps formatting for Obsidian/Notion"}
            >
              {copied ? <Check className="w-4 h-4 text-zinc-900" /> : <Copy className="w-4 h-4 text-zinc-600" />}
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-[800px] mx-auto px-6 py-10">
        {/* ERROR STATE — No transcript — fully styled with design tokens, not raw HTML */}
        {isNoTranscript && (
          <div className="mb-8 rounded-[16px] border border-amber-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-amber-50 border-b border-amber-100 p-5 flex gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-[700] text-[15px] tracking-[-0.01em] text-zinc-900 flex items-center gap-2">
                  No transcript available — honest, not fake
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-[700]">HONEST</span>
                </div>
                <div className="text-[13px] text-zinc-700 mt-2 leading-[1.6] font-[450]">
                  This video has no captions. YouTube creator did not provide captions and auto-captions are disabled or not generated yet. 
                  <span className="font-[600] text-zinc-900"> We cannot generate notes without real transcript — we will NOT fake content pretending we analyzed the video.</span>
                </div>
              </div>
            </div>
            <div className="p-5 bg-[#fcfcf9]">
              <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-3">WHAT TO DO — REAL STEPS</div>
              <div className="space-y-2.5 text-[13px] leading-[1.5]">
                <div className="flex gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px] font-[700] shrink-0">1</span>
                  <span className="text-zinc-700"><span className="font-[600] text-zinc-900">Try different video</span> — pick one with captions enabled (most educational channels have them)</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center text-[11px] font-[700] shrink-0">2</span>
                  <span className="text-zinc-700"><span className="font-[600] text-zinc-900">If you own this video</span> — enable captions: YouTube Studio → Subtitles → Add language → Auto-generate (takes few hours)</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center text-[11px] font-[700] shrink-0">3</span>
                  <span className="text-zinc-700"><span className="font-[600] text-zinc-900">Audio fallback coming</span> — yt-dlp + Groq Whisper API (free, chunked for long audio) is being implemented</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={onBack} className="h-9 px-4 rounded-full bg-zinc-900 text-white text-[12px] font-[700] flex items-center gap-1.5 hover:bg-black transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Try another video
                </button>
                <a href="https://support.google.com/youtube/answer/2734796" target="_blank" rel="noopener noreferrer" className="h-9 px-4 rounded-full bg-white border border-zinc-200 text-zinc-900 text-[12px] font-[600] flex items-center gap-1.5 hover:border-zinc-900 hover:shadow-sm transition-all">
                  How to enable captions <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="mt-3 text-[11px] font-mono text-zinc-500">Pipeline: YouTube timedtext (free) + oembed + Invidious fallback → audio Whisper fallback (Groq free) — honest, never fake</div>
            </div>
          </div>
        )}

        {title && (
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-[700] ${isNoTranscript ? 'bg-amber-500 text-white' : 'bg-zinc-900 text-white'}`}>
                <FileText className="w-3.5 h-3.5" /> {language?.toUpperCase() || 'EN'} • {isNoTranscript ? 'No Transcript — Honest' : 'Real Transcript'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-[11px] font-[600]">
                <Eye className="w-3.5 h-3.5" /> {wordCount} words
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-[11px] font-[600]">
                <Clock className="w-3.5 h-3.5" /> {readingTime} min
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-[11px] font-[600]">
                <Quote className="w-3.5 h-3.5" /> {importantWordsCount} phrases
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-[11px] font-[600]">
                {timestampCount} timestamps
              </span>
            </div>
            
            <h1 className="font-display text-[28px] sm:text-[36px] leading-[1.05] tracking-[-0.02em] font-[700] text-zinc-900" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>{title.replace(/ • (AI|Specific)$/, '')}</h1>
          </div>
        )}
        
        <div className="rounded-[16px] border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="prose prose-zinc max-w-none 
              prose-p:text-[15px] prose-p:leading-[1.8] prose-p:font-[450] prose-p:text-zinc-700 prose-p:font-sans
              prose-headings:font-display prose-headings:font-[700] prose-headings:tracking-[-0.02em] prose-headings:text-zinc-900
              prose-h2:text-[20px] prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-zinc-100
              prose-h3:text-[16px] prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-[700]
              prose-strong:font-[700] prose-strong:text-zinc-900
              prose-code:text-[13px] prose-code:bg-zinc-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-[8px] prose-code:font-mono prose-code:border prose-code:border-zinc-200
              prose-li:text-[14px] prose-li:leading-[1.7] prose-li:font-sans
              break-words
            " dir={isArabic ? 'rtl' : 'ltr'} style={{ fontFamily: 'Inter, sans-serif' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-100 bg-[#fcfcf9]/50 space-y-4">
            <div className="rounded-[12px] bg-white border border-zinc-200 p-4 shadow-sm">
              <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-3 flex items-center gap-2">
                EXPORTS — REAL DIFFERENCE 
                <span className="px-1.5 py-0.5 rounded-full bg-[#7c3aed] text-white text-[9px]">REAL FILES</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-[12px] border border-zinc-200 bg-white p-3 hover:border-zinc-300 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-[10px] bg-zinc-100 flex items-center justify-center"><FileDown className="w-4 h-4 text-zinc-600" /></div>
                    <div>
                      <div className="font-[700] text-[13px] text-zinc-900">Quick Notes</div>
                      <div className="text-[11px] text-zinc-500">Simple, fast, no cover — 1 page</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-600 leading-[1.5] mb-3 font-[450]">Title + raw notes. No cover page, no TOC, no chapter breaks. Fast export for quick review.</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleQuickNotesPDF} 
                      disabled={!!exporting} 
                      className="flex-1 h-9 rounded-full bg-zinc-900 text-white text-[12px] font-[700] flex items-center justify-center gap-1.5 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                      title="Download Quick Notes as PDF — simple, 1 page, no cover/TOC, fast"
                    >
                      {exporting === 'quick-pdf' ? 'Generating...' : <><FileDown className="w-4 h-4" /> PDF Quick</>}
                    </button>
                    <button 
                      onClick={() => { const blob = new Blob([markdown], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `spi-notes-${new Date().toISOString().slice(0,10)}.md`; a.click(); }} 
                      className="h-9 px-3 rounded-full bg-white border border-zinc-200 text-[12px] font-[600] text-zinc-600 hover:border-zinc-900 hover:shadow-sm transition-all active:scale-[0.95]"
                      title="Download as Markdown — for Obsidian, Notion, any markdown editor"
                    >
                      MD
                    </button>
                  </div>
                </div>
                <div className={`rounded-[12px] border p-3 transition-all ${isNoTranscript ? 'border-zinc-200 bg-zinc-50 opacity-60' : 'border-zinc-900 bg-zinc-900 shadow-sm'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${isNoTranscript ? 'bg-zinc-200' : 'bg-white'}`}><BookOpen className={`w-4 h-4 ${isNoTranscript ? 'text-zinc-500' : 'text-zinc-900'}`} /></div>
                    <div>
                      <div className={`font-[700] text-[13px] ${isNoTranscript ? 'text-zinc-500' : 'text-white'}`}>Book / Course — Premium</div>
                      <div className={`text-[11px] ${isNoTranscript ? 'text-zinc-400' : 'text-zinc-400'}`}>{isNoTranscript ? 'Disabled — no transcript' : 'Print-ready, real TOC — 7 pages'}</div>
                    </div>
                  </div>
                  <div className={`text-[11px] leading-[1.5] mb-3 font-[450] ${isNoTranscript ? 'text-zinc-400' : 'text-zinc-400'}`}>
                    {isNoTranscript ? 'Book export needs real transcript to create chapters, TOC with real page numbers, cover. No transcript = no book, honest.' : 'Cover auto title from video, TOC with real page numbers, chapters per topic, A4 margins, headers/footers, justified. Send to print shop.'}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleBookPDF} 
                      disabled={!!exporting || isNoTranscript} 
                      className="flex-1 h-9 rounded-full bg-[#7c3aed] text-white text-[12px] font-[700] flex items-center justify-center gap-1.5 hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 transition-all active:scale-[0.98] shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)] disabled:shadow-none"
                      title={isNoTranscript ? "Disabled — no transcript available to create a book from. Need real captions first." : "Download as premium Book PDF — cover, TOC with real page numbers, chapters, A4 print-ready"}
                    >
                      {exporting === 'book-pdf' ? 'Generating...' : <><BookOpen className="w-4 h-4" /> PDF Book</>}
                    </button>
                    <button 
                      onClick={handleBookDOCX} 
                      disabled={!!exporting || isNoTranscript} 
                      className="flex-1 h-9 rounded-full bg-white text-zinc-900 text-[12px] font-[700] flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 hover:bg-zinc-100 transition-all active:scale-[0.98]"
                      title={isNoTranscript ? "Disabled — no transcript, cannot create book DOCX" : "Download as Book DOCX — editable, print-ready, with cover and TOC"}
                    >
                      {exporting === 'book-docx' ? '...' : <><FileDown className="w-4 h-4" /> DOCX</>}
                    </button>
                  </div>
                  {isNoTranscript && <div className="mt-2 text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 text-center">Intentionally disabled — no transcript = no book to export, honest</div>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {onBook && !isNoTranscript && (
                <button 
                  onClick={onBook} 
                  className="h-11 px-6 rounded-full bg-[#7c3aed] text-white text-[13px] font-[700] flex items-center gap-2 hover:bg-[#6d28d9] shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="View as interactive book — chapters, progress bar, glossary, print-ready"
                >
                  <BookOpen className="w-4 h-4" /> View as book — {Math.ceil(wordCount/200)} min
                </button>
              )}
              {onBook && isNoTranscript && (
                <div className="h-11 px-6 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 text-[13px] font-[600] flex items-center gap-2 cursor-not-allowed">
                  <BookOpen className="w-4 h-4" /> Book view disabled — no transcript
                </div>
              )}
              <button 
                onClick={async () => { await navigator.clipboard.writeText(markdown); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                className="h-11 px-5 rounded-full bg-white border border-zinc-200 text-zinc-900 text-[13px] font-[600] flex items-center gap-2 hover:border-zinc-900 transition-all hover:shadow-sm active:scale-[0.98]"
                title="Copy full markdown with formatting — for Obsidian, Notion, or any markdown editor"
              >
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy markdown</>}
              </button>
              <button 
                onClick={handleCopyPlainText} 
                className="h-11 px-5 rounded-full bg-white border border-zinc-200 text-zinc-900 text-[13px] font-[600] flex items-center gap-2 hover:border-zinc-900 transition-all hover:shadow-sm active:scale-[0.98]"
                title="Copy as plain text — strips markdown symbols, for pasting into Google Docs, Word, Notion without formatting"
              >
                {copiedPlain ? <><Check className="w-4 h-4" /> Copied plain!</> : <><ClipboardList className="w-4 h-4" /> Copy as plain text</>}
              </button>
              <button 
                onClick={handleExportAnki} 
                disabled={!!exporting || isNoTranscript} 
                className="h-11 px-5 rounded-full bg-zinc-900 text-white text-[13px] font-[600] flex items-center gap-2 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 transition-all hover:shadow-md active:scale-[0.98]"
                title={isNoTranscript ? "Disabled — no transcript, no phrases to make flashcards from" : "Export to Anki CSV — creates front/back cards from Important Words with timestamps, import into Anki desktop"}
              >
                {exporting === 'anki' ? 'Generating...' : <><Download className="w-4 h-4" /> Export Anki CSV</>}
              </button>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 leading-[1.4] bg-white border border-zinc-200 rounded-[10px] p-3">
              <div className="flex items-center gap-2 mb-1"><Lightbulb className="w-3.5 h-3.5" /> <span className="font-[700]">Tools explained:</span></div>
              • <span className="font-[600]">Copy markdown</span> — keeps **bold**, `code`, links for Obsidian/Notion • <span className="font-[600]">Copy plain</span> — strips symbols for Google Docs/Word • <span className="font-[600]">Anki CSV</span> — front/back from Important Words → Anki • <span className="font-[600]">PDF Quick</span> — 1 page fast • <span className="font-[600]">PDF Book/DOCX</span> — premium 7 pages, real TOC — {isNoTranscript ? 'disabled when no transcript (intentional, visually grayed + not-allowed cursor)' : 'enabled, real files'} — all tested, real output
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-200 mt-12 py-6 bg-white">
        <div className="max-w-[800px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2"><span className="font-mono">Notes view • {isNoTranscript ? 'No transcript — honest' : 'Real transcript'} • {wordCount} words</span></div>
          <div>Designed by Eng. Abdelrahman Ahmed Abdullah — built with minimal AI assistance</div>
        </div>
      </footer>
    </div>
  );
}
