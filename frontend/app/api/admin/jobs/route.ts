import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request as any)) {
    return NextResponse.json({ error: 'Unauthorized — admin authentication required' }, { status: 401 });
  }
  
  try {
    const { getAllJobs } = await import('@/lib/jobsStore');
    const jobs = getAllJobs();
    return NextResponse.json({ jobs, total: jobs.length, source: 'sqlite-or-json-fallback' });
  } catch (e: any) {
    console.error('[ADMIN JOBS GET] failed', e);
    try {
      const fs = await import('fs');
      const path = await import('path');
      const jsonPath = path.join(process.cwd(), 'data', 'jobs.json');
      const raw = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf-8') : '[]';
      const jobs = JSON.parse(raw);
      return NextResponse.json({ jobs, total: jobs.length, source: 'json-fallback' });
    } catch {
      return NextResponse.json({ error: 'Failed to fetch jobs', details: e.message }, { status: 500 });
    }
  }
}

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
      console.error('[ADMIN JOBS POST] createJob failed, JSON fallback', inner.message?.slice(0, 500));
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
      const raw = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf-8') : '[]';
      const jobs = JSON.parse(raw);
      jobs.unshift(newJob);
      fs.writeFileSync(jsonPath, JSON.stringify(jobs.slice(0, 200), null, 2));
      job = newJob;
    }
    
    return NextResponse.json({ success: true, job });
  } catch (e: any) {
    console.error('[ADMIN JOBS POST] failed', e);
    return NextResponse.json({ error: 'Failed to create job', details: e.message }, { status: 500 });
  }
}
