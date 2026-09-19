import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getJobById, updateJob, deleteJob } from '@/lib/jobsStore';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated(request as any)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const job = getJobById(params.id);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  
  return NextResponse.json({ job });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated(request as any)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const updated = updateJob(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, job: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated(request as any)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const deleted = deleteJob(params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
