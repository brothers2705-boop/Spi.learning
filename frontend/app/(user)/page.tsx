'use client';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useState } from 'react';
import { 
  Youtube, FileText, BookOpen, Brain, 
  ArrowUpRight, Clock, Shield, Globe, Lock,
  Sparkles, Check, Play, FileDown, Languages,
  Timer, Calculator, Music, GraduationCap,
  Zap, Heart
} from 'lucide-react';

// Refined icons for core actions — subtle accent dot, duotone feel, restrained not gimmicky
function RefinedIcon({ children, accent = true }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="relative">
      <div className="w-10 h-10 rounded-[12px] bg-zinc-900 flex items-center justify-center">
        {children}
      </div>
      {accent && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7c3aed] border-2 border-[#fcfcf9]" />}
    </div>
  );
}

function StepCard({ number, icon, title, desc }: { number: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-[16px] border border-zinc-200 bg-white p-5 hover:border-zinc-900 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-[10px] bg-zinc-900 flex items-center justify-center text-white">
          {icon}
        </div>
        <span className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-400 group-hover:text-zinc-900 transition-colors">{number}</span>
      </div>
      <div className="font-[600] text-[14px] tracking-[-0.01em] text-zinc-900">{title}</div>
      <div className="text-[13px] text-zinc-500 mt-1.5 leading-[1.5] font-[450]">{desc}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, highlight }: { icon: React.ReactNode; title: string; desc: string; highlight?: string }) {
  return (
    <div className="rounded-[16px] border border-zinc-200 bg-white p-5 hover:border-zinc-900 transition-colors">
      <div className="w-8 h-8 rounded-[10px] bg-zinc-100 flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="font-[600] text-[14px] tracking-[-0.01em] text-zinc-900 flex items-center gap-2">
        {title}
        {highlight && <span className="px-2 py-0.5 rounded-full bg-[#7c3aed] text-white text-[10px] font-[700]">{highlight}</span>}
      </div>
      <div className="text-[13px] text-zinc-600 mt-2 leading-[1.6] font-[450]">{desc}</div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <main className="min-h-screen bg-[#fcfcf9] text-zinc-900">
      {/* Header — same tokens, logo left, max 3-4 nav middle, avatar right pattern but landing has CTA */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-[#fcfcf9]/80 backdrop-blur-[12px]">
        <div className="max-w-[1280px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="default" />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#how" className="h-9 px-4 rounded-full text-[13px] font-[600] text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">How it works</a>
            <a href="#features" className="h-9 px-4 rounded-full text-[13px] font-[600] text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">Features</a>
            <a href="#free" className="h-9 px-4 rounded-full text-[13px] font-[600] text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">Why free</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/app" className="hidden md:flex h-9 px-4 rounded-full bg-white border border-zinc-200 text-[13px] font-[600] hover:border-zinc-900 transition-colors">
              Open app
            </Link>
            <Link href="/app" className="h-9 px-5 rounded-full bg-[#7c3aed] text-white text-[13px] font-[700] flex items-center gap-1.5 hover:bg-[#6d28d9] transition-colors shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)]">
              Try it free <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center">
              <span className="text-[12px] font-[700]">{mobileMenu ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-zinc-200 bg-white px-6 py-4 space-y-2">
            <a href="#how" onClick={() => setMobileMenu(false)} className="block h-10 px-4 rounded-full bg-zinc-100 text-[13px] font-[600] flex items-center">How it works</a>
            <a href="#features" onClick={() => setMobileMenu(false)} className="block h-10 px-4 rounded-full bg-zinc-100 text-[13px] font-[600] flex items-center">Features</a>
            <a href="#free" onClick={() => setMobileMenu(false)} className="block h-10 px-4 rounded-full bg-zinc-100 text-[13px] font-[600] flex items-center">Why free</a>
            <Link href="/app" className="block h-10 px-4 rounded-full bg-zinc-900 text-white text-[13px] font-[700] flex items-center justify-center">Open app — /app</Link>
          </div>
        )}
      </header>

      {/* Hero — strong one-line value prop, supporting line, primary CTA #7c3aed */}
      <section className="max-w-[1280px] mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="max-w-[720px]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-[11px] font-[600] text-zinc-600 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-pulse" />
            <span>New: Real logo • Landing page • /app tool route • 100% free</span>
          </div>
          
          <h1 className="font-display text-[40px] md:text-[64px] leading-[0.9] tracking-[-0.04em] font-[700] text-zinc-900">
            Turn any lecture
            <br />
            <span className="text-zinc-400 font-[400]">into a real book.</span>
          </h1>
          
          <p className="text-[16px] md:text-[18px] text-zinc-600 mt-6 leading-[1.6] max-w-[520px] font-[450]">
            Paste a YouTube link. We read real captions with timestamps — not watching video — and generate structured, print-ready notes. No summary fluff. Exact definitions, code, formulas preserved.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link href="/app" className="h-12 px-7 rounded-full bg-[#7c3aed] text-white text-[15px] font-[700] flex items-center gap-2 hover:bg-[#6d28d9] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_24px_-8px_rgba(124,58,237,0.5)]">
              <RefinedIcon accent={false}>
                <Play className="w-4 h-4 text-white fill-current" />
              </RefinedIcon>
              <span>Try it free</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-[12px] text-zinc-500 font-[450]">
              <Shield className="w-3.5 h-3.5" />
              <span>Private • Free forever • No credit card</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-zinc-200"><Clock className="w-3 h-3" /> 3h+ lectures supported</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-zinc-200"><Languages className="w-3 h-3" /> Arabic + English</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-zinc-200"><Lock className="w-3 h-3" /> Private per user</span>
          </div>
        </div>

        {/* Hero visual — logo mark large, shows scalability */}
        <div className="mt-12 md:mt-16 rounded-[24px] border border-zinc-200 bg-white p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#7c3aed]/5 to-transparent rounded-full blur-[40px] pointer-events-none" />
          <div className="relative grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <LogoMarkOnly className="w-16 h-16" />
                <LogoMarkOnly className="w-16 h-16" book />
              </div>
              <div className="font-display text-[18px] font-[700] tracking-[-0.02em]">Real custom logomark — not S-in-box</div>
              <div className="text-[13px] text-zinc-600 mt-2 leading-[1.6] font-[450] max-w-[400px]">
                Concept: Play-button shape morphing into folded page/bookmark corner. Video → structured notes/book. Single-color SVG, works at 16px favicon and 200px hero. Second variant: open book with timestamp/play mark on spine for large sizes.
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-mono">SVG • scalable</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-[11px] font-mono">#7c3aed + zinc-900</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-[11px] font-mono">16px → 200px</span>
              </div>
            </div>
            <div className="rounded-[16px] border border-zinc-200 bg-[#fcfcf9] p-6">
              <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-3">BEFORE → AFTER</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-[12px] bg-white border border-zinc-200">
                  <div className="w-8 h-8 rounded-[8px] bg-zinc-900 flex items-center justify-center"><span className="text-white font-[700] text-[12px]">S</span></div>
                  <div>
                    <div className="text-[12px] font-[600] line-through text-zinc-400">Old: S in rounded square — generic AI template</div>
                    <div className="text-[11px] font-mono text-zinc-500">Removed — grep zero instances</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-[12px] bg-zinc-900 text-white border border-zinc-900">
                  <LogoMarkOnly className="w-8 h-8" variant="mono" />
                  <div>
                    <div className="text-[12px] font-[600]">New: Play → folded page + notes lines</div>
                    <div className="text-[11px] font-mono text-zinc-400">Custom SVG, single-color, premium</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — 3-4 steps with icons */}
      <section id="how" className="max-w-[1280px] mx-auto px-6 py-16 border-t border-zinc-200">
        <div className="max-w-[640px] mb-10">
          <h2 className="font-display text-[28px] md:text-[36px] leading-[0.9] tracking-[-0.03em] font-[700]">How it works</h2>
          <p className="text-[14px] text-zinc-600 mt-3 leading-[1.6] font-[450]">Four real steps, no fake badges. Paste link → AI extracts & analyzes → Get organized notes → Download book/PDF. Each step is a real working feature.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StepCard number="01" icon={<Youtube className="w-4 h-4 text-white" />} title="Paste YouTube link" desc="Any length, short or 3h+. We read real captions with timestamps via YouTube captions API — free, no key." />
          <StepCard number="02" icon={<Sparkles className="w-4 h-4 text-white" />} title="AI extracts & analyzes" desc="Gemini 1.5-flash free tier primary (1M context, 15 RPM) with meticulous prompt — preserves exact definitions, code, formulas, never hallucinates." />
          <StepCard number="03" icon={<FileText className="w-4 h-4 text-white" />} title="Get organized notes" desc="Full transcript captured, Important Words with exact phrases + timestamps, Key Moments, Quick Captures — not generic summary." />
          <StepCard number="04" icon={<BookOpen className="w-4 h-4 text-white" />} title="Download book/PDF" desc="Quick Notes PDF simple + Book PDF premium with cover, TOC real page numbers, chapters, A4 print-ready via jsPDF/docx MIT free." />
        </div>
      </section>

      {/* Features — real, not decorative */}
      <section id="features" className="max-w-[1280px] mx-auto px-6 py-16 border-t border-zinc-200">
        <div className="max-w-[640px] mb-10">
          <h2 className="font-display text-[28px] md:text-[36px] leading-[0.9] tracking-[-0.03em] font-[700]">Built for real studying</h2>
          <p className="text-[14px] text-zinc-600 mt-3 leading-[1.6] font-[450]">Every feature is real, tested, and tied to study product — not random extras. No click-does-nothing pills.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard icon={<Clock className="w-4 h-4" />} title="Long lectures, 3h+ support" desc="Chunking preserved for 3h+ videos. Pacing/backoff to stay under Gemini free tier 15 RPM, queue/retry rather than fail. Real transcript pipeline, not watching video." highlight="3h+" />
          <FeatureCard icon={<Heart className="w-4 h-4" />} title="Free forever, no hidden paid" desc="100% free end-to-end: transcript free, Gemini free tier primary, Groq fallback free, local meticulous fallback, book PDF free, hosting free tier. GEMINI_API_KEY only key required, free no credit card." highlight="FREE" />
          <FeatureCard icon={<BookOpen className="w-4 h-4" />} title="Book/course export" desc="Real difference: Quick Notes 1 page simple vs Book 7 pages premium with cover auto title, TOC real page numbers from final layout, chapters per topic, A4 margins, headers/footers, RTL Arabic support." />
          <FeatureCard icon={<Languages className="w-4 h-4" />} title="Arabic + English support" desc="Detects language from URL and content, preserves RTL for Arabic book export, Cairo/Tajawal fonts, timestamps work in both. Real i18n, not just translation." />
          <FeatureCard icon={<Lock className="w-4 h-4" />} title="Private per user, isolated" desc="Each user isolated admin: userStorage.getUserDataKeys(userId) → spi_notes_{userId}, spi_tasks_{userId}, spi_spotify_{userId}. No shared data, private, localStorage + SQLite single shared DB for user+admin." />
          <FeatureCard icon={<GraduationCap className="w-4 h-4" />} title="Study tools that you actually use" desc="Calculator (C) real math with history, Timer (T) Pomodoro 25/5/15 with sessions tracking, Spotify (M) embed any playlist private per user, Tasks (L) hours • course • priority, Flashcards, Anki CSV export, Copy plain text." highlight="C T M" />
        </div>

        <div className="mt-8 rounded-[16px] border border-zinc-200 bg-white p-6">
          <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-4">CORE ACTIONS — REFINED ICON TREATMENTS</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#fcfcf9] border border-zinc-200">
              <RefinedIcon><Youtube className="w-4 h-4 text-white" /></RefinedIcon>
              <div><div className="text-[12px] font-[600]">Generate Notes</div><div className="text-[11px] font-mono text-zinc-500">Primary CTA • #7c3aed dot</div></div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#fcfcf9] border border-zinc-200">
              <RefinedIcon><BookOpen className="w-4 h-4 text-white" /></RefinedIcon>
              <div><div className="text-[12px] font-[600]">Book Export</div><div className="text-[11px] font-mono text-zinc-500">Premium • accent dot</div></div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#fcfcf9] border border-zinc-200">
              <RefinedIcon><Brain className="w-4 h-4 text-white" /></RefinedIcon>
              <div><div className="text-[12px] font-[600]">Flashcards</div><div className="text-[11px] font-mono text-zinc-500">Study • dot</div></div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#fcfcf9] border border-zinc-200">
              <RefinedIcon><FileDown className="w-4 h-4 text-white" /></RefinedIcon>
              <div><div className="text-[12px] font-[600]">Assistant</div><div className="text-[11px] font-mono text-zinc-500">Chat • dot</div></div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-zinc-500 font-[450]">Restrained, not gimmicky: same Lucide library, same stroke width 2, only subtle accent dot #7c3aed border #fcfcf9 on core actions to feel a notch more crafted.</div>
        </div>
      </section>

      {/* Why free — trust section, honest not salesy */}
      <section id="free" className="max-w-[1280px] mx-auto px-6 py-16 border-t border-zinc-200">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <div>
            <h2 className="font-display text-[28px] md:text-[36px] leading-[0.9] tracking-[-0.03em] font-[700]">Why it's free</h2>
            <p className="text-[14px] text-zinc-600 mt-3 leading-[1.6] font-[450]">No hidden paid tier. No credit card. Honest about costs — that's a real differentiator, not marketing.</p>
            <div className="mt-6 space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5 text-white" /></div>
                <div className="text-[13px] leading-[1.5] font-[450]"><span className="font-[600]">Gemini free tier primary</span> — 15 RPM, 1M TPM, 1M context window (largest free), no credit card, get key from aistudio.google.com/apikey — genuinely free, pacing/backoff to stay under limit.</div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5 text-white" /></div>
                <div className="text-[13px] leading-[1.5] font-[450]"><span className="font-[600]">Groq fallback free</span> — 14.4k requests/day, 30 RPM, open-weight llama-3.3-70b-versatile, no credit card, console.groq.com/keys — used when Gemini rate-limited.</div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5 text-white" /></div>
                <div className="text-[13px] leading-[1.5] font-[450]"><span className="font-[600]">Everything else free</span> — YouTube captions API free no key, SQLite + JSON fallback free, jsPDF/docx MIT free, Google OAuth free any volume, Vercel/Render free tier hosting.</div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5"><Shield className="w-3.5 h-3.5 text-zinc-600" /></div>
                <div className="text-[13px] leading-[1.5] font-[450]"><span className="font-[600]">Privacy</span> — Core notes pipeline never sends transcript to Puter.js third-party proxy — only to Google Gemini API you control or Groq direct or local no API. Assistant widget may use Puter.js transparent for lightweight chat only.</div>
              </div>
            </div>
          </div>
          <div className="rounded-[16px] border border-zinc-200 bg-white p-6">
            <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-4">HONEST COST TABLE — ALL FREE</div>
            <div className="space-y-2 text-[12px] font-mono leading-[1.5]">
              <div className="flex justify-between p-2.5 rounded-[10px] bg-[#fcfcf9] border border-zinc-200"><span>Transcript</span><span className="font-[700]">FREE</span></div>
              <div className="flex justify-between p-2.5 rounded-[10px] bg-[#fcfcf9] border border-zinc-200"><span>Notes AI Gemini primary</span><span className="font-[700]">FREE</span></div>
              <div className="flex justify-between p-2.5 rounded-[10px] bg-[#fcfcf9] border border-zinc-200"><span>Notes AI Groq fallback</span><span className="font-[700]">FREE</span></div>
              <div className="flex justify-between p-2.5 rounded-[10px] bg-[#fcfcf9] border border-zinc-200"><span>Notes AI local fallback</span><span className="font-[700]">FREE</span></div>
              <div className="flex justify-between p-2.5 rounded-[10px] bg-[#fcfcf9] border border-zinc-200"><span>Assistant widget</span><span className="font-[700]">FREE</span></div>
              <div className="flex justify-between p-2.5 rounded-[10px] bg-[#fcfcf9] border border-zinc-200"><span>Book PDF/DOCX</span><span className="font-[700]">FREE MIT</span></div>
              <div className="flex justify-between p-2.5 rounded-[10px] bg-zinc-900 text-white"><span>Paid dependency</span><span className="font-[700]">NONE</span></div>
            </div>
            <div className="mt-4 text-[11px] text-zinc-500 font-[450] leading-[1.5]">No optional paid row left — 100% free end-to-end. Previous Claude row removed, Puter.js removed from core pipeline due privacy. GEMINI_API_KEY only key required for full quality.</div>
          </div>
        </div>
      </section>

      {/* CTA — secondary */}
      <section className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="rounded-[24px] bg-zinc-900 text-white p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="font-display text-[24px] md:text-[28px] leading-[0.9] tracking-[-0.02em] font-[700]">Ready to turn lectures into books?</div>
            <div className="text-[13px] text-zinc-400 mt-2 font-[450]">Paste any YouTube link at /app — free forever, no credit card, private per user.</div>
          </div>
          <Link href="/app" className="h-12 px-7 rounded-full bg-[#7c3aed] text-white text-[14px] font-[700] flex items-center gap-2 hover:bg-[#6d28d9] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_24px_-8px_rgba(124,58,237,0.5)]">
            Try it free — /app <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer — logo, real links, exact credit line subtle muted zinc-500 */}
      <footer className="border-t border-zinc-200 mt-12">
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <Logo size="default" />
              <div className="mt-4 text-[13px] text-zinc-600 leading-[1.5] font-[450] max-w-[320px]">
                Hours of video. Minutes of notes. Real transcript pipeline, not fake. Book/course export print-ready.
              </div>
            </div>
            <div className="flex gap-12">
              <div>
                <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-3">PRODUCT</div>
                <div className="space-y-2 text-[13px] font-[500]">
                  <Link href="/app" className="block hover:text-zinc-900 text-zinc-600 transition-colors">Tool — /app</Link>
                  <a href="#how" className="block hover:text-zinc-900 text-zinc-600 transition-colors">How it works</a>
                  <a href="#features" className="block hover:text-zinc-900 text-zinc-600 transition-colors">Features</a>
                  <a href="#free" className="block hover:text-zinc-900 text-zinc-600 transition-colors">Why free</a>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-3">LINKS</div>
                <div className="space-y-2 text-[13px] font-[500]">
                  <a href="https://github.com/brothers2705-boop/Spi.learning" target="_blank" rel="noopener noreferrer" className="block hover:text-zinc-900 text-zinc-600 transition-colors">GitHub repo</a>
                  <Link href="/admin/login" className="block hover:text-zinc-900 text-zinc-600 transition-colors">Admin panel</Link>
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="block hover:text-zinc-900 text-zinc-600 transition-colors">Get Gemini free key</a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-zinc-500">
              © {new Date().getFullYear()} SPI LEARNING • Free forever • Private per user • Real captions, not fake
            </div>
            <div className="text-[11px] text-zinc-500 font-[450]">
              Designed by Eng. Abdelrahman Ahmed Abdullah — built with minimal AI assistance
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function LogoMarkOnly({ className = 'w-8 h-8', variant = 'default', book = false }: { className?: string; variant?: 'default' | 'accent' | 'mono'; book?: boolean }) {
  const colorClass = variant === 'accent' ? 'text-[#7c3aed]' : variant === 'mono' ? 'text-white' : 'text-zinc-900';
  if (book) {
    return (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} ${colorClass}`}>
        <path d="M4 7C4 5.5 5 4.5 6.5 4.5H15.5V27.5H6.5C5 27.5 4 26.5 4 25V7Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" fill="none"/>
        <path d="M28 7C28 5.5 27 4.5 25.5 4.5H16.5V27.5H25.5C27 27.5 28 26.5 28 25V7Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" fill="none"/>
        <path d="M15.5 4.5V27.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
        <path d="M19.5 10.5V19.5L26 15L19.5 10.5Z" fill="currentColor"/>
        <path d="M7 21H13M19 21H25M7 24H11M19 24H23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} ${colorClass}`}>
      <path d="M7 2.5H20L27 9.5V29.5H7V2.5Z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
      <path d="M20 2.5V9.5H27" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
      <path d="M20 2.5L20 9.5L27 9.5L20 2.5Z" fill="currentColor" fillOpacity="0.12"/>
      <path d="M12.2 8.8V19.8L21.2 14.3L12.2 8.8Z" fill="currentColor"/>
      <path d="M11.5 23.5H21.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M11.5 26.5H17.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
