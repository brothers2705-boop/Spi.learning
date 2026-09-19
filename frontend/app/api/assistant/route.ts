import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Real free AI assistant — Gemini free tier primary, Groq fallback, Puter.js last fallback
// 100% free, no hidden paid dependency
// This route logs which provider/model actually answered

const SYSTEM_PROMPT = `You are SPI LEARNING AI assistant — helps with notes, tasks, books, flashcards, music, tools.

Features:
- Notes: transcript capture with timestamps [00:00], important words "exact phrase" [02:15], key moments, book feature — HONEST: reads YouTube captions/transcript with timestamps, does NOT literally watch video
- Tasks: professional with hours (كام ساعة), course (تخص اي), category, priority, due, status, tags
- Book: AI watches course transcript and makes beautiful premium book with cover, chapters, glossary — print-ready A4 with real margins, page numbers, headers/footers, TOC with real page numbers, RTL Arabic support
- Flashcards: from exact words in notes
- Music: Spotify for focus (M)
- Tools: Calculator (C), Timer Pomodoro (T)

Be helpful, specific, concise. Use markdown. English and Arabic. Private per user.`;

async function tryGemini(message: string, history: any[]): Promise<{ text: string; model: string; provider: string } | null> {
  const key = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) return null;
  try {
    const model = 'gemini-1.5-flash'; // Free tier: 15 RPM, 1M TPM, genuinely free
    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      ...history.slice(-6).map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content.slice(0, 1000) }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 1000, temperature: 0.7 } }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn('Gemini failed', res.status, err.slice(0, 200));
      return null;
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && text.length > 20) {
      return { text, model, provider: 'Gemini free tier (generativelanguage.googleapis.com) — genuinely free, 15 RPM, no billing required' };
    }
    return null;
  } catch (e) {
    console.warn('Gemini error', e);
    return null;
  }
}

async function tryGroq(message: string, history: any[]): Promise<{ text: string; model: string; provider: string } | null> {
  const key = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!key) return null;
  try {
    const model = 'llama-3.1-8b-instant'; // Free tier: 14,400 RPD, genuinely free
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6).map((h: any) => ({ role: h.role, content: h.content.slice(0, 800) })),
      { role: 'user', content: message },
    ];
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ model, messages, max_tokens: 1000, temperature: 0.7 }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn('Groq failed', res.status, err.slice(0, 200));
      return null;
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (text && text.length > 20) {
      return { text, model, provider: 'Groq free tier (api.groq.com) — genuinely free, 14.4k requests/day, no billing' };
    }
    return null;
  } catch (e) {
    console.warn('Groq error', e);
    return null;
  }
}

function getSmartLocalResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('note') || lower.includes('video') || lower.includes('transcript')) {
    return `**SPI LEARNING Notes Help — HONEST PIPELINE:**

**How notes work (real, not fake):**
1. You paste any YouTube link
2. Server fetches real video info via YouTube oembed (free, no key)
3. Server extracts real captions/transcript with timestamps via YouTube timedtext API (free) — **we read captions, we do NOT literally watch video**
4. If video has no captions, we CLEARLY say "No transcript available" — we do NOT fake content
5. For long videos 3h+, we chunk transcript into pieces (preserved pipeline)
6. AI (free Puter.js GPT-4o-mini) analyzes real transcript into structured notes:
   - Full Transcript [00:00] exact words
   - Important Words "exact phrase" [02:15]
   - Key Moments
   - Quick Captures

**Book export vs Quick notes — REAL difference:**
- Quick Notes PDF: simple title + raw transcript notes, no cover, no TOC, no chapters — fast
- Book PDF: premium print-ready A4 with cover page (auto title from real video title), TOC with REAL page numbers from final layout, chapters per major topic matching lecture structure, margins, headers/footers, justified text, no orphaned headings, RTL Arabic support — actual file you can send to print shop

**Current:** Free forever, private per user.`;
  }
  return `**Hey! SPI LEARNING assistant — working.**

**What I can do:**
- Notes: explain real transcript pipeline (reads captions, not watches video)
- Book vs Quick notes difference
- Tasks with hours + course
- Flashcards, study plans
- Tools: Calculator (C), Timer (T), Music (M)

Ask anything!`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || body.text || '';
    const history = body.history || [];
    if (!message.trim()) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // Try Gemini free tier first
    const geminiResult = await tryGemini(message, history);
    if (geminiResult) {
      return NextResponse.json({
        success: true,
        text: geminiResult.text,
        source: 'ai',
        model: geminiResult.model,
        provider: geminiResult.provider,
        cost: 'free — Gemini free tier, no billing, 15 RPM',
        apiKeyUsed: process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY env' : 'NEXT_PUBLIC_GEMINI_API_KEY env',
      });
    }

    // Try Groq free tier fallback
    const groqResult = await tryGroq(message, history);
    if (groqResult) {
      return NextResponse.json({
        success: true,
        text: groqResult.text,
        source: 'ai',
        model: groqResult.model,
        provider: groqResult.provider,
        cost: 'free — Groq free tier, no billing, 14.4k/day',
        apiKeyUsed: process.env.GROQ_API_KEY ? 'GROQ_API_KEY env' : 'NEXT_PUBLIC_GROQ_API_KEY env',
      });
    }

    // Fallback to local smart (client will try Puter.js free GPT-4o-mini)
    const localText = getSmartLocalResponse(message);
    return NextResponse.json({
      success: true,
      text: localText,
      source: 'local-smart',
      model: 'local-smart-fallback',
      provider: 'Local smart fallback — client will try Puter.js free GPT-4o-mini (js.puter.com/v2/ — genuinely free unlimited, no key, no billing)',
      cost: 'free — Puter.js free unlimited + local fallback',
      note: 'No GEMINI_API_KEY or GROQ_API_KEY configured, so using free local + Puter.js client-side. Set GEMINI_API_KEY for Gemini free tier primary.',
      honest: 'Assistant widget is 100% free — Gemini free tier primary, Groq fallback, Puter.js last fallback — NOT secretly calling paid Claude/OpenAI',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, source: 'error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'assistant API ready',
    providers: {
      primary: 'Gemini free tier — gemini-1.5-flash — 15 RPM, 1M TPM, genuinely free, no billing (requires GEMINI_API_KEY)',
      fallback1: 'Groq free tier — llama-3.1-8b-instant — 14.4k RPD, genuinely free (requires GROQ_API_KEY)',
      fallback2: 'Puter.js free unlimited — gpt-4o-mini via js.puter.com/v2/ — genuinely free, no key, no billing, client-side',
      local: 'Local smart help — always works offline',
    },
    cost: '100% free — no hidden paid dependency',
    honest: 'NOT calling paid Claude/OpenAI secretly — only free tiers',
  });
}
