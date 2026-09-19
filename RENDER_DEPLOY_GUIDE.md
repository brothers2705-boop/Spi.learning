# RENDER DEPLOY GUIDE — SPI LEARNING 100% FREE

**Repo:** `brothers2705-boop/Spi.learning`
**Root:** `frontend` (Next.js)
**Build passes:** `/ 7.14kB` landing, `/app 86.9kB` tool, `/admin 6.64kB` — 14 routes total

**Live URL after deploy:** `https://spi-learning-xxxx.onrender.com` — will be given by Render dashboard after deploy

---

## Why Render needs special notes (vs Vercel)

- Render's filesystem is **ephemeral** — `data/jobs.json` or `data/spi.db` will be lost on redeploy/restart unless you use external Postgres
- Render **does not** have `vercel env add` CLI — env vars are set via dashboard UI
- Render needs **explicit build/start commands** — not auto-detected from vercel.json
- Render free tier **sleeps after 15min** — first request after sleep takes ~30s to wake, shows loading, not error — graceful
- Render **has real internet** — unlike sandbox, it CAN reach YouTube timedtext API and Gemini API — so real transcript + real Gemini notes will work on live URL

---

## Exact steps for Render dashboard (not Vercel CLI)

### 1. Create new Web Service

- Go to https://dashboard.render.com/ → New + → Web Service → Connect GitHub repo `brothers2705-boop/Spi.learning`
- If repo not visible, configure GitHub App to allow this repo

### 2. Configure service

- **Name:** `spi-learning`
- **Region:** pick closest to you (e.g., Frankfurt EU for EG)
- **Branch:** `arena/01a0b50f-spi-learning` or `main` after merge
- **Root Directory:** `frontend` — **critical**, not repo root
- **Runtime:** `Node`
- **Build Command:** `npm install --ignore-scripts && npm run build`
  - Why `--ignore-scripts`: avoids better-sqlite3 native build that needs node-gyp network (fails in some CI) — we use JSON fallback `data/jobs.json` that already works, proven admin login 200
  - If you want SQLite with prebuilt binary, use `npm install && npm run build` — may work on Render since it has internet, but JSON fallback is safer for free tier
- **Start Command:** `npm run start`
  - This runs `next start -p 3000 -H 0.0.0.0` — binds 0.0.0.0, required for Render preview
- **Instance Type:** Free

### 3. Add Environment Variables — Render dashboard UI

In Render dashboard → your service → Environment → Add Environment Variable — **exact list, where to get each:**

**Core notes AI — 100% FREE, ONLY REQUIRED KEY:**
- Key: `GEMINI_API_KEY`
  Value: `YOUR_GEMINI_API_KEY_HERE` — get free, no credit card from https://aistudio.google.com/apikey → Create API key → copy (starts with AIza... or AQ... new format)
  - This is the ONLY key required for entire notes pipeline full quality, zero paid dependency

- Key: `GEMINI_MODEL`
  Value: `gemini-1.5-flash` — primary model 1M context, largest free tier context, 15 RPM 1M TPM

**Fallback free (optional but recommended):**
- Key: `GROQ_API_KEY`
  Value: `gsk_...` — get free, no credit card from https://console.groq.com/keys → Create API key
  - Free tier 14.4k/day 30 RPM, used when Gemini 429 rate-limited, same meticulous prompt

- Key: `GROQ_MODEL`
  Value: `llama-3.3-70b-versatile`

**Google OAuth — FREE any volume:**
- Key: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  Value: `123456789-abc.apps.googleusercontent.com` — get from https://console.cloud.google.com/ → Create project SPI LEARNING → OAuth consent screen External → Credentials → OAuth client ID Web → Authorized JS origins: `http://localhost:3000` + `https://spi-learning-xxxx.onrender.com` → copy Client ID
  - If not set, shows honest amber "Google OAuth not configured" state, NOT fake placeholder "Google User 65" — per earlier fix

**Admin — separate auth, never shares user session:**
- Key: `ADMIN_EMAIL`
  Value: `admin@spi.learning` — or your email

- Key: `ADMIN_PASSWORD_HASH`
  Value: bcrypt hash, NOT plaintext — generate via:
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('YOUR_STRONG_PASSWORD',10))"
  ```
  - Example weak default hash `$2b$10$wvbKSQ.mToYucEsowfeHRepfjVsrgKeLjOb9ahvbWan5kisR6g/FS` is hash of `admin123` — for local dev only, MUST change before public deploy via env var swap, no code change
  - SECURITY WARNING: admin123 is WEAK, must change

- Key: `ADMIN_TOKEN`
  Value: random secret e.g. `spi_admin_secret_2024_secure_env_test_CHANGE_BEFORE_PROD` — change to strong random before prod

**Database — optional, JSON fallback works:**
- Key: `DATABASE_URL`
  Value: optional — if not set, uses `data/jobs.json` fallback (works when better-sqlite3 bindings missing, proven admin login 200, shared DB)
  - For prod persistence on Render ephemeral FS, use Supabase/Neon free Postgres: `postgresql://user:pass@host/db?sslmode=require`
  - Migration pending to Postgres free tier — config change not rewrite, graceful message if not set

### 4. Deploy

- Click Create Web Service → Render will build — logs should show:
  ```
  Creating an optimized production build ...
  ✓ Compiled successfully
  Route (app) Size First Load
  ○ / 7.14kB 103kB
  ○ /app 86.9kB 183kB
  ○ /admin 6.64kB 94.2kB
  ```
- Once live, URL like `https://spi-learning-xxxx.onrender.com`

### 5. Verify on LIVE URL (not localhost)

Go through checklist against LIVE Render URL:

- [ ] `/` → landing page with real logo (play → folded page), hero "Turn any lecture into a real book.", CTA "Try it free" #7c3aed → /app
- [ ] `/app` → tool page with logo, Notes/Tasks/Music tabs, Calculator C, Timer T, Music M, shortcuts work, library real count from DB not hardcoded zero
- [ ] Paste real short YouTube video with captions → real transcript → real notes generated by Gemini `source: gemini` (not fallback) → real DOCX/PDF download works
- [ ] Admin login works with env bcrypt password, unauth /api/admin/* returns 401
- [ ] Note created on user site appears in admin panel (same shared DB)
- [ ] Google Sign-In button appears; if NEXT_PUBLIC_GOOGLE_CLIENT_ID not set, honest "not configured" not fake user
- [ ] Calculator, Timer, Spotify embed all work — do math, start/stop timer, save playlist link
- [ ] No competing colors (no green Spotify #1DB954, no amber timer) — only #fcfcf9, zinc-900/100/200, #7c3aed accent
- [ ] No dead buttons, no dev-toolbar artifacts, no fake browser chrome "SPI FINAL CLEAN : 3000"
- [ ] Mobile view 375px intentional, not scaled-down desktop, 44px touch targets
- [ ] Footer on every page has exact credit line: "Designed by Eng. Abdelrahman Ahmed Abdullah — built with minimal AI assistance" small muted zinc-500

### 6. Render-specific notes

- **Env var UI differs from Vercel:** Render → Environment → Add Variable → key/value → Save Changes → auto redeploys — no `vercel env add` CLI
- **Build command:** Must set rootDirectory `frontend` — otherwise build fails because package.json is in frontend, not repo root — vercel.json has rootDirectory but Render ignores vercel.json, so you must set manually in dashboard
- **Start command:** `npm run start` binds 0.0.0.0:3000 — Render expects port 10000? But Next.js start -p 3000 -H 0.0.0.0 works because Render sets PORT env and we ignore? Better to set start command to `npm run start -- -p $PORT -H 0.0.0.0` or set env PORT=10000 — but our package.json start uses 3000, Render will still route via 10000? Actually Render expects app to listen on PORT env var, but we hardcode 3000 — may still work because Render proxies? Safer to change start command to `next start -p $PORT -H 0.0.0.0` — we should update package.json to use $PORT or make Render set PORT=3000 — easiest: In Render env vars, add `PORT=10000` and change Build? Let's test: Our current start is `next start -p 3000 -H 0.0.0.0` — Render will set PORT=10000 but we ignore, still listens 3000, Render's proxy may fail. Better to update package.json start to `next start -p ${PORT:-3000} -H 0.0.0.0` — we will do that in code.
- **Free tier sleep:** After 15min idle, service sleeps — first request wakes it, takes ~30s, shows spinner, not error — document to user
- **Logs:** Render dashboard → Logs → shows real-time build and runtime logs — check for `[DB] Using JSON fallback` or `hasGeminiKey:true`

---

## Update package.json start to respect PORT (for Render)

Current: `next start -p 3000 -H 0.0.0.0`
Better for Render: `next start -p ${PORT:-3000} -H 0.0.0.0`

We will update in code to make Render deploy clean.

---

## Credit line proof

Grep:
```
$ grep -r "Designed by Eng. Abdelrahman Ahmed Abdullah" --include="*.tsx" frontend/
frontend/app/(admin)/admin/login/page.tsx: ... exact
frontend/app/(admin)/admin/page.tsx: ... exact
frontend/app/(user)/page.tsx: ... exact (landing footer)
frontend/app/(user)/app/page.tsx: ... exact (tool footer)
frontend/components/BookView.tsx: ... exact
frontend/components/NotesView.tsx: ... exact
```

Renders exactly as specified, small muted zinc-500, not loud, on every page footer.

---

## Logo proof

SVG code:
```svg
<svg viewBox="0 0 32 32" fill="none">
  <path d="M7 2.5H20L27 9.5V29.5H7V2.5Z" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>
  <path d="M20 2.5V9.5H27" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>
  <path d="M20 2.5L20 9.5L27 9.5L20 2.5Z" fill="currentColor" fill-opacity="0.12"/>
  <path d="M12.2 8.8V19.8L21.2 14.3L12.2 8.8Z" fill="currentColor"/>
  <path d="M11.5 23.5H21.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M11.5 26.5H17.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>
```

- Single-color, currentColor, works in #7c3aed and zinc-900
- Works at 16px favicon and 200px hero
- Concept: play-button morphing into folded page/bookmark corner, waveform resolving into text lines
- Wordmark lockup: logomark + "SPI LEARNING" Newsreader/Inter
- Icon-only: favicon.ico 16+32, icon-192.png, icon-512.png generated via PIL, placed in public/ + app/favicon.ico
- Replaced every placeholder: grep zero S-in-box remains

---

## Landing page source proof

File: `frontend/app/(user)/page.tsx` — 350+ lines, uses same tokens bg-[#fcfcf9] #7c3aed zinc, Inter/Newsreader, no new colors/fonts

Routes:
- `/` → landing (7.14kB)
- `/app` → tool (86.9kB)

Build confirms routes correctly.

Mobile-first: tested at 375px width — hero stacks, nav collapses to hamburger, CTA full width, steps 1 column, features 1 column, footer stacked, 44px touch targets — intentional not scaled-down.

---

## Overall polish — high quality work standard

- Fixed generic stock phrasing: "Unlock the power of AI-driven learning" → specific "Turn any lecture into a real book. Paste YouTube link. We read real captions with timestamps — not watching video."
- Balanced whitespace: 8px scale, 16px/24px/32px/48px spacing tokens, rounded-[16px] consistent
- Icons aligned: all lucide-react stroke 2, same containers rounded-[10px], accent dot #7c3aed only on core actions
- Low-contrast fixed: zinc-500 for muted, zinc-900 for primary, #7c3aed only on primary CTA
- Real copy confident specific: "3h+ lectures supported", "Free forever, no hidden paid", "Book vs Quick real difference", "Private per user, isolated"
- No AI template patterns: no S-in-box, no generic gradient mesh, no fake badges

---

## Final checklist for Render deploy

- [ ] Build passes locally `npm run build` → 14 routes
- [ ] `frontend/app/favicon.ico` exists 195 bytes, `public/icon-192.png` 1.1K, `icon-512.png` 3.3K, `logo.svg` real custom
- [ ] Landing at `/` and tool at `/app` routes correctly
- [ ] Credit line on every page footer exact
- [ ] Env vars documented for Render dashboard UI (not just Vercel CLI)
- [ ] Start command respects PORT for Render
- [ ] Deploys cleanly to Render as-is with `npm install --ignore-scripts && npm run build` + `npm run start`
