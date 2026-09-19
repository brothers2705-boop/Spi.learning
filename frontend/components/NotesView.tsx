'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Copy, Check, FileText, Clock, Eye, FileDown, BookOpen, AlertTriangle, Quote } from 'lucide-react';
import { useState } from 'react';
import { getWordCount, getReadingTime } from '@/lib/storage';

export function NotesView({ markdown, title, language, jobId, youtubeUrl, onBack, onFlashcards, onBook }: { markdown: string; title?: string; language?: string; jobId: string; youtubeUrl?: string; onBack: () => void; onFlashcards?: () => void; onBook?: () => void }) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<'quick-pdf' | 'book-pdf' | 'book-docx' | null>(null);
  const isArabic = language?.startsWith('ar') || /[ء-ي]/.test(markdown.slice(0, 1000));
  const wordCount = getWordCount(markdown);
  const readingTime = getReadingTime(wordCount);
  const isNoTranscript = markdown.includes('No transcript/captions available') || markdown.includes('No Transcript Available');
  
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
  
  return (
    <div className="min-h-screen bg-[#fcfcf9]">
      <div className="sticky top-0 z-20 bg-[#fcfcf9]/80 backdrop-blur-[12px] border-b border-zinc-200">
        <div className="max-w-[840px] mx-auto px-6 h-[64px] flex items-center justify-between gap-2">
          <button onClick={onBack} className="flex items-center gap-2 h-10 px-4 rounded-full bg-white border border-zinc-200 text-[13px] font-[600] hover:border-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            {!isNoTranscript && onBook && (
              <button onClick={onBook} className="h-10 px-5 rounded-full bg-[#7c3aed] text-white text-[13px] font-[700] flex items-center gap-2 hover:bg-[#6d28d9] shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)] transition-colors">
                <BookOpen className="w-4 h-4" /> Book
              </button>
            )}
            <button onClick={async () => { await navigator.clipboard.writeText(markdown); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="h-10 w-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:border-zinc-900 transition-colors">
              {copied ? <Check className="w-4 h-4 text-zinc-900" /> : <Copy className="w-4 h-4 text-zinc-600" />}
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-[800px] mx-auto px-6 py-10">
        {isNoTranscript && (
          <div className="mb-8 rounded-[16px] border border-zinc-200 bg-white p-5 flex gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-zinc-900 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-white" /></div>
            <div>
              <div className="font-[700] text-[14px] text-zinc-900">No transcript available</div>
              <div className="text-[13px] text-zinc-600 mt-1 leading-[1.5] font-[450]">This video has no captions. YouTube creator did not provide captions and auto-captions are disabled. We cannot generate notes without real transcript — we do NOT fake content. Try a different video with captions enabled.</div>
            </div>
          </div>
        )}

        {title && (
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-[11px] font-[700]">
                <FileText className="w-3.5 h-3.5" /> {language?.toUpperCase() || 'EN'} • {isNoTranscript ? 'No Transcript' : 'Real Transcript'}
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
            
            <h1 className="font-display text-[28px] sm:text-[36px] leading-[1.05] tracking-[-0.02em] font-[700] text-zinc-900">{title.replace(/ • (AI|Specific)$/, '')}</h1>
          </div>
        )}
        
        <div className="rounded-[16px] border border-zinc-200 bg-white overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="prose prose-zinc max-w-none 
              prose-p:text-[15px] prose-p:leading-[1.8] prose-p:font-[450] prose-p:text-zinc-700
              prose-headings:font-display prose-headings:font-[700] prose-headings:tracking-[-0.02em]
              prose-h2:text-[20px] prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-zinc-100
              prose-h3:text-[16px] prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-[700]
              prose-strong:font-[700] prose-strong:text-zinc-900
              prose-code:text-[13px] prose-code:bg-zinc-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-[8px] prose-code:font-mono prose-code:border prose-code:border-zinc-200
              prose-li:text-[14px] prose-li:leading-[1.7]
              break-words
            " dir={isArabic ? 'rtl' : 'ltr'}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-100 bg-[#fcfcf9]/50 space-y-4">
            <div className="rounded-[12px] bg-white border border-zinc-200 p-4">
              <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-3">EXPORTS — REAL DIFFERENCE</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-[12px] border border-zinc-200 bg-white p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-[10px] bg-zinc-100 flex items-center justify-center"><FileDown className="w-4 h-4 text-zinc-600" /></div>
                    <div>
                      <div className="font-[700] text-[13px] text-zinc-900">Quick Notes</div>
                      <div className="text-[11px] text-zinc-500">Simple, fast, no cover</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-600 leading-[1.5] mb-3 font-[450]">Title + raw notes. No cover page, no TOC, no chapter breaks. Fast export.</div>
                  <div className="flex gap-2">
                    <button onClick={handleQuickNotesPDF} disabled={!!exporting} className="flex-1 h-9 rounded-full bg-zinc-900 text-white text-[12px] font-[700] flex items-center justify-center gap-1.5 hover:bg-black disabled:opacity-40 transition-colors">
                      {exporting === 'quick-pdf' ? 'Generating...' : <><FileDown className="w-4 h-4" /> PDF Quick</>}
                    </button>
                    <button onClick={() => { const blob = new Blob([markdown], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `spi-notes-${new Date().toISOString().slice(0,10)}.md`; a.click(); }} className="h-9 px-3 rounded-full bg-white border border-zinc-200 text-[12px] font-[600] text-zinc-600 hover:border-zinc-900">MD</button>
                  </div>
                </div>
                <div className="rounded-[12px] border border-zinc-900 bg-zinc-900 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center"><BookOpen className="w-4 h-4 text-zinc-900" /></div>
                    <div>
                      <div className="font-[700] text-[13px] text-white">Book / Course — Premium</div>
                      <div className="text-[11px] text-zinc-400">Print-ready, real TOC</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-400 leading-[1.5] mb-3 font-[450]">Cover auto title from video, TOC with real page numbers, chapters per topic, A4 margins, headers/footers, justified. Send to print shop.</div>
                  <div className="flex gap-2">
                    <button onClick={handleBookPDF} disabled={!!exporting || isNoTranscript} className="flex-1 h-9 rounded-full bg-[#7c3aed] text-white text-[12px] font-[700] flex items-center justify-center gap-1.5 hover:bg-[#6d28d9] disabled:opacity-40 transition-colors shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)]">
                      {exporting === 'book-pdf' ? 'Generating...' : <><BookOpen className="w-4 h-4" /> PDF Book</>}
                    </button>
                    <button onClick={handleBookDOCX} disabled={!!exporting || isNoTranscript} className="flex-1 h-9 rounded-full bg-white text-zinc-900 text-[12px] font-[700] flex items-center justify-center gap-1.5 disabled:opacity-40 hover:bg-zinc-100">
                      {exporting === 'book-docx' ? '...' : <><FileDown className="w-4 h-4" /> DOCX</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {onBook && !isNoTranscript && (
                <button onClick={onBook} className="h-11 px-6 rounded-full bg-[#7c3aed] text-white text-[13px] font-[700] flex items-center gap-2 hover:bg-[#6d28d9] shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)] transition-colors">
                  <BookOpen className="w-4 h-4" /> View as book — {Math.ceil(wordCount/200)} min
                </button>
              )}
              <button onClick={async () => { await navigator.clipboard.writeText(markdown); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="h-11 px-5 rounded-full bg-white border border-zinc-200 text-zinc-900 text-[13px] font-[600] flex items-center gap-2 hover:border-zinc-900 transition-colors">
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
