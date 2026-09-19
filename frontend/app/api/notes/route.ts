import { NextRequest, NextResponse } from 'next/server';

// GET /api/notes?userId=xxx — user library, real DB query by user_id, not localStorage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ notes: [], total: 0, source: 'sqlite', message: 'No userId provided' });
    }

    // Dynamic import to avoid crash when better-sqlite3 bindings missing
    const { getJobsByUserId } = await import('@/lib/jobsStore');
    const jobs = getJobsByUserId(userId);
    const notes = jobs.map(j => ({
      id: j.id,
      youtubeUrl: j.youtubeUrl,
      title: j.title,
      markdown: j.markdown || '',
      createdAt: j.createdAt,
      language: j.title.match(/[ء-ي]/) ? 'ar' : 'en',
      wordCount: j.wordCount,
      readingTime: j.readingTime,
      userId: j.userId,
      status: j.status,
      transcriptSource: j.transcriptSource,
      chunkCount: j.chunkCount,
    }));

    return NextResponse.json({ notes, total: notes.length, source: 'sqlite-or-json', db: 'data/spi.db or data/jobs.json' });
  } catch (e: any) {
    console.error('[API NOTES GET] failed', e);
    // Fallback to direct JSON read
    try {
      const fs = await import('fs');
      const path = await import('path');
      const jsonPath = path.join(process.cwd(), 'data', 'jobs.json');
      const raw = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf-8') : '[]';
      const jobs = JSON.parse(raw);
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');
      const filtered = userId ? jobs.filter((j: any) => j.userId === userId) : jobs;
      const notes = filtered.map((j: any) => ({
        id: j.id,
        youtubeUrl: j.youtubeUrl,
        title: j.title,
        markdown: j.markdown || '',
        createdAt: j.createdAt,
        language: j.title.match(/[ء-ي]/) ? 'ar' : 'en',
        wordCount: j.wordCount,
        readingTime: j.readingTime,
        userId: j.userId,
        status: j.status,
        transcriptSource: j.transcriptSource,
        chunkCount: j.chunkCount,
      }));
      return NextResponse.json({ notes, total: notes.length, source: 'json-fallback', db: 'data/jobs.json' });
    } catch {
      return NextResponse.json({ error: 'Failed to fetch notes', details: e.message }, { status: 500 });
    }
  }
}

// POST /api/notes — create note, single shared DB for user and admin — with JSON fallback when better-sqlite3 bindings missing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeUrl, title, userId, sessionId, status, duration, source, modelUsed, wordCount, readingTime, error, transcriptSource, chunkCount, tokenUsage, estimatedCost, timing, markdown } = body;
    
    if (!youtubeUrl) {
      return NextResponse.json({ error: 'youtubeUrl required' }, { status: 400 });
    }
    
    let job;
    try {
      const { createJob } = await import('@/lib/jobsStore');
      job = createJob({
        youtubeUrl,
        title: title || 'Untitled',
        status: status || 'completed',
        userId,
        sessionId,
        duration,
        source: source || 'ai',
        modelUsed,
        wordCount: wordCount || 0,
        readingTime: readingTime || 0,
        error,
        transcriptSource: transcriptSource || 'ai_generated',
        chunkCount: chunkCount || 1,
        tokenUsage: tokenUsage || { input: 0, output: 0, total: 0 },
        estimatedCost: estimatedCost || 0,
        timing: timing || { fetchTitle: 0, aiGeneration: 0, total: duration || 0 },
        markdown
      });
    } catch (inner: any) {
      console.error('[API NOTES] createJob failed, trying direct JSON fallback', inner.message?.slice(0, 500), inner.stack?.slice(0, 500));
      // Direct JSON fallback if createJob fails due to bindings
      const fs = await import('fs');
      const path = await import('path');
      const jsonPath = path.join(process.cwd(), 'data', 'jobs.json');
      const now = new Date().toISOString();
      const newJob: any = {
        id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        youtubeUrl,
        title: title || 'Untitled',
        status: status || 'completed',
        userId: userId || null,
        sessionId: sessionId || null,
        duration: duration || null,
        source: source || 'ai',
        modelUsed: modelUsed || null,
        wordCount: wordCount || 0,
        readingTime: readingTime || 0,
        transcriptSource: transcriptSource || 'ai_generated',
        chunkCount: chunkCount || 1,
        tokenUsage: tokenUsage || { input: 0, output: 0, total: 0 },
        estimatedCost: estimatedCost || 0,
        timing: timing || { fetchTitle: 0, aiGeneration: 0, total: 0 },
        markdown: markdown || null,
        error: error || null,
        createdAt: now,
        updatedAt: now,
        completedAt: now,
      };
      try {
        const raw = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf-8') : '[]';
        const jobs = JSON.parse(raw);
        jobs.unshift(newJob);
        const trimmed = jobs.slice(0, 200);
        fs.writeFileSync(jsonPath, JSON.stringify(trimmed, null, 2));
        job = newJob;
      } catch (e2: any) {
        console.error('[API NOTES] JSON fallback also failed', e2.message);
        throw inner;
      }
    }
    
    return NextResponse.json({ success: true, note: job, job, source: 'sqlite-or-json-fallback', db: 'data/spi.db or data/jobs.json', message: 'Single shared DB for user and admin — JSON fallback when better-sqlite3 bindings missing due to node-gyp network block' });
  } catch (e: any) {
    console.error('[API NOTES] POST failed', e);
    return NextResponse.json({ error: 'Failed to create note', details: e.message, stack: e.stack?.slice(0, 1000) }, { status: 500 });
  }
}
