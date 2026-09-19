// JOBS STORE — now SQLite, single source of truth for both user and admin
// Previously flat JSON file data/jobs.json — now real SQLite data/spi.db with transaction safety
// Fallback to JSON when better-sqlite3 bindings missing (dev workaround for node-gyp network block)

import { getDatabase, parseJobRow } from './db';
import fs from 'fs';
import path from 'path';

const JSON_FALLBACK_PATH = path.join(process.cwd(), 'data', 'jobs.json');

let jsonFallbackForced = false;

function isJsonFallback(): boolean {
  if (jsonFallbackForced) return true;
  try {
    const TestDB = require('better-sqlite3');
    const test = new TestDB(':memory:');
    test.close();
    return false;
  } catch (e) {
    jsonFallbackForced = true;
    console.warn('[JOBS STORE] Using JSON fallback — better-sqlite3 bindings missing or failed:', (e as any).message?.slice(0, 300));
    return true;
  }
}

function readJsonJobs(): any[] {
  try {
    if (!fs.existsSync(JSON_FALLBACK_PATH)) return [];
    const raw = fs.readFileSync(JSON_FALLBACK_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch { return []; }
}

function writeJsonJobs(jobs: any[]) {
  try {
    const dir = path.dirname(JSON_FALLBACK_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(JSON_FALLBACK_PATH, JSON.stringify(jobs, null, 2));
  } catch {}
}

export interface Job {
  id: string;
  youtubeUrl: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  duration?: number;
  userId?: string;
  sessionId?: string;
  error?: string;
  transcriptSource: string;
  chunkCount: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  estimatedCost: number;
  timing: {
    fetchTitle: number;
    aiGeneration: number;
    total: number;
  };
  modelUsed?: string;
  source: string;
  wordCount: number;
  readingTime: number;
  markdown?: string;
}

export function getAllJobs(): Job[] {
  if (isJsonFallback()) {
    try {
      const jobs = readJsonJobs();
      return jobs.slice(0, 200).map(parseJobRow) as Job[];
    } catch { return []; }
  }
  try {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM jobs ORDER BY createdAt DESC LIMIT 200').all();
    return rows.map(parseJobRow) as Job[];
  } catch {
    return [];
  }
}

export function getJobsByUserId(userId: string): Job[] {
  if (isJsonFallback()) {
    try {
      const jobs = readJsonJobs();
      return jobs.filter((j: any) => j.userId === userId).slice(0, 100).map(parseJobRow) as Job[];
    } catch { return []; }
  }
  try {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM jobs WHERE userId = ? ORDER BY createdAt DESC LIMIT 100').all(userId);
    return rows.map(parseJobRow) as Job[];
  } catch {
    return [];
  }
}

export function getJobById(id: string): Job | null {
  if (isJsonFallback()) {
    try {
      const jobs = readJsonJobs();
      const found = jobs.find((j: any) => j.id === id);
      return found ? (parseJobRow(found) as Job) : null;
    } catch { return null; }
  }
  try {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    return row ? (parseJobRow(row) as Job) : null;
  } catch {
    return null;
  }
}

export function createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Job {
  if (isJsonFallback()) {
    const now = new Date().toISOString();
    const newJob: any = {
      id: job.id || `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      youtubeUrl: job.youtubeUrl,
      title: job.title,
      status: job.status,
      userId: job.userId || null,
      sessionId: job.sessionId || null,
      duration: job.duration || null,
      source: job.source || 'ai',
      modelUsed: job.modelUsed || null,
      wordCount: job.wordCount || 0,
      readingTime: job.readingTime || 0,
      transcriptSource: job.transcriptSource || 'ai_generated',
      chunkCount: job.chunkCount || 1,
      tokenUsage: job.tokenUsage || { input: 0, output: 0, total: 0 },
      estimatedCost: job.estimatedCost || 0,
      timing: job.timing || { fetchTitle: 0, aiGeneration: 0, total: 0 },
      markdown: job.markdown || null,
      error: job.error || null,
      createdAt: now,
      updatedAt: now,
      completedAt: (job as any).completedAt || (job.status === 'completed' ? now : null),
    };
    const jobs = readJsonJobs();
    jobs.unshift(newJob);
    const trimmed = jobs.slice(0, 200);
    writeJsonJobs(trimmed);
    return parseJobRow(newJob) as Job;
  }

  const db = getDatabase();
  const now = new Date().toISOString();
  const newJob: any = {
    id: job.id || `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    youtubeUrl: job.youtubeUrl,
    title: job.title,
    status: job.status,
    userId: job.userId || null,
    sessionId: job.sessionId || null,
    duration: job.duration || null,
    source: job.source || 'ai',
    modelUsed: job.modelUsed || null,
    wordCount: job.wordCount || 0,
    readingTime: job.readingTime || 0,
    transcriptSource: job.transcriptSource || 'ai_generated',
    chunkCount: job.chunkCount || 1,
    tokenUsage: JSON.stringify(job.tokenUsage || { input: 0, output: 0, total: 0 }),
    estimatedCost: job.estimatedCost || 0,
    timing: JSON.stringify(job.timing || { fetchTitle: 0, aiGeneration: 0, total: 0 }),
    markdown: job.markdown || null,
    error: job.error || null,
    createdAt: now,
    updatedAt: now,
    completedAt: (job as any).completedAt || (job.status === 'completed' ? now : null),
  };

  db.prepare(`
    INSERT INTO jobs 
    (id, youtubeUrl, title, status, userId, sessionId, duration, source, modelUsed, wordCount, readingTime, transcriptSource, chunkCount, tokenUsage, estimatedCost, timing, markdown, error, createdAt, updatedAt, completedAt)
    VALUES (@id, @youtubeUrl, @title, @status, @userId, @sessionId, @duration, @source, @modelUsed, @wordCount, @readingTime, @transcriptSource, @chunkCount, @tokenUsage, @estimatedCost, @timing, @markdown, @error, @createdAt, @updatedAt, @completedAt)
  `).run(newJob);

  // Keep only last 200 jobs globally to prevent unbounded growth
  try {
    db.prepare(`DELETE FROM jobs WHERE id NOT IN (SELECT id FROM jobs ORDER BY createdAt DESC LIMIT 200)`).run();
  } catch {}

  return parseJobRow(newJob) as Job;
}

export function updateJob(id: string, updates: Partial<Job>): Job | null {
  if (isJsonFallback()) {
    try {
      const jobs = readJsonJobs();
      const idx = jobs.findIndex((j: any) => j.id === id);
      if (idx === -1) return null;
      const now = new Date().toISOString();
      jobs[idx] = { ...jobs[idx], ...updates, updatedAt: now, completedAt: (updates.status === 'completed' || updates.status === 'failed') ? now : jobs[idx].completedAt };
      writeJsonJobs(jobs);
      return parseJobRow(jobs[idx]) as Job;
    } catch { return null; }
  }
  try {
    const db = getDatabase();
    const existing = getJobById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const fields: string[] = [];
    const params: any = { id };

    if (updates.status !== undefined) { fields.push('status = @status'); params.status = updates.status; }
    if (updates.title !== undefined) { fields.push('title = @title'); params.title = updates.title; }
    if (updates.error !== undefined) { fields.push('error = @error'); params.error = updates.error; }
    if (updates.duration !== undefined) { fields.push('duration = @duration'); params.duration = updates.duration; }
    if (updates.markdown !== undefined) { fields.push('markdown = @markdown'); params.markdown = updates.markdown; }
    if (updates.wordCount !== undefined) { fields.push('wordCount = @wordCount'); params.wordCount = updates.wordCount; }
    if (updates.readingTime !== undefined) { fields.push('readingTime = @readingTime'); params.readingTime = updates.readingTime; }
    fields.push('updatedAt = @updatedAt');
    params.updatedAt = now;

    if (updates.status === 'completed' || updates.status === 'failed') {
      fields.push('completedAt = @completedAt');
      params.completedAt = now;
    }

    if (fields.length === 1) return existing; // only updatedAt

    db.prepare(`UPDATE jobs SET ${fields.join(', ')} WHERE id = @id`).run(params);
    return getJobById(id);
  } catch {
    return null;
  }
}

export function deleteJob(id: string): boolean {
  if (isJsonFallback()) {
    try {
      const jobs = readJsonJobs();
      const filtered = jobs.filter((j: any) => j.id !== id);
      if (filtered.length === jobs.length) return false;
      writeJsonJobs(filtered);
      return true;
    } catch { return false; }
  }
  try {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
    return result.changes > 0;
  } catch {
    return false;
  }
}

export function getStats() {
  const jobs = getAllJobs();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const todayJobs = jobs.filter(j => new Date(j.createdAt) >= today);
  const completed = jobs.filter(j => j.status === 'completed');
  const failed = jobs.filter(j => j.status === 'failed');
  const pending = jobs.filter(j => j.status === 'pending' || j.status === 'processing');
  
  const totalDuration = completed.reduce((sum, j) => sum + (j.duration || 0), 0);
  const avgDuration = completed.length > 0 ? totalDuration / completed.length : 0;
  
  const successRate = jobs.length > 0 ? (completed.length / jobs.length) * 100 : 0;
  const failureRate = jobs.length > 0 ? (failed.length / jobs.length) * 100 : 0;
  
  const jobsPerDay: { date: string; count: number; completed: number; failed: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const dayJobs = jobs.filter(j => {
      const d = new Date(j.createdAt);
      return d >= dayStart && d < dayEnd;
    });
    jobsPerDay.push({
      date: dateStr,
      count: dayJobs.length,
      completed: dayJobs.filter(j => j.status === 'completed').length,
      failed: dayJobs.filter(j => j.status === 'failed').length
    });
  }
  
  return {
    total: jobs.length,
    completed: completed.length,
    failed: failed.length,
    pending: pending.length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length,
    today: todayJobs.length,
    successRate: Math.round(successRate * 10) / 10,
    failureRate: Math.round(failureRate * 10) / 10,
    avgDuration: Math.round(avgDuration),
    avgDurationSeconds: Math.round(avgDuration / 1000),
    totalTokens: jobs.reduce((sum, j) => sum + (j.tokenUsage?.total || 0), 0),
    totalCost: jobs.reduce((sum, j) => sum + (j.estimatedCost || 0), 0),
    jobsPerDay
  };
}
