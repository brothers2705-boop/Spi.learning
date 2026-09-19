'use client';
import { useEffect, useState } from 'react';
import { Search, Calculator, Clock, Music, Trash2, Command } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  desc: string;
  icon: any;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette({ 
  onCalculator, 
  onTimer, 
  onMusic,
  onClearHistory 
}: { 
  onCalculator: () => void;
  onTimer: () => void;
  onMusic: () => void;
  onClearHistory: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes('mac'));
    const handleKeyDown = (e: KeyboardEvent) => {
      // Support both Ctrl+K (Windows/Linux) and Cmd+K (Mac) + also "/" for quick access
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(v => !v);
      }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        const active = document.activeElement;
        if (!(active instanceof HTMLInputElement) && !(active instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands: CommandItem[] = [
    { id: 'calc', label: 'Open Calculator', desc: 'Scientific • Press C', icon: Calculator, action: () => { setIsOpen(false); onCalculator(); }, shortcut: 'C' },
    { id: 'timer', label: 'Open Pomodoro Timer', desc: '25/5 focus • Press T', icon: Clock, action: () => { setIsOpen(false); onTimer(); }, shortcut: 'T' },
    { id: 'music', label: 'Open Study Music', desc: 'Spotify • Press M', icon: Music, action: () => { setIsOpen(false); onMusic(); }, shortcut: 'M' },
    { id: 'clear', label: 'Clear all notes', desc: 'Delete library', icon: Trash2, action: () => { setIsOpen(false); onClearHistory(); } },
  ];

  const filtered = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="hidden md:flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
        <span className="flex items-center gap-1">
          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-white dark:bg-zinc-800 border text-[10px]">{isMac ? '⌘' : 'Ctrl'}</span>
          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-white dark:bg-zinc-800 border">K</span>
        </span>
        <span className="hidden lg:inline text-[11px]">to search</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[16px] flex items-start justify-center pt-[20vh] p-4" onClick={() => setIsOpen(false)}>
      <div className="w-full max-w-[480px] bg-white dark:bg-zinc-900 rounded-[16px] border border-zinc-200 dark:border-zinc-800 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 h-[48px] border-b border-zinc-100 dark:border-zinc-800">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, notes, tools..."
            className="flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-zinc-400"
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border">ESC</span>
        </div>
        <div className="p-2 max-h-[320px] overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-zinc-500">No results for "{query}"</div>
          ) : (
            filtered.map((cmd) => (
              <button key={cmd.id} onClick={cmd.action} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors group">
                <div className="w-8 h-8 rounded-[8px] bg-zinc-100 dark:bg-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-700 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center transition-colors"><cmd.icon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[13px]">{cmd.label}</div>
                  <div className="text-[11px] text-zinc-500">{cmd.desc}</div>
                </div>
                {cmd.shortcut && <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">{cmd.shortcut}</span>}
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="hidden md:inline">Press</span> 
            <span className="font-mono px-1 py-0.5 rounded bg-white dark:bg-zinc-800 border text-[10px]">{shortcutLabel}</span>
            <span className="hidden md:inline">or</span>
            <span className="font-mono px-1 py-0.5 rounded bg-white dark:bg-zinc-800 border text-[10px]">/</span>
          </span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-zinc-900" /> {isMac ? 'Mac & Windows' : 'Windows & Mac'} supported</span>
        </div>
      </div>
    </div>
  );
}
