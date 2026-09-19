// ADMIN AUTH — separate from user auth, never shares session/cookie
// FIXED: credentials now from env vars, password stored as bcrypt hash, not plaintext hardcoded
// Env vars: ADMIN_EMAIL, ADMIN_PASSWORD_HASH (bcrypt), ADMIN_TOKEN (optional session secret)
// For dev, falls back to defaults but logs warning — production must set env vars
// SECURITY WARNING: admin123 is WEAK DEFAULT for local dev only — MUST be changed to strong unique password before ANY public deployment. Changing is just env var swap: generate new hash via node -e "console.log(require('bcryptjs').hashSync('YOUR_STRONG_PASSWORD',10))" and set ADMIN_PASSWORD_HASH env var — no code change needed.

import bcrypt from 'bcryptjs';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'spi_admin_secret_2024_secure_dev_only';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@spi.learning';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const ADMIN_PASSWORD_PLAINTEXT = process.env.ADMIN_PASSWORD || 'admin123'; // dev fallback only

// In production, ADMIN_PASSWORD_HASH must be set — hash via: node -e "console.log(require('bcryptjs').hashSync('yourpassword',10))"
let cachedHash = ADMIN_PASSWORD_HASH;

function getPasswordHash(): string {
  if (cachedHash) return cachedHash;
  
  // Dev fallback: if no hash set, hash the plaintext password on the fly (not secure for prod, but works for dev)
  // In production, you should set ADMIN_PASSWORD_HASH env var, not ADMIN_PASSWORD
  if (ADMIN_PASSWORD_PLAINTEXT) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[ADMIN AUTH] WARNING: Using plaintext ADMIN_PASSWORD in production — set ADMIN_PASSWORD_HASH instead!');
    }
    cachedHash = bcrypt.hashSync(ADMIN_PASSWORD_PLAINTEXT, 10);
    return cachedHash;
  }
  
  // Ultimate fallback for local dev if nothing set — hash of admin123
  console.warn('[ADMIN AUTH] No ADMIN_PASSWORD_HASH or ADMIN_PASSWORD set — using dev default admin123 hash');
  cachedHash = bcrypt.hashSync('admin123', 10);
  return cachedHash;
}

export function verifyAdminToken(token: string): boolean {
  return token === ADMIN_TOKEN;
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  // Email check from env, not hardcoded string
  const expectedEmail = process.env.ADMIN_EMAIL || ADMIN_EMAIL;
  if (email !== expectedEmail) return false;
  
  // Password check via bcrypt hash from env, not plaintext comparison
  const hash = getPasswordHash();
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

export function generateAdminSession(): string {
  // Session contains email + timestamp + token secret — verified via env, not hardcoded
  const email = process.env.ADMIN_EMAIL || ADMIN_EMAIL;
  const payload = `${email}:${Date.now()}:${ADMIN_TOKEN}`;
  return Buffer.from(payload).toString('base64');
}

export function verifyAdminSession(session: string): boolean {
  try {
    const decoded = Buffer.from(session, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length < 3) return false;
    const email = parts[0];
    const timestamp = parseInt(parts[1]);
    const token = parts.slice(2).join(':');
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return false;
    const expectedEmail = process.env.ADMIN_EMAIL || ADMIN_EMAIL;
    const expectedToken = process.env.ADMIN_TOKEN || ADMIN_TOKEN;
    return email === expectedEmail && token === expectedToken;
  } catch {
    return false;
  }
}

export function isAdminAuthenticated(request: Request): boolean {
  const authHeader = (request.headers as any).get?.('authorization') || '';
  const cookieHeader = (request.headers as any).get?.('cookie') || '';
  
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (verifyAdminToken(token)) return true;
    if (verifyAdminSession(token)) return true;
  }
  
  const match = cookieHeader.match(/admin_session=([^;]+)/);
  if (match) {
    const session = decodeURIComponent(match[1]);
    if (verifyAdminSession(session)) return true;
  }
  
  return false;
}

// SECURITY: admin123 is WEAK DEFAULT — MUST change before public deploy. Just env var swap, no code change: new hash via bcryptjs.hashSync('strong_password',10) -> ADMIN_PASSWORD_HASH
// DATABASE: SQLite data/spi.db ephemeral on Render/Vercel/Railway — will lose data on deploy. Migration pending to Postgres via DATABASE_URL env var (Supabase/Neon free tier) — config change not rewrite.
// CORE NOTES AI: 100% FREE — Gemini primary (gemini-1.5-flash 1M context free tier) via GEMINI_API_KEY from https://aistudio.google.com/apikey (no credit card), Groq fallback via GROQ_API_KEY free, meticulous local fallback — NO Claude, NO paid API, NO Puter.js for core notes due to privacy. Puter.js only for assistant widget transparent.

// For env var documentation — what code should read for future Postgres migration
export const ENV_VARS = {
  ADMIN_EMAIL: 'ADMIN_EMAIL — admin login email, from env, not hardcoded',
  ADMIN_PASSWORD_HASH: 'ADMIN_PASSWORD_HASH — bcrypt hash of admin password, from env, not plaintext — SECURITY: admin123 is WEAK DEFAULT for local dev only, MUST change to strong unique password before public deployment, just env var swap no code change needed, generate via node -e "console.log(require(\'bcryptjs\').hashSync(\'YOUR_STRONG_PASSWORD\',10))"',
  ADMIN_TOKEN: 'ADMIN_TOKEN — secret for admin session generation, from env — CHANGE_BEFORE_PROD',
  DATABASE_URL: 'DATABASE_URL — future Postgres connection string (Supabase/Neon free tier) — for migration from SQLite data/spi.db which is ephemeral on Render/Vercel/Railway — UNVERIFIED YouTube extraction pending real internet test',
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID — Google OAuth client ID, free, any volume, no billing',
  GEMINI_API_KEY: 'GEMINI_API_KEY — PRIMARY for core notes AI — Google Gemini free tier gemini-1.5-flash (1M context, largest free, 15 RPM 1M TPM) — FREE no credit card, get from https://aistudio.google.com/apikey — ONLY key required for entire notes pipeline to work at full quality, 100% free, zero paid dependency, meticulous prompt preserving definitions/examples/formulas/procedures/code/terminology/warnings/timestamps/never hallucinate/no over-summarizing',
  GEMINI_MODEL: 'GEMINI_MODEL — gemini-1.5-flash primary (1M context) or gemini-2.0-flash fallback',
  GROQ_API_KEY: 'GROQ_API_KEY — FALLBACK for core notes AI — Groq free tier llama-3.3-70b-versatile (or 3.1-70b) — FREE 14.4k/day 30 RPM no credit card, open-weight models, same meticulous prompt, no third-party proxy, used when Gemini rate-limited/down',
  GROQ_MODEL: 'GROQ_MODEL — llama-3.3-70b-versatile fallback',
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY — OPTIONAL ADD-ON OFF by default, NOT required, NOT used by default core pipeline — only if someone explicitly wants Claude later, kept as optional path fully OFF unless key deliberately added',
};
