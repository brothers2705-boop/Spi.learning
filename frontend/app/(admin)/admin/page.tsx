'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { LogOut, RefreshCw, FileText, Clock, AlertTriangle, CheckCircle, XCircle, BarChart3, Download, Play, StopCircle, Eye, Calendar, Search, Timer, DollarSign, Layers } from 'lucide-react';

interface Job {
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
  tokenUsage: { input: number; output: number; total: number };
  estimatedCost: number;
  timing: { fetchTitle: number; aiGeneration: number; total: number };
  modelUsed?: string;
  source: string;
  wordCount: number;
  readingTime: number;
  markdown?: string;
}

interface Stats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  cancelled: number;
  today: number;
  successRate: number;
  failureRate: number;
  avgDuration: number;
  avgDurationSeconds: number;
  totalTokens: number;
  totalCost: number;
  jobsPerDay: { date: string; count: number; completed: number; failed: number }[];
}

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      if (!res.ok) {
        router.push('/admin/login');
        return false;
      }
      return true;
    } catch {
      router.push('/admin/login');
      return false;
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    const authed = await checkAuth();
    if (!authed) return;

    try {
      const [jobsRes, statsRes] = await Promise.all([
        fetch('/api/admin/jobs'),
        fetch('/api/admin/stats')
      ]);

      if (jobsRes.status === 401 || statsRes.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!jobsRes.ok) throw new Error('Failed to load jobs');
      if (!statsRes.ok) throw new Error('Failed to load stats');

      const jobsData = await jobsRes.json();
      const statsData = await statsRes.json();

      setJobs(jobsData.jobs || []);
      setStats(statsData.stats || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleRetry = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/retry`, { method: 'POST' });
      if (!res.ok) throw new Error('Retry failed');
      await loadData();
      if (selectedJob?.id === jobId) {
        const updated = await fetch(`/api/admin/jobs/${jobId}`).then(r => r.json());
        setSelectedJob(updated.job);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (jobId: string) => {
    if (!confirm('Cancel this job?')) return;
    setActionLoading(jobId);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/cancel`, { method: 'POST' });
      if (!res.ok) throw new Error('Cancel failed');
      await loadData();
      setSelectedJob(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = (job: Job) => {
    if (!job.markdown) {
      alert('No content available for download');
      return;
    }
    const blob = new Blob([job.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-${job.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredJobs = jobs.filter(job => {
    if (filter !== 'all' && job.status !== filter) return false;
    if (search && !`${job.title} ${job.youtubeUrl} ${job.id} ${job.userId || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-[13px] font-mono text-zinc-500">Loading admin dashboard... Real data from database</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] text-zinc-900">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-[#fcfcf9]/80 backdrop-blur-[12px]">
        <div className="max-w-[1400px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="small" />
            <div className="ml-2">
              <div className="font-display text-[15px] font-[700] tracking-[-0.02em] flex items-center gap-2">
                ADMIN PANEL
                <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-[700]">REAL DATA</span>
              </div>
              <div className="text-[11px] font-mono text-zinc-500">Protected API • 401/403 middleware • Separate bundle</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="h-9 px-4 rounded-full bg-white border border-zinc-200 text-[12px] font-[600] flex items-center gap-2 hover:border-zinc-900 transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={handleLogout} className="h-9 px-4 rounded-full bg-zinc-900 text-white text-[12px] font-[700] flex items-center gap-2 hover:bg-black transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-[12px] bg-white border border-zinc-200 flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-zinc-600" />
            <div>
              <div className="font-[600] text-[14px]">Error loading admin data</div>
              <div className="text-[13px] text-zinc-600 mt-1">{error}</div>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            <div className="rounded-[16px] bg-white border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-zinc-600" /><span className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500">TOTAL JOBS</span></div>
              <div className="text-[24px] font-[700] leading-none tracking-[-0.02em]">{stats.total}</div>
              <div className="text-[11px] text-zinc-500 mt-2 font-mono">{stats.today} today • {stats.pending} pending</div>
            </div>
            <div className="rounded-[16px] bg-white border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-3"><CheckCircle className="w-4 h-4 text-zinc-600" /><span className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500">SUCCESS RATE</span></div>
              <div className="text-[24px] font-[700] leading-none tracking-[-0.02em]">{stats.successRate}%</div>
              <div className="text-[11px] text-zinc-500 mt-2 font-mono">{stats.completed} completed • {stats.failed} failed</div>
            </div>
            <div className="rounded-[16px] bg-white border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-zinc-600" /><span className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500">AVG TIME</span></div>
              <div className="text-[24px] font-[700] leading-none tracking-[-0.02em]">{stats.avgDurationSeconds}s</div>
              <div className="text-[11px] text-zinc-500 mt-2 font-mono">{stats.avgDuration}ms avg</div>
            </div>
            <div className="rounded-[16px] bg-white border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-3"><Layers className="w-4 h-4 text-zinc-600" /><span className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500">TOKENS</span></div>
              <div className="text-[24px] font-[700] leading-none tracking-[-0.02em]">{(stats.totalTokens / 1000).toFixed(1)}k</div>
              <div className="text-[11px] text-zinc-500 mt-2 font-mono">${stats.totalCost.toFixed(4)} cost</div>
            </div>
            <div className="rounded-[16px] bg-zinc-900 text-white p-5">
              <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-white" /><span className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-400">JOBS/DAY</span></div>
              <div className="flex items-end gap-1 h-[32px]">
                {stats.jobsPerDay.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                    <div className="bg-white rounded-full" style={{ height: `${Math.max(4, (day.count / Math.max(1, ...stats.jobsPerDay.map(d => d.count))) * 24)}px` }} />
                    <div className="text-[8px] font-mono text-center text-zinc-500">{day.date.slice(5)}</div>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-zinc-500 mt-2 font-mono">Last 7 days</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="rounded-[16px] bg-white border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-[700] text-[14px] tracking-[-0.01em] flex items-center gap-2"><FileText className="w-4 h-4" /> All Jobs • Real Data</div>
                <div className="text-[11px] font-mono text-zinc-500 mt-1">Status, created_at, duration, user/session id, error if failed</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." className="w-[180px] h-9 pl-9 pr-3 rounded-full bg-white border border-zinc-200 text-[13px] outline-none focus:border-zinc-900 placeholder:text-zinc-400" />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value as any)} className="h-9 px-3 rounded-full bg-white border border-zinc-200 text-[12px] outline-none">
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-zinc-100 max-h-[700px] overflow-y-auto">
              {filteredJobs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-10 h-10 rounded-[10px] bg-zinc-100 flex items-center justify-center mx-auto mb-3"><FileText className="w-5 h-5 text-zinc-500" /></div>
                  <div className="font-[600] text-[14px]">No jobs yet</div>
                  <div className="text-[12px] text-zinc-500 mt-1 font-[450]">Generate notes from user site to create jobs</div>
                </div>
              ) : (
                filteredJobs.map(job => (
                  <div key={job.id} onClick={() => setSelectedJob(job)} className={`p-4 hover:bg-zinc-50 cursor-pointer transition-colors ${selectedJob?.id === job.id ? 'bg-zinc-50 border-l-2 border-l-zinc-900' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-[700] flex items-center gap-1 border ${job.status === 'completed' ? 'bg-zinc-900 text-white border-zinc-900' : job.status === 'failed' ? 'bg-white text-zinc-900 border-zinc-200' : job.status === 'processing' ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-white text-zinc-500 border-zinc-200'}`}>
                            {job.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : job.status === 'failed' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{job.status}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500 truncate">{job.id.slice(0, 20)}</span>
                        </div>
                        <div className="font-[600] text-[13px] truncate text-zinc-900">{job.title}</div>
                        <div className="text-[11px] font-mono text-zinc-500 mt-1 flex flex-wrap gap-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(job.createdAt).toLocaleString()}</span>
                          {job.duration && <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{Math.round(job.duration/1000)}s</span>}
                        </div>
                        {job.error && <div className="text-[11px] text-zinc-600 mt-1 truncate font-[450]">Error: {job.error}</div>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] font-mono text-zinc-500">{job.wordCount}w</span>
                        <Eye className="w-4 h-4 text-zinc-400" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[16px] bg-white border border-zinc-200 overflow-hidden lg:sticky lg:top-[88px] lg:h-fit">
            {selectedJob ? (
              <div>
                <div className="p-5 border-b border-zinc-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-[700] text-[13px] flex items-center gap-2 tracking-[-0.01em]"><Layers className="w-4 h-4" /> Job Detail</div>
                    <button onClick={() => setSelectedJob(null)} className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">✕</button>
                  </div>
                  <div className="font-[600] text-[13px] leading-[1.3] text-zinc-900">{selectedJob.title}</div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1 break-all">{selectedJob.youtubeUrl}</div>
                </div>

                <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[10px] bg-[#fcfcf9] border border-zinc-200 p-3">
                      <div className="text-[10px] font-mono font-[700] tracking-[0.08em] text-zinc-500">STATUS</div>
                      <div className="font-[600] text-[13px] mt-1 capitalize flex items-center gap-1.5">{selectedJob.status}</div>
                    </div>
                    <div className="rounded-[10px] bg-[#fcfcf9] border border-zinc-200 p-3">
                      <div className="text-[10px] font-mono font-[700] tracking-[0.08em] text-zinc-500">DURATION</div>
                      <div className="font-[600] text-[13px] mt-1">{selectedJob.duration ? `${Math.round(selectedJob.duration/1000)}s` : '—'}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-2">DETAILS</div>
                    <div className="space-y-2 text-[12px]">
                      <div className="flex justify-between p-2.5 rounded-[10px] bg-[#fcfcf9] border border-zinc-200"><span className="text-zinc-500">Transcript source</span><span className="font-[600] font-mono">{selectedJob.transcriptSource}</span></div>
                      <div className="flex justify-between p-2.5 rounded-[10px] bg-[#fcfcf9] border border-zinc-200"><span className="text-zinc-500">Chunk count</span><span className="font-[600]">{selectedJob.chunkCount}</span></div>
                      <div className="flex justify-between p-2.5 rounded-[10px] bg-[#fcfcf9] border border-zinc-200"><span className="text-zinc-500">Model used</span><span className="font-[600] font-mono">{selectedJob.modelUsed || '—'}</span></div>
                      <div className="flex justify-between p-2.5 rounded-[10px] bg-[#fcfcf9] border border-zinc-200"><span className="text-zinc-500">Tokens</span><span className="font-[600] font-mono">{selectedJob.tokenUsage.input}/{selectedJob.tokenUsage.output}/{selectedJob.tokenUsage.total}</span></div>
                      <div className="flex justify-between p-2.5 rounded-[10px] bg-[#fcfcf9] border border-zinc-200"><span className="text-zinc-500 flex items-center gap-1"><DollarSign className="w-3 h-3" />Cost</span><span className="font-[600]">${selectedJob.estimatedCost.toFixed(6)}</span></div>
                    </div>
                  </div>

                  {selectedJob.error && (
                    <div className="p-3 rounded-[10px] bg-zinc-50 border border-zinc-200">
                      <div className="text-[11px] font-[700] text-zinc-700 mb-1">ERROR</div>
                      <div className="text-[12px] text-zinc-600 break-words font-[450]">{selectedJob.error}</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => handleRetry(selectedJob.id)} disabled={!!actionLoading} className="flex-1 h-10 rounded-full bg-[#7c3aed] text-white text-[13px] font-[700] flex items-center justify-center gap-2 hover:bg-[#6d28d9] disabled:opacity-50 transition-colors shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)]">
                      <Play className="w-4 h-4" />{actionLoading === selectedJob.id ? 'Retrying...' : 'Retry'}
                    </button>
                    <button onClick={() => handleCancel(selectedJob.id)} disabled={!!actionLoading || selectedJob.status === 'completed' || selectedJob.status === 'cancelled'} className="flex-1 h-10 rounded-full bg-white border border-zinc-200 text-zinc-900 text-[13px] font-[600] flex items-center justify-center gap-2 hover:border-zinc-900 disabled:opacity-30 transition-colors">
                      <StopCircle className="w-4 h-4" /> Cancel
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleDownload(selectedJob)} className="flex-1 h-10 rounded-full bg-zinc-900 text-white text-[13px] font-[700] flex items-center justify-center gap-2 hover:bg-black transition-colors">
                      <Download className="w-4 h-4" /> Download MD
                    </button>
                  </div>

                  {selectedJob.markdown && (
                    <div>
                      <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-2">PREVIEW</div>
                      <div className="p-3 rounded-[10px] bg-[#fcfcf9] border border-zinc-200 text-[11px] leading-[1.5] max-h-[200px] overflow-y-auto whitespace-pre-wrap break-words font-mono">{selectedJob.markdown.slice(0, 1000)}...</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-10 h-10 rounded-[10px] bg-zinc-100 flex items-center justify-center mx-auto mb-3"><Eye className="w-5 h-5 text-zinc-500" /></div>
                <div className="font-[600] text-[14px] text-zinc-900">Select a job</div>
                <div className="text-[12px] text-zinc-500 mt-1 font-[450]">Click any job to view detail</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-200 mt-12 py-6">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2"><Logo size="small" /><span>• Admin panel • Real data • Separate bundle</span></div>
          <div>Designed by Eng. Abdelrahman Ahmed Abdullah — built with minimal AI assistance</div>
        </div>
      </footer>
    </div>
  );
}
