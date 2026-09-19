# Honest Cost Table — 100% FREE, Zero Paid Dependency

**Updated: Gemini primary, Groq fallback, no Claude, no Puter.js for core notes**

| Feature | Tool Used | Free or Paid | What happens at free tier limit | Privacy |
|---------|-----------|--------------|--------------------------------|---------|
| Transcript extraction | YouTube timedtext API (free) + oembed (free) + Invidious fallback (free) | **FREE — no key, no billing** | YouTube may rate-limit if abused — falls back to Invidious, honest "No transcript" if truly none, never fakes | Transcript from YouTube public captions — no private data sent |
| Notes analysis AI PRIMARY | Google Gemini free tier — gemini-1.5-flash (1M context, largest free) via generativelanguage.googleapis.com — model gemini-1.5-flash, 15 RPM 1M TPM, genuinely free, no credit card — get key from https://aistudio.google.com/apikey | **FREE — no credit card, no billing** | Pacing/backoff to stay under 15 RPM — spaces out chunk calls, queues/retries if 429, honest "please try again shortly" if both free tiers exhausted — never fails silently | Transcript sent directly to Google Gemini API you control (API key in your env), no third-party proxy, DPA with Google |
| Notes analysis AI FALLBACK | Groq free tier — llama-3.3-70b-versatile (or 3.1-70b) via api.groq.com — 14.4k requests/day 30 RPM, open-weight models, genuinely free, no credit card — get key from https://console.groq.com/keys | **FREE — no credit card, no billing** | Same meticulous prompt, pacing/backoff, retry if rate-limited, used when Gemini rate-limited/down — no third-party proxy | Transcript sent directly to Groq API you control, no third-party proxy |
| Notes analysis AI LOCAL | Meticulous local fallback — preserves exact wording per prompt with timestamps/definitions/examples/formulas/procedures/code/terminology/warnings — 100% free no API | **FREE — no API, unlimited** | Always works offline, preserves exact transcript structure per meticulous prompt, but without AI enhancement — still better than generic summary | No API call, no data sent anywhere, fully private |
| Chat/support AI Assistant widget | Gemini free tier primary (gemini-1.5-flash 15 RPM) + Groq fallback (llama-3.1-8b-instant 14.4k/day) + Puter.js free unlimited as last fallback for widget only (transparent) | **FREE — all genuinely free tiers** | If Gemini key not set or limit hit, tries Groq, then Puter.js free unlimited for widget only (transparent in UI), then local smart — always works | Assistant widget MAY use Puter.js for lightweight chat only (not core notes) — transparent, but core notes NEVER uses Puter.js due to privacy |
| Google login OAuth | Google Identity Services GIS (accounts.google.com/gsi/client) | **FREE — any volume, no billing** | Always free, no limit, no billing required | OAuth via Google you control |
| Storage/database | SQLite better-sqlite3 local file data/spi.db — currently ephemeral on Render/Vercel/Railway, pending migration to Postgres Supabase/Neon free tier via DATABASE_URL | **FREE — open-source** | SQLite file grows, will lose data on deploy to ephemeral filesystem — migration pending to Postgres free tier (Supabase/Neon) — config change not rewrite, graceful message | Local file, no third party |
| Hosting | Vercel/Render/Railway free tier or localhost | **FREE tier** | Vercel 100GB bandwidth, Render sleeps after 15min, Railway $5 credit — degrades gracefully with clear message, no data loss if Postgres migrated | Depends on host |
| Book/course PDF generation | jsPDF MIT + docx MIT + html2canvas — open-source | **FREE — MIT license, no API** | Unlimited, client-side generation, print-ready A4 with real margins, page numbers, headers/footers, TOC with real page numbers from final layout, RTL Arabic support | Client-side, no data sent |
| Admin auth | bcryptjs hash from env vars ADMIN_EMAIL, ADMIN_PASSWORD_HASH, ADMIN_TOKEN | **FREE — open-source** | No limit, bcrypt verification, env-sourced not hardcoded — SECURITY: admin123 weak default for local dev only, MUST change before public deploy via env var swap no code change | Env vars you control |

**No optional paid row — 100% FREE end-to-end**

- **Previous Claude row removed:** ANTHROPIC_API_KEY was $3/M in $15/M out paid — removed from default core pipeline, kept only as optional add-on OFF by default, not required, not used unless explicitly enabled later
- **Puter.js removed from core pipeline:** Previously used for core notes as fallback — removed due to privacy concern (sends transcript via third-party proxy Puter.com → OpenAI). Now only for lightweight chat assistant widget, transparent in UI, genuinely free unlimited, but core notes NEVER sends transcript to Puter.js
- **GEMINI_API_KEY is the ONLY key required for entire notes pipeline to work at full quality** — 100% free, zero paid dependency anywhere in core product
- **Get free keys:**
  - Gemini: https://aistudio.google.com/apikey — no credit card, 15 RPM 1M TPM 1M context (largest free), free tier
  - Groq: https://console.groq.com/keys — no credit card, 14.4k/day 30 RPM, open-weight models

**What happens when free tier limit hit:**
- Gemini 15 RPM: pacing/backoff spaces out chunk calls (4500ms min interval), queues/retries if 429, honest "please try again shortly" if both Gemini and Groq exhausted
- Groq 14.4k/day: same pacing/backoff, retry
- Local fallback: unlimited, preserves exact wording per meticulous prompt, no API

**Privacy:**
- Core notes pipeline NEVER sends transcript to Puter.js or third-party proxy — only to Google Gemini API (direct to Google you control) or Groq API (direct to Groq) or local (no API)
- Assistant widget MAY use Puter.js for lightweight chat only (not core notes), transparent

**All rows FREE — zero paid dependency in core product**
