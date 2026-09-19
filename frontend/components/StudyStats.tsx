'use client';
import { useEffect, useState } from 'react';
import { FileText, Clock, Zap, TrendingUp } from 'lucide-react';
import { storage, getWordCount } from '@/lib/storage';

export function StudyStats() {
  const [stats, setStats] = useState({ totalNotes: 0, totalWords: 0, totalSessions: 0, totalFocusMinutes: 0 });

  useEffect(() => {
    const notes = storage.getNotes();
    const studyStats = storage.getStudyStats();
    const totalWords = notes.reduce((acc, n) => acc + getWordCount(n.markdown), 0);
    setStats({
      totalNotes: notes.length,
      totalWords,
      totalSessions: studyStats.totalSessions || 0,
      totalFocusMinutes: studyStats.totalFocusMinutes || 0,
    });
  }, []);

  if (stats.totalNotes === 0 && stats.totalSessions === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[14px] p-4">
        <div className="w-7 h-7 rounded-[8px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2.5"><FileText className="w-3.5 h-3.5" /></div>
        <div className="font-display text-[20px] leading-none">{stats.totalNotes}</div>
        <div className="text-[11px] text-zinc-500 font-medium mt-1">Notes created</div>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[14px] p-4">
        <div className="w-7 h-7 rounded-[8px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2.5"><Zap className="w-3.5 h-3.5" /></div>
        <div className="font-display text-[20px] leading-none">{stats.totalWords.toLocaleString()}</div>
        <div className="text-[11px] text-zinc-500 font-medium mt-1">Words generated</div>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[14px] p-4">
        <div className="w-7 h-7 rounded-[8px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2.5"><Clock className="w-3.5 h-3.5" /></div>
        <div className="font-display text-[20px] leading-none">{stats.totalFocusMinutes}m</div>
        <div className="text-[11px] text-zinc-500 font-medium mt-1">Focus time</div>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[14px] p-4">
        <div className="w-7 h-7 rounded-[8px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2.5"><TrendingUp className="w-3.5 h-3.5" /></div>
        <div className="font-display text-[20px] leading-none">{Math.floor(stats.totalWords / 200)}m</div>
        <div className="text-[11px] text-zinc-500 font-medium mt-1">Reading time saved</div>
      </div>
    </div>
  );
}
