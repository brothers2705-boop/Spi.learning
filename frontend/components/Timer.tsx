'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { storage } from '@/lib/storage';

type TimerMode = 'study' | 'break' | 'longBreak';

export function Timer({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<TimerMode>('study');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [task, setTask] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stats = storage.getStudyStats();
    setSessions(stats.totalSessions || 0);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'study') {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        storage.updateStudyStats(s => ({ ...s, totalSessions: newSessions, totalFocusMinutes: (s.totalFocusMinutes||0)+25 }));
        if (newSessions % 4 === 0) { setMode('longBreak'); setTimeLeft(15*60); }
        else { setMode('break'); setTimeLeft(5*60); }
      } else {
        setMode('study'); setTimeLeft(25*60);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft, mode, sessions]);

  const toggle = () => setIsRunning(!isRunning);
  const reset = () => { setIsRunning(false); setTimeLeft(mode === 'study' ? 25*60 : mode === 'break' ? 5*60 : 15*60); };
  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(newMode === 'study' ? 25*60 : newMode === 'break' ? 5*60 : 15*60);
    setIsRunning(false);
  };
  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const totalProgress = (( (mode==='study'?25*60:mode==='break'?5*60:15*60) - timeLeft) / (mode==='study'?25*60:mode==='break'?5*60:15*60)) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-[#fcfcf9]/80 backdrop-blur-[12px] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] border border-zinc-200 w-full max-w-[360px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-[48px] px-4 flex items-center justify-between border-b border-zinc-100">
          <span className="text-[13px] font-[600]">Focus Timer</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
        </div>

        <div className="p-6">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What are you focusing on?"
            className="w-full h-9 px-3 rounded-full bg-white border border-zinc-200 text-[13px] outline-none focus:border-zinc-900 placeholder:text-zinc-400 mb-6"
          />

          <div className="flex gap-1 bg-zinc-100 rounded-full p-1 mb-8">
            {[
              { id: 'study', label: 'Focus' },
              { id: 'break', label: 'Break' },
              { id: 'longBreak', label: 'Long Break' },
            ].map((m) => (
              <button key={m.id} onClick={() => switchMode(m.id as TimerMode)} className={`flex-1 h-7 rounded-full text-[12px] font-[600] ${mode === m.id ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>
                {m.label}
              </button>
            ))}
          </div>

          <div className="relative w-[200px] h-[200px] mx-auto mb-8">
            <svg className="w-full h-full -rotate-90">
              <circle cx="100" cy="100" r="88" fill="none" stroke="#f4f4f5" strokeWidth="4" />
              <circle
                cx="100" cy="100" r="88" fill="none" stroke="#18181b"
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - totalProgress / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-[44px] tracking-[-0.03em] leading-none">{formatTime(timeLeft)}</div>
              <div className="text-[11px] font-mono text-zinc-500 mt-1 uppercase">{mode === 'study' ? 'Deep work' : mode === 'break' ? 'Rest' : 'Long rest'}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button onClick={reset} className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={toggle} className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black">
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>
            <button onClick={() => { setTimeLeft(mode === 'study' ? 25*60 : mode === 'break' ? 5*60 : 15*60); setIsRunning(false); }} className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 text-[11px] font-[600]">
              Skip
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-8">
            <div className="rounded-[10px] bg-zinc-50 border border-zinc-100 p-3 text-center">
              <div className="font-display text-[18px] leading-none">{sessions}</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">Sessions</div>
            </div>
            <div className="rounded-[10px] bg-zinc-50 border border-zinc-100 p-3 text-center">
              <div className="font-display text-[18px] leading-none">{Math.floor(sessions * 25 / 60)}h</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">Focused</div>
            </div>
            <div className="rounded-[10px] bg-zinc-50 border border-zinc-100 p-3 text-center">
              <div className="text-[14px]">{mode === 'study' ? 'S' : 'B'}</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">{mode}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
