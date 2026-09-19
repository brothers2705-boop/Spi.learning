import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getStats } from '@/lib/jobsStore';

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request as any)) {
    return NextResponse.json({ error: 'Unauthorized — admin auth required' }, { status: 401 });
  }
  
  try {
    const stats = getStats();
    return NextResponse.json({ stats });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
