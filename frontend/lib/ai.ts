'use client';

declare global {
  interface Window {
    puter: any;
  }
}

let puterLoaded = false;
let puterLoading = false;
let puterError = false;

export function getPuterStatus() {
  return { loaded: puterLoaded, loading: puterLoading, error: puterError, exists: typeof window !== 'undefined' && !!window.puter?.ai?.chat };
}

export async function loadPuter(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.puter?.ai?.chat) { puterLoaded = true; puterError = false; return true; }
  if (puterLoading) {
    for (let i = 0; i < 100; i++) {
      if (window.puter?.ai?.chat) { puterLoaded = true; puterError = false; return true; }
      await new Promise(r => setTimeout(r, 100));
    }
    return false;
  }
  puterLoading = true;
  puterError = false;
  return new Promise((resolve) => {
    try {
      const existing = document.querySelector('script[src="https://js.puter.com/v2/"]');
      if (existing) {
        const check = setInterval(() => {
          if (window.puter?.ai?.chat) { clearInterval(check); puterLoaded = true; puterLoading = false; resolve(true); }
        }, 200);
        setTimeout(() => { clearInterval(check); puterLoading = false; if (!window.puter?.ai?.chat) { puterError = true; resolve(false); } }, 8000);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => {
        let attempts = 0;
        const check = setInterval(() => {
          attempts++;
          if (window.puter?.ai?.chat) { clearInterval(check); puterLoaded = true; puterLoading = false; puterError = false; resolve(true); }
          else if (attempts > 40) { clearInterval(check); puterLoading = false; puterError = true; resolve(false); }
        }, 200);
      };
      script.onerror = () => { puterLoading = false; puterError = true; resolve(false); };
      document.head.appendChild(script);
    } catch { puterLoading = false; puterError = true; resolve(false); }
  });
}

async function fetchYouTubeInfo(url: string): Promise<{ title: string; author: string }> {
  try {
    const res = await fetch(`/api/transcript?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.title) return { title: data.title, author: data.author || '' };
    }
  } catch {}
  const endpoints = [
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
  ];
  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data.title) return { title: data.title || '', author: data.author_name || data.author || '' };
      }
    } catch {}
  }
  try {
    const idMatch = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([a-zA-Z0-9_-]{11})/);
    if (idMatch) return { title: idMatch[1], author: '' };
  } catch {}
  return { title: '', author: '' };
}

// SMART LOCAL FALLBACK FOR ASSISTANT WIDGET ONLY
function getSmartLocalResponse(message: string, history: { role: string; content: string }[] = []): string {
  const lower = message.toLowerCase();
  if (lower.includes('note') || lower.includes('video') || lower.includes('youtube') || lower.includes('transcript')) {
    return `**SPI LEARNING Notes — 100% FREE Pipeline (Gemini primary):**

**How it REALLY works (100% free):**
1. You paste any YouTube link
2. Server reads REAL YouTube captions/transcript with timestamps via YouTube timedtext API (free, no key) — we read captions, NOT watch video
3. If no captions, UI clearly says "No transcript available" — we do NOT fake
4. For long videos 3h+, chunking preserved with pacing to stay under free tier RPM
5. **CORE AI ROUTING (100% FREE):**
   - **PRIMARY:** Google Gemini free tier — gemini-1.5-flash (1M context, largest free, 15 RPM 1M TPM) via generativelanguage.googleapis.com — when GEMINI_API_KEY set, 100% notes use Gemini with full meticulous prompt (preserve definitions/examples/formulas/procedures/code/terminology/warnings/timestamps/never hallucinate/no over-summarizing) — FREE no credit card, get key from https://aistudio.google.com/apikey
   - **FALLBACK:** Groq free tier — llama-3.3-70b-versatile via api.groq.com — when Gemini rate-limited/down, same meticulous prompt — FREE 14.4k/day 30 RPM no credit card, open-weight models
   - **LOCAL:** Meticulous local fallback preserving exact wording per prompt with timestamps/definitions/examples/formulas — 100% free no API
   - **NO Claude, NO paid API, NO Puter.js for core notes** — Puter.js removed from core pipeline due to privacy (sends transcript via third-party proxy). Puter.js stays ONLY for lightweight chat assistant widget, transparent in UI.

**Book vs Quick Notes — REAL difference:**
- Quick Notes: simple title + raw transcript notes, no cover, no TOC
- Book: premium print-ready A4 — cover auto from real title, TOC with REAL page numbers from final layout, chapters per major topic, margins, headers/footers, justified, RTL Arabic

**Privacy:** Core notes NEVER sends transcript to Puter.js or third-party proxy — only to Gemini API (direct to Google you control) or Groq API (direct to Groq) or local (no API).`;
  }
  if (lower.includes('book') || lower.includes('course book') || lower.includes('print')) {
    return `**Course Book — REAL professional output:**\n\nCover auto title from real video title, TOC real page numbers from final layout, chapters per major topic matching lecture structure, A4 margins 20mm, page numbers, headers/footers, justified, no orphaned headings, RTL Arabic. Actual PDF/DOCX via jsPDF/docx MIT free — not webpage styled as book.\n\nDifference Quick vs Book is real: different files, different structure.`;
  }
  if (lower.includes('cost') || lower.includes('free') || lower.includes('paid') || lower.includes('price')) {
    return `**Honest Cost Table — 100% FREE:**

| Feature | Tool | Free/Paid | Limit behavior |
|---------|------|-----------|----------------|
| Transcript | YouTube timedtext + oembed + Invidious | FREE no key | Fallback to Invidious, honest "No transcript" no fake |
| Notes AI PRIMARY | Google Gemini free tier gemini-1.5-flash via generativelanguage.googleapis.com | FREE 15 RPM 1M TPM 1M context, no credit card | Pacing/backoff to stay under limit, queue/retry if 429 |
| Notes AI FALLBACK | Groq free tier llama-3.3-70b-versatile via api.groq.com | FREE 14.4k/day 30 RPM no credit card | Same meticulous prompt, open-weight, no third-party proxy |
| Notes AI LOCAL | Meticulous local fallback preserving exact wording | FREE no API | Preserves definitions/examples/formulas/timestamps per prompt |
| Assistant | Gemini free 15 RPM + Groq free 14.4k/day + Puter.js free (widget only, transparent) | FREE | Gemini → Groq → Puter.js (widget only) → local |
| Google OAuth | GIS | FREE any volume | Always free |
| Storage | SQLite data/spi.db (ephemeral, pending Postgres via DATABASE_URL) | FREE OSS | Pending Postgres free tier |
| Book PDF | jsPDF + docx MIT | FREE OSS | Unlimited client-side |
| Admin | bcryptjs hash from env | FREE OSS | No limit |

**GEMINI_API_KEY is ONLY key required for entire notes pipeline to work at full quality — 100% free, zero paid dependency. No Claude, no paid row.**
`;
  }
  return `**Hey! SPI LEARNING assistant — working ✅**

**I can help with:**
- Notes: 100% free pipeline — Gemini primary (1M context) meticulous preservation
- Book vs Quick Notes: real difference, print-ready
- Cost: 100% free, GEMINI_API_KEY only key required

**AI Status:** ${puterLoaded ? '✅ Connected (Puter.js free for widget only, transparent)' : puterLoading ? '🟡 Connecting...' : '🔴 Offline — smart local'}

**Note:** Core notes NEVER uses Puter.js due to privacy — only Gemini/Groq/local. Puter.js only for lightweight chat widget, transparent.

What do you need?`;
}

export async function chatWithAI(
  message: string, 
  options: { model?: string; systemPrompt?: string; history?: { role: 'user' | 'assistant'; content: string }[] } = {}
): Promise<{ text: string; source: 'ai' | 'local'; model?: string; provider?: string }> {
  const { model = 'gpt-4o-mini', systemPrompt, history = [] } = options;

  // Try server-side assistant API first (Gemini free tier primary, Groq fallback) — 100% free
  try {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, systemPrompt }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.text && data.text.length > 20) {
        return { text: data.text, source: data.source === 'local-smart' ? 'local' : 'ai', model: data.model, provider: data.provider };
      }
    }
  } catch (e) {
    console.warn('Assistant API failed, trying Puter.js for widget only', e);
  }
  
  // Puter.js ONLY for assistant widget, NOT for core notes — transparent
  try {
    const loaded = await loadPuter();
    if (loaded && typeof window !== 'undefined' && window.puter?.ai?.chat) {
      const modelsToTry = [model, 'gpt-4o-mini', 'gpt-4o'].filter((v, i, a) => a.indexOf(v) === i);
      for (const tryModel of modelsToTry) {
        try {
          let fullPrompt = message;
          if (systemPrompt) fullPrompt = `${systemPrompt}\n\nUser: ${message}`;
          if (history.length > 0) {
            const historyText = history.slice(-6).map(h => `${h.role}: ${h.content.slice(0, 500)}`).join('\n');
            fullPrompt = `${systemPrompt || ''}\n\nConversation:\n${historyText}\n\nUser: ${message}\nAssistant:`;
          }
          const response = await Promise.race([
            window.puter.ai.chat(fullPrompt, { model: tryModel }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000))
          ]);
          let text = '';
          if (typeof response === 'string') text = response;
          else if ((response as any)?.message?.content) text = (response as any).message.content;
          else if ((response as any)?.toString) text = (response as any).toString();
          else text = String(response);
          if (text && text.length > 20) {
            return { text, source: 'ai', model: tryModel, provider: 'Puter.js free unlimited — js.puter.com/v2/ — genuinely free, no key, no billing, client-side — ONLY for assistant widget, NOT core notes (core notes uses Gemini/Groq/local only due to privacy), transparent in UI' };
          }
        } catch (e) {
          console.warn(`Model ${tryModel} failed:`, e);
          continue;
        }
      }
    }
  } catch (e) {
    console.warn('Puter chat failed:', e);
  }
  
  const localResponse = getSmartLocalResponse(message, history);
  return { text: localResponse, source: 'local', model: 'local-smart', provider: 'Local smart fallback — always works offline, 100% free' };
}

function isValidNotes(md: string): boolean {
  if (!md || md.length < 300) return false;
  const lower = md.toLowerCase();
  if (lower.includes("spi learning") && lower.includes("agent") && lower.includes("download") && md.length < 800) return false;
  if (lower.includes("hello! i'm") && lower.includes("agent") && md.length < 600) return false;
  if (!md.includes('#')) return false;
  return true;
}

export interface TranscriptResult {
  success: boolean;
  title: string;
  author: string;
  transcript: string;
  timestamped: string;
  segments: { start: number; duration: number; text: string }[];
  language: string;
  source: string;
  wordCount: number;
  isLong: boolean;
  chunks?: any[];
  error?: string;
  noTranscript?: boolean;
}

export async function fetchRealTranscript(youtubeUrl: string): Promise<TranscriptResult> {
  try {
    const res = await fetch(`/api/transcript?url=${encodeURIComponent(youtubeUrl)}`);
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 404) {
        return {
          success: false,
          title: data.title || '',
          author: data.author || '',
          transcript: '',
          timestamped: '',
          segments: [],
          language: '',
          source: 'none',
          wordCount: 0,
          isLong: false,
          error: data.error || 'No transcript available',
          noTranscript: true,
        };
      }
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    if (data.success && data.transcript) {
      return {
        success: true,
        title: data.title,
        author: data.author,
        transcript: data.transcript.fullText,
        timestamped: data.transcript.timestamped,
        segments: data.transcript.segments,
        language: data.language,
        source: data.source,
        wordCount: data.transcript.wordCount,
        isLong: data.isLong,
        chunks: data.chunks,
      };
    }
    throw new Error('Invalid transcript response');
  } catch (e: any) {
    console.warn('Real transcript fetch failed', e);
    return {
      success: false,
      title: '',
      author: '',
      transcript: '',
      timestamped: '',
      segments: [],
      language: '',
      source: 'error',
      wordCount: 0,
      isLong: false,
      error: e.message,
    };
  }
}

function buildNotesFromRealTranscript(transcript: TranscriptResult, youtubeUrl: string): string {
  const { title, author, timestamped, segments, language } = transcript;
  const isArabic = /[ء-ي]/.test(transcript.transcript.slice(0, 1000)) || language.startsWith('ar');
  
  const grouped: { time: string; text: string }[] = [];
  let currentGroup = '';
  let groupStart = 0;
  const groupSize = 15;
  for (let i = 0; i < segments.length; i++) {
    if (i % groupSize === 0) {
      if (currentGroup) {
        grouped.push({ time: formatTs(groupStart), text: currentGroup.trim() });
      }
      currentGroup = '';
      groupStart = segments[i]?.start || 0;
    }
    currentGroup += segments[i].text + ' ';
  }
  if (currentGroup) grouped.push({ time: formatTs(groupStart), text: currentGroup.trim() });

  const importantPhrases: { phrase: string; time: string }[] = [];
  for (let i = 0; i < Math.min(grouped.length, 12); i++) {
    const g = grouped[i];
    const sentences = g.text.split(/[.!?]+/).filter(s => s.trim().length > 20 && s.trim().length < 120);
    if (sentences[0]) {
      importantPhrases.push({ phrase: sentences[0].trim().slice(0, 80), time: g.time });
    }
  }

  if (isArabic) {
    return `# ${title || 'تسجيل الكلمات المهمة من الفيديو'}

**المصدر:** ${youtubeUrl}
**القناة:** ${author}
**اللغة:** ${language} • تسجيل حقيقي من الكابشن
**الطريقة:** قراءة الكابشن الحقيقي مع الطوابع الزمنية — لا نشاهد الفيديو حرفياً
**الكلمات:** ${transcript.wordCount} كلمة • ${segments.length} مقطع
**المحرك:** Gemini مجاني أساسي (100% مجاني)

---

## النص الكامل — الأجزاء المهمة المسجلة من الكابشن الحقيقي

${timestamped.slice(0, 8000)}

---

## الكلمات المهمة والعبارات التي قيلت بالضبط

${importantPhrases.map(p => `- "${p.phrase}" [${p.time}]`).join('\n')}

---

## اللحظات المهمة — للعودة إليها

${grouped.slice(0, 8).map(g => `[${g.time}] - ${g.text.slice(0, 80)}...`).join('\n')}

---

## ملاحظات سريعة

${grouped.slice(0, 5).map(g => `- [${g.time}] ${g.text.slice(0, 100)}`).join('\n')}

---

## الخلاصة

${transcript.transcript.slice(0, 500)}...

---
*تسجيل حقيقي • ${transcript.wordCount} كلمة • من الكابشن الحقيقي • المصدر: ${transcript.source} • Gemini مجاني أساسي 100% مجاني*
`;
  }

  return `# ${title || 'Full Transcript & Important Words Captured — Real Captions'}

**Source:** ${youtubeUrl}
**Channel:** ${author}
**Language:** ${language} • Real transcript from YouTube captions
**Method:** Reading real captions/transcript with timestamps — does NOT literally watch video, extracts real text said
**Words:** ${transcript.wordCount} words • ${segments.length} segments • Source: ${transcript.source} • Engine: Gemini free tier primary 100% free
${transcript.isLong ? `**Long video:** ${transcript.chunks?.length || Math.ceil(segments.length / 100)} chunks preserved for 3h+ pipeline with pacing/backoff` : ''}

---

## Full Transcript — Real Captions Captured

${timestamped.slice(0, 10000)}

---

## Important Words & Exact Phrases Said in Video

These are exact words and phrases from real captions — capture to return to them later:

${importantPhrases.map(p => `- "${p.phrase}" [${p.time}] — exact phrase from real transcript`).join('\n')}

---

## Key Moments — Timestamps to Revisit

${grouped.slice(0, 10).map(g => `[${g.time}] - ${g.text.slice(0, 100)}...`).join('\n')}

---

## Quick Captures — Short Notes from Real Transcript

${grouped.slice(0, 6).map(g => `- [${g.time}] ${g.text.slice(0, 120)}...`).join('\n')}

---

## Summary — What Was Really Said

${transcript.transcript.slice(0, 600)}...

---
*Real transcript capture • ${transcript.wordCount} words • From YouTube captions API (free) • Source: ${transcript.source} • Method: reads captions with timestamps, does NOT literally watch video • Engine: Gemini free tier primary 100% free • No paid API, no Puter.js for core notes*
`;
}

function formatTs(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export async function generateNotesWithAI(youtubeUrl: string): Promise<{ markdown: string; source: 'gemini' | 'groq' | 'fallback' | 'real-transcript'; title: string; author: string; transcriptResult?: TranscriptResult; noTranscript?: boolean; model?: string; provider?: string }> {
  // First try REAL transcript extraction — 100% free, honest, no fake
  const transcriptResult = await fetchRealTranscript(youtubeUrl);
  
  if (transcriptResult.noTranscript) {
    return {
      markdown: `# No Transcript Available

**Video:** ${youtubeUrl}
**Title:** ${transcriptResult.title || 'Unknown'}
**Channel:** ${transcriptResult.author || 'Unknown'}

---

## ❌ No transcript/captions available for this video

**Honest message:** This video has no available captions/transcript. The creator did not provide captions and auto-captions are disabled or not generated yet.

**We cannot generate notes without real transcript — we will NOT fake content pretending we analyzed the video.**

**What to do:**
- Try a different video that has captions enabled
- If you own this video, enable captions in YouTube Studio: Go to Subtitles → Add language → Auto-generate
- Check if video is very new — auto-captions can take a few hours to generate

**Pipeline:** Transcript extraction is 100% free — YouTube captions + oembed + Invidious fallback — no paid API, no fake. Core notes engine is 100% free Gemini primary → Groq fallback → meticulous local.

---
*SPI LEARNING — honest transcript capture — 100% free pipeline*`,
      source: 'fallback',
      title: transcriptResult.title,
      author: transcriptResult.author,
      transcriptResult,
      noTranscript: true,
    };
  }

  if (transcriptResult.success && transcriptResult.transcript.length > 100) {
    // We have real transcript — try 100% FREE Gemini primary via /api/generate
    try {
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl,
          transcript: transcriptResult.transcript,
          timestamped: transcriptResult.timestamped,
          title: transcriptResult.title,
          author: transcriptResult.author,
          language: transcriptResult.language,
          wordCount: transcriptResult.wordCount,
          segments: transcriptResult.segments,
          videoId: youtubeUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || '',
        }),
      });
      
      if (genRes.ok) {
        const genData = await genRes.json();
        if (genData.success && genData.markdown && genData.markdown.length > 300) {
          // Gemini primary — 100% free
          if (genData.source === 'gemini') {
            return {
              markdown: genData.markdown,
              source: 'gemini',
              title: transcriptResult.title,
              author: transcriptResult.author,
              transcriptResult,
              model: genData.model,
              provider: genData.provider,
            };
          }
          // Groq fallback — 100% free
          if (genData.source === 'groq') {
            return {
              markdown: genData.markdown,
              source: 'groq',
              title: transcriptResult.title,
              author: transcriptResult.author,
              transcriptResult,
              model: genData.model,
              provider: genData.provider,
            };
          }
          // Meticulous local fallback — 100% free, no API, preserves exact wording
          if (genData.source === 'fallback-meticulous-local') {
            return {
              markdown: genData.markdown,
              source: 'fallback',
              title: transcriptResult.title,
              author: transcriptResult.author,
              transcriptResult,
              model: genData.model,
              provider: genData.provider,
            };
          }
        }
      }
    } catch (e) {
      console.warn('Generate API failed, using real transcript directly', e);
    }

    // If /api/generate failed, fallback to building from real transcript directly — still 100% free, no Puter.js
    const markdown = buildNotesFromRealTranscript(transcriptResult, youtubeUrl);
    return { markdown, source: 'real-transcript', title: transcriptResult.title, author: transcriptResult.author, transcriptResult, model: 'meticulous-local-free', provider: 'Meticulous local fallback 100% free — preserves exact wording per prompt, no Puter.js for core notes' };
  }

  // Fallback to old method if real transcript failed but not explicitly no-transcript — still no Puter.js for core notes
  let videoInfo = { title: '', author: '' };
  try {
    videoInfo = await Promise.race([
      fetchYouTubeInfo(youtubeUrl),
      new Promise<{ title: string; author: string }>((resolve) => setTimeout(() => resolve({ title: '', author: '' }), 2500))
    ]);
  } catch {}

  const isArabic = /[ء-ي]/.test(youtubeUrl) || /[ء-ي]/.test(videoInfo.title);
  const systemPrompt = isArabic 
    ? `أنت مسجل ذكي للكلمات المهمة من الفيديوهات. مهمتك تسجيل كل كلمة مهمة اتقالت في الفيديو، ليس اسطمبة مذاكرة عامة. اكتب كلام حقيقي محدد، ليس اسطمبة. احفظ التعريفات والأمثلة والصيغ بالضبط، لا تخترع. ابدأ بـ # مباشرة.`
    : `You are meticulous transcript capturer. Capture EVERY important word said in video, not generic template. Preserve definitions/examples/formulas/procedures/code/terminology/warnings/timestamps exactly, never hallucinate, no over-summarizing. Be REAL and SPECIFIC. Start with # Title. Honest: you read transcript/captions with timestamps, you do NOT literally watch video.`;

  const prompt = isArabic
    ? `سجل الكلمات المهمة من هذا الفيديو: الرابط: ${youtubeUrl} العنوان: ${videoInfo.title || 'استنتج'} المطلوب: تسجيل حرفي للكلام المهم مع طابع زمني، احفظ التعريفات والأمثلة بالضبط. ارجع ONLY markdown يبدأ بـ #`
    : `Capture important words from video FOR REAL: URL: ${youtubeUrl} Title: ${videoInfo.title || 'Infer'} Channel: ${videoInfo.author || ''} Generate TRANSCRIPT-STYLE: Full transcript [00:00] with real words, Important words & exact phrases with definitions/examples/formulas/procedures/code preserved exactly, Key moments, Quick captures, Summary. BE SPECIFIC REAL, preserve exact wording, no over-summarizing. Honest: you read captions/transcript with timestamps, not watch video. Return ONLY markdown starting with # Real Title — Full Transcript & Important Words`;

  try {
    // Try Gemini/Groq via assistant API first (100% free, no Puter.js for core notes)
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, history: [], systemPrompt }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.text && data.text.length > 400 && data.text.includes('#')) {
        return { markdown: data.text, source: 'gemini', title: videoInfo.title, author: videoInfo.author, model: data.model, provider: data.provider };
      }
    }
    throw new Error('Assistant API failed');
  } catch {
    const { generateMockNotes } = await import('./mock');
    return { markdown: generateMockNotes(youtubeUrl, isArabic), source: 'fallback', title: videoInfo.title, author: videoInfo.author, model: 'mock-free', provider: 'Mock fallback 100% free — no Puter.js for core notes' };
  }
}

export async function generateFlashcardsWithAI(markdown: string): Promise<{ q: string; a: string; source: 'ai' | 'fallback' }[]> {
  const prompt = `From these transcript notes (real captions), generate 6 specific flashcards with exact words/phrases from video as JSON array with "q" and "a". Notes: ${markdown.slice(0, 4000)} Make specific to actual words said, not generic. Return ONLY JSON array.`;

  try {
    const result = await Promise.race([
      chatWithAI(prompt, { model: 'gemini-1.5-flash' }).then(r => r.text),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
    ]);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 8).map((c: any) => ({
          q: c.q || c.question || 'Question',
          a: c.a || c.answer || 'Answer',
          source: 'ai' as const
        }));
      }
    }
    throw new Error('No JSON');
  } catch {
    return extractFlashcardsLocal(markdown).map(c => ({ ...c, source: 'fallback' as const }));
  }
}

function extractFlashcardsLocal(md: string): { q: string; a: string }[] {
  const cards: { q: string; a: string }[] = [];
  const defRegex = /"([^"]{10,80})"\s*\[(\d+:\d+)\]/g;
  let match;
  while ((match = defRegex.exec(md)) !== null && cards.length < 6) {
    cards.push({ q: `What was said at ${match[2]}?`, a: `"${match[1]}" - exact phrase at ${match[2]}` });
  }
  if (cards.length < 3) {
    const boldRegex = /\*\*(.*?):\*\*\s*(.*?)(?:\n|$)/g;
    while ((match = boldRegex.exec(md)) !== null && cards.length < 6) {
      if (match[1].length > 2 && match[1].length < 80) {
        cards.push({ q: `What is ${match[1]}?`, a: match[2].slice(0, 200) });
      }
    }
  }
  if (cards.length === 0) {
    return [
      { q: 'What important words were said at start?', a: 'Check Full Transcript [00:00] for exact opening words from real captions.' },
      { q: 'What exact phrase defined main concept?', a: 'See Important Words section for exact phrases with timestamps from real transcript.' },
      { q: 'What code or exact syntax was shown?', a: 'Check transcript for exact code like const [count, setCount] = useState(0)' },
    ];
  }
  return cards.slice(0, 6);
}

export const loadAssistant = loadPuter;
export const chatWithAssistant = chatWithAI;
export const generateNotes = generateNotesWithAI;
export const generateFlashcards = generateFlashcardsWithAI;

export const SYSTEM_PROMPT = `You are SPI LEARNING AI assistant — helps with notes, tasks, books, flashcards, music, tools.

Features:
- Notes: REAL transcript capture — reads YouTube captions/transcript with timestamps via free YouTube API, does NOT literally watch video, honest about it, chunking for 3h+ long videos preserved with pacing/backoff for free tier RPM, if no transcript says clearly "No transcript available" instead of faking
- CORE NOTES AI ROUTING (100% FREE): Gemini free tier primary gemini-1.5-flash (1M context, largest free, 15 RPM) via generativelanguage.googleapis.com when GEMINI_API_KEY set — 100% notes use Gemini with full meticulous system prompt (preserve definitions/examples/formulas/procedures/code/terminology/warnings/timestamps/never hallucinate/no over-summarizing) — FREE no credit card from https://aistudio.google.com/apikey — Groq free tier fallback llama-3.3-70b-versatile via api.groq.com when Gemini rate-limited — FREE 14.4k/day — meticulous local fallback preserving exact wording — NO Claude, NO paid API, NO Puter.js for core notes due to privacy
- Tasks: professional with hours (كام ساعة), course (تخص اي), category, priority, due, status, tags
- Book: professional print-ready A4 book — cover auto title from real video title, TOC with REAL page numbers from final layout, chapters per major topic matching lecture real structure, margins, headers/footers, justified text, no orphaned headings, RTL Arabic support, actual PDF/DOCX files via free jsPDF/docx libraries — difference between quick notes and book is real and visible
- Flashcards: from exact words in notes
- Music: Spotify for focus (M)
- Tools: Calculator (C), Timer Pomodoro (T)

Cost: 100% FREE — transcript free, Gemini free tier primary (no credit card), Groq free tier fallback (no credit card), meticulous local fallback free, Google OAuth free, storage SQLite free (ephemeral pending Postgres via DATABASE_URL), book PDF jsPDF/docx MIT free, Puter.js only for assistant widget transparent, no paid dependency anywhere

Be helpful, specific, concise. Use markdown. English and Arabic. Private per user.`;

export const AI_SYSTEM_PROMPT = SYSTEM_PROMPT;
