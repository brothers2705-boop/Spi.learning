import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getJobById, updateJob } from '@/lib/jobsStore';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated(request as any)) {
    return NextResponse.json({ error: 'Unauthorized — admin auth required' }, { status: 401 });
  }
  
  const job = getJobById(params.id);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  
  if (job.status === 'processing' || job.status === 'pending') {
    return NextResponse.json({ error: 'Job already in progress' }, { status: 400 });
  }
  
  // Retry: set to pending, clear error, update timestamp
  const updated = updateJob(params.id, {
    status: 'pending',
    error: undefined,
    updatedAt: new Date().toISOString()
  });
  
  // In real implementation, trigger actual retry logic here
  // For now, simulate retry by setting to processing then completed after delay
  setTimeout(() => {
    updateJob(params.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      duration: Math.floor(Math.random() * 5000) + 2000,
      error: undefined
    });
  }, 2000);
  
  return NextResponse.json({ success: true, message: 'Job retry initiated', job: updated });
}
