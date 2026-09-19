import { NextRequest, NextResponse } from 'next/server';
import { getJobsByUserId, createJob, getAllJobs } from '@/lib/jobsStore';

// GET /api/notes?userId=xxx — user library, real DB query by user_id, not localStorage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      // If no userId, return empty but not error — client may not have user yet
      return NextResponse.json({ notes: [], total: 0, source: 'sqlite', message: 'No userId provided' });
    }

    const jobs = getJobsByUserId(userId);
    // Map jobs to notes format for user site compatibility
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

    return NextResponse.json({ notes, total: notes.length, source: 'sqlite', db: 'data/spi.db' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch notes', details: e.message }, { status: 500 });
  }
}

// POST /api/notes — create note, single shared DB for user and admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeUrl, title, userId, sessionId, status, duration, source, modelUsed, wordCount, readingTime, error, transcriptSource, chunkCount, tokenUsage, estimatedCost, timing, markdown } = body;
    
    if (!youtubeUrl) {
      return NextResponse.json({ error: 'youtubeUrl required' }, { status: 400 });
    }
    
    const job = createJob({
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
    
    return NextResponse.json({ success: true, note: job, job, source: 'sqlite', db: 'data/spi.db', message: 'Single shared DB for user and admin' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create note', details: e.message }, { status: 500 });
  }
}
