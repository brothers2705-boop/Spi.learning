import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getJobById, updateJob } from '@/lib/jobsStore';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated(request as any)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const job = getJobById(params.id);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  
  if (job.status === 'completed' || job.status === 'cancelled') {
    return NextResponse.json({ error: `Job already ${job.status}` }, { status: 400 });
  }
  
  const updated = updateJob(params.id, {
    status: 'cancelled',
    error: 'Cancelled by admin',
    completedAt: new Date().toISOString()
  });
  
  return NextResponse.json({ success: true, message: 'Job cancelled', job: updated });
}
