import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'spi.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_FILE);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create jobs/notes table — single source of truth for both user and admin
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      youtubeUrl TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      userId TEXT,
      sessionId TEXT,
      duration INTEGER,
      source TEXT DEFAULT 'ai',
      modelUsed TEXT,
      wordCount INTEGER DEFAULT 0,
      readingTime INTEGER DEFAULT 0,
      transcriptSource TEXT DEFAULT 'ai_generated',
      chunkCount INTEGER DEFAULT 1,
      tokenUsage TEXT, -- JSON string
      estimatedCost REAL DEFAULT 0,
      timing TEXT, -- JSON string
      markdown TEXT,
      error TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      completedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_jobs_userId ON jobs(userId);
    CREATE INDEX IF NOT EXISTS idx_jobs_createdAt ON jobs(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
  `);

  // Migrate old jobs.json if exists and db empty
  try {
    const jobsJsonPath = path.join(DATA_DIR, 'jobs.json');
    if (fs.existsSync(jobsJsonPath)) {
      const count = (db.prepare('SELECT COUNT(*) as c FROM jobs').get() as any).c;
      if (count === 0) {
        const raw = fs.readFileSync(jobsJsonPath, 'utf-8');
        const jobs = JSON.parse(raw);
        if (Array.isArray(jobs) && jobs.length > 0) {
          const insert = db.prepare(`
            INSERT OR IGNORE INTO jobs 
            (id, youtubeUrl, title, status, userId, sessionId, duration, source, modelUsed, wordCount, readingTime, transcriptSource, chunkCount, tokenUsage, estimatedCost, timing, markdown, error, createdAt, updatedAt, completedAt)
            VALUES (@id, @youtubeUrl, @title, @status, @userId, @sessionId, @duration, @source, @modelUsed, @wordCount, @readingTime, @transcriptSource, @chunkCount, @tokenUsage, @estimatedCost, @timing, @markdown, @error, @createdAt, @updatedAt, @completedAt)
          `);
          const tx = db.transaction((jobs: any[]) => {
            for (const j of jobs) {
              try {
                insert.run({
                  id: j.id,
                  youtubeUrl: j.youtubeUrl,
                  title: j.title,
                  status: j.status,
                  userId: j.userId || null,
                  sessionId: j.sessionId || null,
                  duration: j.duration || null,
                  source: j.source || 'ai',
                  modelUsed: j.modelUsed || null,
                  wordCount: j.wordCount || 0,
                  readingTime: j.readingTime || 0,
                  transcriptSource: j.transcriptSource || 'ai_generated',
                  chunkCount: j.chunkCount || 1,
                  tokenUsage: typeof j.tokenUsage === 'string' ? j.tokenUsage : JSON.stringify(j.tokenUsage || { input: 0, output: 0, total: 0 }),
                  estimatedCost: j.estimatedCost || 0,
                  timing: typeof j.timing === 'string' ? j.timing : JSON.stringify(j.timing || {}),
                  markdown: j.markdown || null,
                  error: j.error || null,
                  createdAt: j.createdAt || new Date().toISOString(),
                  updatedAt: j.updatedAt || new Date().toISOString(),
                  completedAt: j.completedAt || null,
                });
              } catch {}
            }
          });
          tx(jobs);
          console.log(`[DB] Migrated ${jobs.length} jobs from jobs.json to SQLite`);
        }
      }
    }
  } catch (e) {
    console.warn('[DB] Migration failed', e);
  }

  return db;
}

export function getDatabase() {
  return getDb();
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Helper to parse JSON columns
export function parseJobRow(row: any) {
  if (!row) return null;
  try {
    return {
      ...row,
      tokenUsage: row.tokenUsage ? JSON.parse(row.tokenUsage) : { input: 0, output: 0, total: 0 },
      timing: row.timing ? JSON.parse(row.timing) : { fetchTitle: 0, aiGeneration: 0, total: 0 },
    };
  } catch {
    return row;
  }
}
