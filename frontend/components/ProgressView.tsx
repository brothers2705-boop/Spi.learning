'use client';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Job } from '@/lib/api';

const STEPS = [
  'Validating URL',
  'Detecting video',
  'Extracting transcript',
  'Processing sections',
  'Analyzing content',
  'Merging notes',
  'Creating document',
  'Generating DOCX',
  'Generating PDF',
  'Complete'
];

export function ProgressView({ job }: { job: Job }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = new Date(job.created_at).getTime();
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [job.created_at]);

  return (
    <div className="rounded-[16px] border border-zinc-200 bg-white overflow-hidden">
      <div className="p-6 border-b border-zinc-200">
        <div className="flex items-center justify-between mb-6">
          <div className="text-[11px] font-mono font-[700] tracking-[0.12em] text-zinc-500">PROCESSING</div>
          <div className="text-[11px] font-mono text-zinc-500">
            {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')} • {job.progress_percent}%
          </div>
        </div>
        <div className="h-[2px] w-full bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-900 transition-all duration-700" style={{ width: `${job.progress_percent}%` }} />
        </div>
        <div className="mt-8">
          <div className="font-display text-[18px] font-[700] tracking-[-0.02em] text-zinc-900">{job.current_step}</div>
          <div className="text-[13px] text-zinc-500 mt-2 font-[450] leading-[1.4]">
            {job.video_title} • {job.chunk_count ? `${job.chunks_done}/${job.chunk_count} sections` : 'Analyzing'}
          </div>
        </div>
      </div>
      <div className="p-3">
        {STEPS.map((name, i) => {
          const num = i + 1;
          const done = job.current_step_number > num;
          const active = job.current_step_number === num;
          return (
            <div
              key={num}
              className={`flex items-center gap-3 px-4 h-[48px] rounded-[10px] transition-colors ${
                active
                  ? 'bg-zinc-900 text-white'
                  : done
                    ? 'text-zinc-900'
                    : 'text-zinc-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-[8px] flex items-center justify-center text-[11px] font-[700] shrink-0 ${
                  done
                    ? 'bg-zinc-900 text-white'
                    : active
                      ? 'bg-white text-zinc-900'
                      : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : active ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : num}
              </div>
              <div className="text-[13px] font-[500] tracking-[-0.01em]">{name}</div>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
