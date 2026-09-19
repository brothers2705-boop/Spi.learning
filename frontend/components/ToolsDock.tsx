'use client';
import { FileText, ListTodo, Music, Calculator, Timer as TimerIcon, BookOpen, Brain, GraduationCap } from 'lucide-react';

interface ToolsDockProps {
  activeTab: 'notes' | 'music' | 'tasks';
  onTabChange: (tab: 'notes' | 'music' | 'tasks') => void;
  onCalculator: () => void;
  onTimer: () => void;
  onFlashcards: () => void;
  notesCount: number;
  currentUserName: string;
}

export function ToolsDock({ activeTab, onTabChange, onCalculator, onTimer, onFlashcards, notesCount, currentUserName }: ToolsDockProps) {
  const tools = [
    { id: 'notes', label: 'Notes', icon: FileText, shortcut: 'N', action: () => onTabChange('notes'), active: activeTab === 'notes', count: notesCount, desc: 'Transcript' },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, shortcut: 'L', action: () => onTabChange('tasks'), active: activeTab === 'tasks', desc: 'Hours • Course' },
    { id: 'music', label: 'Music', icon: Music, shortcut: 'M', action: () => onTabChange('music'), active: activeTab === 'music', desc: 'Spotify' },
    { id: 'divider1', divider: true },
    { id: 'calculator', label: 'Calculator', icon: Calculator, shortcut: 'C', action: onCalculator, desc: 'Scientific' },
    { id: 'timer', label: 'Timer', icon: TimerIcon, shortcut: 'T', action: onTimer, desc: 'Pomodoro' },
    { id: 'flashcards', label: 'Cards', icon: Brain, shortcut: 'F', action: onFlashcards, desc: 'Study' },
    { id: 'divider2', divider: true },
    { id: 'book', label: 'Books', icon: BookOpen, shortcut: 'B', action: () => onTabChange('notes'), desc: 'Books' },
  ];

  return (
    <>
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[76px] z-20 bg-[#fcfcf9] border-r border-zinc-200 flex-col items-center py-5 gap-1.5">
        <div className="w-9 h-9 rounded-[10px] bg-zinc-900 flex items-center justify-center mb-5">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>

        <div className="w-8 h-px bg-zinc-200 mb-3" />

        {tools.map((tool: any) => {
          if (tool.divider) {
            return <div key={tool.id} className="w-8 h-px bg-zinc-200 my-3" />;
          }
          const Icon = tool.icon;
          return (
            <div key={tool.id} className="relative group">
              <button
                onClick={tool.action}
                className={`w-11 h-11 rounded-[12px] flex flex-col items-center justify-center gap-1 transition-colors relative
                  ${tool.active ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200'}
                `}
              >
                <Icon className="w-5 h-5" />
                {tool.count !== undefined && tool.count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-zinc-900 text-white text-[10px] font-[700] flex items-center justify-center border-2 border-[#fcfcf9]">{tool.count > 99 ? '99+' : tool.count}</span>
                )}
              </button>
              
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 px-3 py-2 rounded-[10px] bg-zinc-900 text-white text-[12px] font-[600] whitespace-nowrap z-50 pointer-events-none">
                <span>{tool.label}</span>
                <span className="opacity-60 text-[11px]">• {tool.desc}</span>
                <span className="ml-1 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono">{tool.shortcut}</span>
              </div>
            </div>
          );
        })}

        <div className="flex-1" />

        <div className="flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center">
            <span className="text-white text-[12px] font-[700]">{currentUserName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="px-2 py-1 rounded-full bg-white border border-zinc-200 text-[10px] font-mono font-[600] text-zinc-600">{currentUserName.slice(0, 7)}</div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#fcfcf9]/95 backdrop-blur-[12px] border-t border-zinc-200 px-3 py-3">
        <div className="flex items-center justify-around gap-2 max-w-[420px] mx-auto">
          {[
            { id: 'notes', icon: FileText, label: 'Notes', action: () => onTabChange('notes'), active: activeTab === 'notes', count: notesCount },
            { id: 'tasks', icon: ListTodo, label: 'Tasks', action: () => onTabChange('tasks'), active: activeTab === 'tasks' },
            { id: 'music', icon: Music, label: 'Music', action: () => onTabChange('music'), active: activeTab === 'music' },
            { id: 'calc', icon: Calculator, label: 'Calc', action: onCalculator, active: false },
            { id: 'timer', icon: TimerIcon, label: 'Timer', action: onTimer, active: false },
          ].map((tool: any) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={tool.action}
                className={`relative flex-1 h-[52px] rounded-[12px] flex flex-col items-center justify-center gap-1 transition-colors ${tool.active ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-[700]">{tool.label}</span>
                {tool.count > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 text-white text-[9px] font-[700] flex items-center justify-center">{tool.count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function ToolsTopBar({ onCalculator, onTimer, onFlashcards, onMusic, onTasks }: { onCalculator: () => void; onTimer: () => void; onFlashcards: () => void; onMusic: () => void; onTasks: () => void }) {
  return (
    <div className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-100 border border-zinc-200">
      <button onClick={onCalculator} className="h-8 px-3.5 rounded-full bg-white border border-zinc-200 text-[12px] font-[600] flex items-center gap-1.5 hover:border-zinc-900 transition-colors">
        Calc
      </button>
      <button onClick={onTimer} className="h-8 px-3.5 rounded-full bg-white border border-zinc-200 text-[12px] font-[600] flex items-center gap-1.5 hover:border-zinc-900 transition-colors">
        Timer
      </button>
      <button onClick={onMusic} className="h-8 px-3.5 rounded-full bg-white border border-zinc-200 text-[12px] font-[600] flex items-center gap-1.5 hover:border-zinc-900 transition-colors">
        Music
      </button>
      <button onClick={onTasks} className="h-8 px-3.5 rounded-full bg-white border border-zinc-200 text-[12px] font-[600] flex items-center gap-1.5 hover:border-zinc-900 transition-colors">
        Tasks
      </button>
      <button onClick={onFlashcards} className="h-8 px-3.5 rounded-full bg-zinc-900 text-white text-[12px] font-[600] flex items-center gap-1.5 hover:bg-black transition-colors">
        Cards
      </button>
    </div>
  );
}
