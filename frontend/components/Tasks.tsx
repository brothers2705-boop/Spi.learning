'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, ListTodo, Clock, BookOpen, Calendar, Tag, X, Search } from 'lucide-react';
import { userStorage } from '@/lib/user';
import { storage, SavedNote } from '@/lib/storage';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  category: string;
  course: string;
  estimatedHours: number;
  dueDate?: string;
  tags: string[];
}

const CATEGORIES = [
  { id: 'study', label: 'Study' },
  { id: 'assignment', label: 'Assignment' },
  { id: 'review', label: 'Review' },
  { id: 'project', label: 'Project' },
  { id: 'exam', label: 'Exam' },
  { id: 'other', label: 'Other' },
] as const;

const PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Med' },
  { id: 'high', label: 'High' },
  { id: 'urgent', label: 'Urgent' },
] as const;

const STATUSES = [
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
  { id: 'blocked', label: 'Blocked' },
] as const;

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageKey, setStorageKey] = useState('spi_tasks_default');

  const [form, setForm] = useState<Partial<Task>>({
    title: '', description: '', priority: 'medium', category: 'study', course: '', estimatedHours: 1, dueDate: '', tags: [], status: 'todo'
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const user = userStorage.getCurrentUser();
    const keys = userStorage.getUserDataKeys(user?.id || 'default');
    setStorageKey(keys.tasks);
    try {
      const saved = localStorage.getItem(keys.tasks);
      if (saved) {
        const parsed = JSON.parse(saved);
        const migrated = parsed.map((t: any) => ({
          id: t.id, title: t.title, description: t.description || '', completed: t.completed || false,
          status: t.status || (t.completed ? 'done' : 'todo'), priority: t.priority || 'medium',
          createdAt: t.createdAt, updatedAt: t.updatedAt, completedAt: t.completedAt,
          category: t.category || 'study', course: t.course || '', estimatedHours: t.estimatedHours || 1,
          dueDate: t.dueDate, tags: t.tags || [],
        }));
        setTasks(migrated);
      } else {
        const oldSaved = localStorage.getItem('spi_tasks');
        if (oldSaved) {
          const parsed = JSON.parse(oldSaved);
          const migrated = parsed.map((t: any) => ({
            id: t.id, title: t.title, description: '', completed: t.completed || false, status: t.completed ? 'done' : 'todo',
            priority: t.priority || 'medium', createdAt: t.createdAt, category: t.category || 'study', course: '', estimatedHours: 1, tags: [],
          }));
          setTasks(migrated);
          localStorage.setItem(keys.tasks, JSON.stringify(migrated));
        } else {
          setTasks([
            { id: '1', title: 'Watch MIT Algorithms - Sorting', description: 'Complete lecture 3, take transcript notes', completed: false, status: 'todo', priority: 'high', createdAt: new Date().toISOString(), category: 'study', course: 'MIT 6.006 Algorithms', estimatedHours: 2.5, dueDate: new Date(Date.now() + 2*86400000).toISOString().split('T')[0], tags: ['algorithms'] },
          ]);
        }
      }
    } catch { setTasks([]); }
    try { setNotes(storage.getNotes()); } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, loaded, storageKey]);

  const resetForm = () => {
    setForm({ title: '', description: '', priority: 'medium', category: 'study', course: '', estimatedHours: 1, dueDate: '', tags: [], status: 'todo' });
    setTagInput(''); setEditingTask(null); setShowAdd(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...form, title: form.title!.trim(), updatedAt: new Date().toISOString(), completed: form.status === 'done', completedAt: form.status === 'done' ? new Date().toISOString() : undefined } as Task : t));
    } else {
      const task: Task = {
        id: Date.now().toString(), title: form.title!.trim(), description: form.description || '', completed: false,
        status: (form.status as any) || 'todo', priority: (form.priority as any) || 'medium',
        createdAt: new Date().toISOString(), category: (form.category as any) || 'study',
        course: form.course || '', estimatedHours: form.estimatedHours || 1, dueDate: form.dueDate, tags: form.tags || [],
      };
      setTasks([task, ...tasks]);
    }
    resetForm();
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t;
      const newCompleted = !t.completed;
      return { ...t, completed: newCompleted, status: newCompleted ? 'done' : 'todo', completedAt: newCompleted ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() };
    }));
  };

  const updateStatus = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status, completed: status === 'done', completedAt: status === 'done' ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active' && (t.completed || t.status === 'done')) return false;
    if (filter === 'completed' && !(t.completed || t.status === 'done')) return false;
    if (search && !`${t.title} ${t.description} ${t.course} ${t.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed || t.status === 'done').length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="rounded-[16px] border border-zinc-200 bg-white p-4">
          <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500">TOTAL TASKS</div>
          <div className="font-display text-[22px] font-[700] tracking-[-0.02em] mt-1">{tasks.length}</div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">{completedCount} done • {tasks.length - completedCount} left</div>
        </div>
        <div className="rounded-[16px] border border-zinc-200 bg-white p-4">
          <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500">HOURS</div>
          <div className="font-display text-[22px] font-[700] tracking-[-0.02em] mt-1">{totalHours}h</div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">estimated total</div>
        </div>
        <div className="rounded-[16px] border border-zinc-200 bg-white p-4">
          <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500">PROGRESS</div>
          <div className="font-display text-[22px] font-[700] tracking-[-0.02em] mt-1">{Math.round(progress)}%</div>
          <div className="h-1.5 w-full bg-zinc-100 rounded-full mt-2"><div className="h-full bg-zinc-900 rounded-full" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="rounded-[16px] bg-zinc-900 text-white p-4">
          <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-400">FOCUS TODAY</div>
          <div className="font-display text-[22px] font-[700] tracking-[-0.02em] mt-1">{tasks.filter(t => !t.completed).slice(0,3).reduce((s,t)=>s+(t.estimatedHours||0),0)}h</div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">next 3 tasks</div>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-zinc-900 flex items-center justify-center"><ListTodo className="w-4 h-4 text-white" /></div>
            <div>
              <div className="font-[700] text-[14px] tracking-[-0.01em]">Tasks</div>
              <div className="text-[11px] font-mono text-zinc-500">Hours • Course • Priority • Private</div>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="h-10 px-5 rounded-full bg-zinc-900 text-white text-[13px] font-[700] flex items-center gap-2 hover:bg-black">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>

        <div className="p-3 border-b border-zinc-100 flex flex-wrap gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-[200px] h-9 pl-9 pr-3 rounded-full bg-white border border-zinc-200 text-[13px] outline-none focus:border-zinc-900 placeholder:text-zinc-400" />
          </div>
          <div className="flex gap-1 bg-zinc-100 rounded-full p-1">
            {(['all','active','completed'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 h-7 rounded-full text-[11px] font-[700] capitalize ${filter === f ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-zinc-100 max-h-[600px] overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="font-[600] text-[14px]">No tasks</div>
              <div className="text-[12px] text-zinc-500 mt-1">Create tasks with hours, course, priority</div>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className={`p-4 hover:bg-zinc-50 ${task.completed ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${task.completed ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-300'}`}>
                    {task.completed && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`font-[600] text-[14px] leading-[1.3] ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-900'}`}>{task.title}</div>
                    {task.description && <div className="text-[12px] text-zinc-500 mt-1">{task.description}</div>}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {task.course && <span className="px-2 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-[600]">{task.course.slice(0,20)}</span>}
                      <span className="px-2 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[11px] font-[600]">{task.category}</span>
                      <span className="px-2 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-[11px] font-[600]">{task.priority}</span>
                      <span className="px-2 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-[11px] font-[600]">{task.estimatedHours}h</span>
                      {task.dueDate && <span className="px-2 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-[11px] font-[600]">{task.dueDate}</span>}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {STATUSES.map(s => (
                        <button key={s.id} onClick={() => updateStatus(task.id, s.id as any)} className={`px-2.5 h-6 rounded-full text-[10px] font-[700] border ${task.status === s.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-500'}`}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="w-7 h-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:border-zinc-900"><Trash2 className="w-3.5 h-3.5 text-zinc-600" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-[#fcfcf9]/80 backdrop-blur-[12px] flex items-center justify-center p-4">
          <div className="w-full max-w-[480px] rounded-[16px] bg-white border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-[700] text-[16px]">{editingTask ? 'Edit Task' : 'New Task'}</div>
              <button onClick={resetForm} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="w-full h-11 px-4 rounded-full bg-white border border-zinc-200 text-[14px] outline-none focus:border-zinc-900" required />
              <input value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} placeholder="Course" className="w-full h-11 px-4 rounded-full bg-white border border-zinc-200 text-[13px] outline-none focus:border-zinc-900" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as any })} className="h-11 px-3 rounded-full bg-white border border-zinc-200 text-[13px] outline-none">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })} className="h-11 px-3 rounded-full bg-white border border-zinc-200 text-[13px] outline-none">
                  {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min={0.25} step={0.25} value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: parseFloat(e.target.value) || 1 })} className="h-11 px-3 rounded-full bg-white border border-zinc-200 text-[13px] outline-none" placeholder="Hours" />
                <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="h-11 px-3 rounded-full bg-white border border-zinc-200 text-[13px] outline-none" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={resetForm} className="flex-1 h-11 rounded-full bg-white border border-zinc-200 text-[13px] font-[600]">Cancel</button>
                <button type="submit" className="flex-1 h-11 rounded-full bg-[#7c3aed] text-white text-[13px] font-[700] hover:bg-[#6d28d9]">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
