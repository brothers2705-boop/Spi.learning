const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export interface Job {
  id: string;
  status: 'queued' | 'extracting' | 'chunking' | 'analyzing' | 'merging' | 'generating_files' | 'completed' | 'failed';
  progress_percent: number;
  current_step: string;
  current_step_number: number;
  video_id: string;
  video_title?: string;
  duration_seconds?: number;
  language?: string;
  chunk_count: number;
  chunks_done: number;
  error_code?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  token_usage?: { input_tokens: number; output_tokens: number; cost: number; };
}
export async function createJob(youtubeUrl: string): Promise<{ job_id: string }> {
  const res = await fetch(`${API_URL}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ youtube_url: youtubeUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to create job' }));
    throw new Error(err.detail?.message || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}
export async function getJob(jobId: string): Promise<Job> {
  const res = await fetch(`${API_URL}/api/jobs/${jobId}`, { credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to get job' }));
    throw new Error(err.detail?.message || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}
export async function getNotes(jobId: string): Promise<{ markdown: string; video_title?: string; language?: string }> {
  const res = await fetch(`${API_URL}/api/jobs/${jobId}/notes`, { credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to get notes' }));
    throw new Error(err.detail?.message || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}
