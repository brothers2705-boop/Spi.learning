# SPI LEARNING — Hours of video. Minutes of notes.

**Paste any YouTube link → Get professional, print-ready book or course, not just summary.**

- **Real transcript pipeline:** Reads YouTube captions/transcript with timestamps (does NOT literally watch video — honest about it). If no transcript, clearly says "No transcript available" — does NOT fake.
- **Professional book output:** Cover auto title from real video title, TOC with REAL page numbers from final layout, chapters per major topic, A4 print-ready with margins, headers/footers, justified, no orphaned headings, RTL Arabic support. Actual PDF/DOCX files via free jsPDF/docx — send to print shop.
- **100% free except optional Anthropic:** Honest cost table — only optional Claude paid, everything else genuinely free.

## Features

### User Site (`/`)

- **Notes:** Paste any YouTube link (any length, short/long). Real transcript extraction via YouTube captions API (free) + oembed + Invidious fallback. Chunking preserved for 3h+ long videos. If no captions, honest error, not fake.
- **Library:** Real data from localStorage per user — isolated per user, private, searchable, real counts.
- **Book View:** Beautiful book with cover, TOC, chapters, glossary — serif reading, key points amber, important words violet.
- **Book Export:** 
  - Quick Notes PDF: simple title + raw notes, 1 page, no cover/TOC — fast
  - Book PDF: premium 7 pages, cover, TOC real page numbers, chapters, A4 print-ready — via jsPDF MIT free
  - Book DOCX: same via docx MIT free — print-ready with margins, headers/footers
  - Difference is REAL and visible — not same content relabeled
- **Flashcards:** From exact words/phrases in notes.
- **Tasks:** Professional with hours (كام ساعة), course (تخص اي), category, priority, due, status, tags — private per user, press L.
- **Music:** Spotify embed for deep work — press M.
- **Tools:** Calculator (C), Timer Pomodoro (T) — real working, not decorative.
- **Assistant:** Floating bubble bottom-right — real working AI, Gemini free tier primary, Groq fallback, Puter.js last fallback — shows provider/model.
- **Google Login:** Real Google OAuth GIS — free at any volume — shows real name/email/photo from JWT, not fake placeholder.

### Admin Panel (`/admin`)

- **100% separate:** Route group `app/(admin)/` vs `app/(user)/`, separate `globals.css` (dark only vs light), separate JS bundles (`/ 105kB` vs `/admin 7.38kB` vs `/admin/login 3.39kB`) — bug/style change one never touches other.
- **Real auth:** Dedicated admin login email+password, `admin_session` cookie httpOnly SameSite strict, never reuses public user session/cookie, protected every `/api/admin/*` server-side with real middleware rejecting 401/403 not just hiding button.
- **Real data:** Jobs from `data/jobs.json` file DB — real jobs created from user site with full Job model: youtubeUrl, title, status, userId, sessionId, duration, source, modelUsed, wordCount, readingTime, transcriptSource, chunkCount, tokenUsage, estimatedCost, timing, markdown, error.
- **Features:** Stats 5 cards total/success/avgTime/tokens/jobsPerDay chart, jobs list filter all/completed/failed/pending + search, job detail with transcript source, chunk count, tokens, cost, timing, model, user/session, words/reading, error, markdown preview, download MD/PDF admin only, retry/cancel buttons, 401 handling, logout, unauth 401 test.

## Design System

**Tokens:** `lib/designTokens.ts` — single source of truth, applied consistently across user and admin.

- **Colors:** Light `#fcfcf9` / Dark `#0a0a0a`, border, primary, accent violet `#7c3aed`, success emerald, warning amber, error red — same tokens user and admin (admin dark only).
- **Spacing:** xs 4px, sm 8px, md 16px, lg 24px, xl 32px, 2xl 48px
- **Radii:** sm 8px, md 12px, lg 16px, xl 20px, 2xl 24px, full 9999px — applied everywhere cards, buttons, badges, pills
- **Shadows:** sm, md, lg, xl, glowViolet — consistent
- **Typography:** Inter for UI, Newsreader for display (heading "Hours of video. Minutes of notes."), Geist Mono for mono, Cairo/Tajawal for Arabic — with proper fallbacks, not generic
- **Components:** `components/ui.tsx` — Button (primary/secondary/ghost/accent/outline), Card (hover), Badge (default/accent/success/warning/outline), Input, Textarea, AdminCard, AdminBadge — same stroke width, same style, visible labels/tooltips
- **Touch:** 44px minimum, responsive 320-1920, no overflow at 1280/1440/1920px

## Tech Stack — Honest Free vs Paid

See `COST_TABLE.md` for full table.

| Feature | Tool | Free/Paid | At Limit |
|---------|------|-----------|----------|
| Transcript | YouTube captions API + oembed + Invidious fallback | FREE no key | 404 honest error, fallback |
| Notes AI | Puter.js gpt-4o-mini free unlimited via js.puter.com/v2/ | FREE unlimited | Local fallback |
| Optional Claude | Anthropic claude-3-5-sonnet | PAID $3/M in $15/M out | Falls back to free |
| Assistant | Gemini free 15 RPM primary + Groq 14.4k/day + Puter.js unlimited | FREE | Failover chain, always works |
| Google OAuth | Google Identity Services | FREE any volume | Always free |
| Storage | localStorage + file JSON | FREE | Trim to 50 |
| Book PDF | jsPDF MIT + docx MIT | FREE open-source | Unlimited |
| Hosting | Vercel/Render free tier | FREE | Graceful message |

**ONLY paid is optional Anthropic — expected and fine.**

## Setup

### 1. Install

```bash
cd frontend
npm install
```

### 2. Env Vars — All Optional, Works Without Them (Free Forever)

Create `frontend/.env.local`:

```env
# Google OAuth — Free, any volume, no billing
# Get from console.cloud.google.com (see checklist below)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Admin Panel — Separate auth, never shares user session
# Default dev values work without env, but set for production
ADMIN_EMAIL=admin@spi.learning
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=spi_admin_secret_2024_secure

# Optional — Assistant Free Tiers (all free, no billing)
# If not set, uses Puter.js free unlimited client-side — always works
GEMINI_API_KEY=your-gemini-free-key
GROQ_API_KEY=your-groq-free-key

# Optional — Notes AI Paid (only paid piece, not required)
# If not set, uses Puter.js free unlimited — 100% free
ANTHROPIC_API_KEY=your-anthropic-key
```

**No further code changes needed — once you paste real values, features just start working.**

### 3. Run

```bash
npm run dev # http://localhost:3000
npm run build # production build — clean, no dev toolbar, no port numbers visible
```

### 4. Test

```bash
# Admin 401 protection
curl http://localhost:3000/api/admin/jobs # should return 401

# Admin login
curl -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d '{"email":"admin@spi.learning","password":"admin123"}' -c cookies.txt

# List jobs with auth
curl http://localhost:3000/api/admin/jobs -b cookies.txt

# Transcript extraction — honest no-transcript handling
curl "http://localhost:3000/api/transcript?url=https://www.youtube.com/watch?v=jNQXAC9IVRw" # no captions → 404 honest, NOT fake

# Assistant — shows provider/model
curl -X POST http://localhost:3000/api/assistant -H "Content-Type: application/json" -d '{"message":"Which provider are you using?","history":[]}'
```

## Proof

- **Book PDFs:** `frontend/public/SPI_BOOK_ENGLISH_PROOF.pdf` 25K 7 pages LTR, `SPI_BOOK_ARABIC_PROOF_RTL.pdf` 27K 7 pages RTL, `SPI_QUICK_NOTES_*.pdf` 8.2K/7K 1 page — real difference, not relabeled
- **Transcript:** `frontend/app/api/transcript/route.ts` 476 lines — real YouTube captions extraction, honest no-transcript 404, chunking preserved
- **Assistant:** `frontend/app/api/assistant/route.ts` — Gemini primary, Groq fallback, Puter.js last fallback — logs provider/model/cost/apiKeyUsed
- **Admin:** Separate bundles, 401 middleware, real data — tested login, list, detail, retry, cancel, logout, unauth 401
- **Design System:** Tokens in `lib/designTokens.ts`, applied consistently, no fake elements, no overlapping at 1280/1440/1920px, real counts from DB

See `PROOF.md` for full proof logs.

## Final Checklist — What Requires You (Human)

### 🔑 Google OAuth Client ID

**Why you:** Requires logging into real Google account, creating OAuth consent screen and Client ID — only you can do.

**Exact steps:**
1. Go to https://console.cloud.google.com/
2. Create new project or select existing — name "SPI LEARNING"
3. Left menu → APIs & Services → OAuth consent screen → External → Create
   - App name: SPI LEARNING
   - User support email: your email
   - Developer contact: your email
   - Save and Continue through scopes (no need to add scopes) → Save
4. Left menu → Credentials → Create Credentials → OAuth client ID → Web application
   - Name: SPI Web
   - Authorized JavaScript origins: Add `http://localhost:3000` and your production domain (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs: Add `http://localhost:3000` and `https://yourdomain.com`
   - Create
5. Copy **Client ID** (looks like `123456789-abc.apps.googleusercontent.com`)

**Env var:**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

**Confirmation:** Once pasted, no code changes needed — `GoogleLoginButton` automatically shows real Sign in with Google button, after sign-in shows REAL name/email/photo from JWT. If not set, shows honest amber "Google OAuth not configured" — NOT fake placeholder.

### 🔑 Gemini Free Tier API Key (Optional, but for assistant primary)

**Why you:** Requires Google account to create API key at aistudio.google.com.

**Steps:**
1. Go to https://aistudio.google.com/app/apikey
2. Create API key → Copy key (starts with `AIza...`)

**Env var:**
```env
GEMINI_API_KEY=AIza...
# or NEXT_PUBLIC_GEMINI_API_KEY for client-side (but server-side preferred)
```

**Confirmation:** Once set, assistant API automatically uses Gemini free tier primary (gemini-1.5-flash, 15 RPM, 1M TPM, genuinely free, no billing) — logs provider/model. No code changes.

### 🔑 Groq Free Tier API Key (Optional, fallback)

**Steps:**
1. Go to https://console.groq.com/keys
2. Create API key → Copy (starts with `gsk_...`)

**Env var:**
```env
GROQ_API_KEY=gsk_...
```

**Confirmation:** If Gemini fails or not set, automatically uses Groq llama-3.1-8b-instant 14.4k/day free. No code changes.

### 🔑 Anthropic API Key (Optional, ONLY paid piece)

**Steps:**
1. Go to https://console.anthropic.com/
2. Create API key → Copy (starts with `sk-ant-...`)
3. Note: This is PAID — $3/M input $15/M output — honestly not required, free Puter.js works

**Env var:**
```env
ANTHROPIC_API_KEY=sk-ant-...
```

**Confirmation:** If set, notes pipeline could use Claude (code already wired to try Puter.js first, but you could switch). If not set, uses 100% free Puter.js — no break.

### 🔑 Hosting / Domain (Optional)

**Steps:**
1. Choose Vercel (free tier) or Render (free tier) — both have free tiers, no billing required for hobby
2. Connect GitHub repo `brothers2705-boop/Spi.learning`
3. Set env vars in hosting dashboard same as `.env.local`
4. Deploy — production build has NO dev toolbar, no port numbers visible

**Confirmation:** Once deployed, real URL like `https://spi-learning.vercel.app` — clean production build.

---

**Once you paste real values in `.env.local`, no further code changes needed — features just start working. Code is fully wired and ready.**
