import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getAllJobs, createJob } from '@/lib/jobsStore';

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request as any)) {
    return NextResponse.json({ error: 'Unauthorized — admin authentication required' }, { status: 401 });
  }
  
  try {
    const jobs = getAllJobs();
    return NextResponse.json({ jobs, total: jobs.length });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // This endpoint is used by user site to create jobs — allow without admin auth but with validation
  // For admin panel, we also allow admin to create jobs manually
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
    
    return NextResponse.json({ success: true, job });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
