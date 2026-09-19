'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Clock, ChevronLeft, ChevronRight, Quote, CheckCircle2, Play } from 'lucide-react';
import { CourseBook, parseNotesToBook } from '@/lib/book';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function BookView({ markdown, title, youtubeUrl, onBack }: { markdown: string; title?: string; youtubeUrl: string; onBack: () => void }) {
  const [book, setBook] = useState<CourseBook | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showToc, setShowToc] = useState(false);

  useEffect(() => {
    const localBook = parseNotesToBook(markdown, youtubeUrl, title || 'Course Book');
    setBook(localBook);
  }, [markdown, youtubeUrl, title]);

  if (!book) {
    return (
      <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-[12px] bg-zinc-900 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="font-display text-[16px] font-[700] text-zinc-900">Creating book...</div>
        </div>
      </div>
    );
  }

  const chapter = book.chapters[currentChapter];
  const progress = ((currentChapter + 1) / book.chapters.length) * 100;

  return (
    <div className="min-h-screen bg-[#fcfcf9]">
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-zinc-100 z-[100]">
        <div className="h-full bg-zinc-900 transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>

      <div className="sticky top-0 z-30 bg-[#fcfcf9]/80 backdrop-blur-[12px] border-b border-zinc-200">
        <div className="max-w-[1280px] mx-auto px-6 h-[64px] flex items-center justify-between gap-3">
          <button onClick={onBack} className="flex items-center gap-2 h-10 px-4 rounded-full bg-white border border-zinc-200 text-[13px] font-[600] hover:border-zinc-900 transition-colors text-zinc-900">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-[11px] font-mono text-zinc-600">
              {currentChapter + 1} / {book.totalChapters} • {book.readingTime} min
            </div>
            <button onClick={() => setShowToc(!showToc)} className="h-10 px-5 rounded-full bg-zinc-900 text-white text-[13px] font-[700] flex items-center gap-2 hover:bg-black transition-colors">
              {showToc ? 'Hide' : 'Chapters'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-10 items-start">
          
          <div className={`${showToc ? 'block' : 'hidden lg:block'} lg:sticky lg:top-[88px] order-2 lg:order-1`}>
            <div className="rounded-[16px] border border-zinc-200 bg-white overflow-hidden">
              <div className="h-[180px] bg-zinc-900 p-6 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                  <div className="font-display text-[20px] font-[700] text-white leading-[1.1] line-clamp-2">{book.title}</div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2.5 py-1 rounded-full bg-white text-zinc-900 text-[10px] font-[700]">{book.totalChapters} chapters</span>
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-white text-[10px] font-[700]">{book.readingTime} min</span>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500">CHAPTERS</span>
                  <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">{book.totalChapters}</span>
                </div>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {book.chapters.map((ch, i) => (
                    <button
                      key={ch.id}
                      onClick={() => { setCurrentChapter(i); setShowToc(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-full text-left p-3 rounded-[10px] border transition-colors ${i === currentChapter ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 hover:border-zinc-900 text-zinc-900'}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-[14px] shrink-0 ${i === currentChapter ? 'bg-white text-zinc-900' : 'bg-zinc-100 text-zinc-600'}`}>{ch.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-[600] text-[13px] leading-[1.3] line-clamp-2 ${i === currentChapter ? 'text-white' : 'text-zinc-900'}`}>{ch.title}</div>
                          <div className={`flex items-center gap-2 mt-1.5 ${i === currentChapter ? 'text-white/60' : 'text-zinc-500'}`}>
                            {ch.timestamp && <span className="text-[11px] font-mono flex items-center gap-1"><Clock className="w-3 h-3" />{ch.timestamp}</span>}
                            <span className="text-[11px]">• {ch.content.split(' ').length} words</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {book.glossary.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-zinc-100">
                    <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-3">IMPORTANT WORDS • {book.glossary.length}</div>
                    <div className="space-y-2 max-h-[240px] overflow-y-auto">
                      {book.glossary.map((g, i) => (
                        <div key={i} className="p-3 rounded-[10px] bg-zinc-50 border border-zinc-200">
                          <div className="font-[600] text-[12px] text-zinc-900 leading-[1.3]">"{g.term}"</div>
                          {g.timestamp && <div className="text-[10px] font-mono text-zinc-500 mt-1">[{g.timestamp}]</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 min-w-0">
            {currentChapter === 0 && (
              <div className="rounded-[16px] bg-zinc-900 p-8 sm:p-10 lg:p-12 mb-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-zinc-900" />
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-zinc-800 text-white text-[11px] font-[700] tracking-[0.06em]">COURSE BOOK</div>
                </div>
                
                <h1 className="font-display text-[32px] sm:text-[42px] lg:text-[48px] leading-[0.9] tracking-[-0.03em] font-[700] text-white max-w-[600px]">
                  {book.title}
                </h1>
                
                <p className="text-[15px] sm:text-[16px] leading-[1.5] text-zinc-400 mt-6 max-w-[480px] font-[450]">
                  {book.subtitle}
                </p>

                <div className="mt-10 grid grid-cols-3 gap-3 max-w-[400px]">
                  <div className="rounded-[10px] bg-zinc-800 p-3">
                    <div className="text-[20px] font-[700] text-white">{book.totalChapters}</div>
                    <div className="text-[11px] text-zinc-500 font-[600]">Chapters</div>
                  </div>
                  <div className="rounded-[10px] bg-white p-3">
                    <div className="text-[20px] font-[700] text-zinc-900">{book.readingTime}m</div>
                    <div className="text-[11px] text-zinc-500 font-[600]">Reading</div>
                  </div>
                  <div className="rounded-[10px] bg-zinc-800 p-3">
                    <div className="text-[20px] font-[700] text-white">{book.glossary.length}</div>
                    <div className="text-[11px] text-zinc-500 font-[600]">Key Words</div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[16px] border border-zinc-200 bg-white overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[10px] bg-zinc-900 flex items-center justify-center text-[16px] text-white">{chapter.icon}</div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-[700]">CHAPTER {chapter.number}</span>
                    {chapter.timestamp && <span className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-[11px] font-mono font-[600] flex items-center gap-1"><Play className="w-3 h-3" />{chapter.timestamp}</span>}
                    <span className="hidden sm:flex px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-[11px] font-[600]">{chapter.content.split(' ').length} words</span>
                  </div>
                </div>
                <h2 className="font-display text-[22px] sm:text-[26px] leading-[1.15] tracking-[-0.02em] font-[700] text-zinc-900">{chapter.title}</h2>
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="prose prose-zinc max-w-none 
                  prose-p:font-[450] prose-p:text-[15px] prose-p:leading-[1.8] prose-p:text-zinc-700
                  prose-headings:font-display prose-headings:font-[700] prose-headings:text-zinc-900
                  prose-strong:font-[700] prose-strong:text-zinc-900
                  prose-code:font-mono prose-code:text-[13px] prose-code:bg-zinc-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-[8px] prose-code:border prose-code:border-zinc-200
                  prose-li:text-[14px] prose-li:leading-[1.7]
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{chapter.content}</ReactMarkdown>
                </div>

                {chapter.keyPoints.length > 0 && (
                  <div className="mt-8 rounded-[12px] bg-zinc-50 border border-zinc-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-[8px] bg-zinc-900 flex items-center justify-center text-white text-[12px]">!</div>
                      <span className="text-[11px] font-[700] tracking-[0.08em] text-zinc-500">KEY POINTS</span>
                    </div>
                    <div className="space-y-2.5">
                      {chapter.keyPoints.map((p, i) => (
                        <div key={i} className="flex gap-3 text-[14px] leading-[1.5]">
                          <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px] font-[700] shrink-0 mt-0.5">{i+1}</span>
                          <span className="font-[450] text-zinc-700">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {chapter.importantWords.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {chapter.importantWords.map((w, i) => (
                      <div key={i} className="rounded-[10px] bg-zinc-900 text-white p-4 flex gap-3">
                        <div className="w-8 h-8 rounded-[8px] bg-white/10 flex items-center justify-center shrink-0"><Quote className="w-4 h-4" /></div>
                        <div>
                          <div className="font-[600] text-[14px] leading-[1.4]">"{w.phrase}"</div>
                          <div className="text-[11px] text-white/60 mt-1 font-mono">{w.timestamp} • Exact words</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-zinc-100 bg-[#fcfcf9]/50 flex items-center justify-between">
                <button
                  onClick={() => { if (currentChapter > 0) { setCurrentChapter(c => c - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                  disabled={currentChapter === 0}
                  className="h-10 px-5 rounded-full bg-white border border-zinc-200 text-[13px] font-[600] flex items-center gap-2 disabled:opacity-40 hover:border-zinc-900 transition-colors text-zinc-900"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono font-[600] px-3 py-1 rounded-full bg-zinc-900 text-white">{currentChapter + 1} / {book.totalChapters}</span>
                </div>

                <button
                  onClick={() => { if (currentChapter < book.totalChapters - 1) { setCurrentChapter(c => c + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                  disabled={currentChapter === book.totalChapters - 1}
                  className="h-10 px-5 rounded-full bg-zinc-900 text-white text-[13px] font-[600] flex items-center gap-2 disabled:opacity-40 hover:bg-black transition-colors"
                >
                  {currentChapter === book.totalChapters - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {currentChapter === book.totalChapters - 1 && (
              <div className="mt-6 rounded-[16px] bg-zinc-900 text-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-zinc-900" /></div>
                  <div>
                    <div className="font-[700] text-[15px]">Book Complete</div>
                    <div className="text-[12px] text-zinc-400">You've captured all important words</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="rounded-[10px] bg-zinc-800 p-3 text-center">
                    <div className="text-[18px] font-[700]">{book.totalChapters}</div>
                    <div className="text-[11px] text-zinc-500">Chapters</div>
                  </div>
                  <div className="rounded-[10px] bg-white text-zinc-900 p-3 text-center">
                    <div className="text-[18px] font-[700]">{book.totalWords}</div>
                    <div className="text-[11px] text-zinc-500">Words</div>
                  </div>
                  <div className="rounded-[10px] bg-zinc-800 p-3 text-center">
                    <div className="text-[18px] font-[700]">{book.glossary.length}</div>
                    <div className="text-[11px] text-zinc-500">Phrases</div>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <button onClick={() => { setCurrentChapter(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="h-10 px-5 rounded-full bg-white text-zinc-900 text-[13px] font-[700]">Read again</button>
                  <button onClick={onBack} className="h-10 px-5 rounded-full bg-zinc-800 text-white text-[13px] font-[600]">Back to notes</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
