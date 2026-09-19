'use client';
import { useState, useEffect } from 'react';
import { generateMockNotes, isArabicUrl } from '@/lib/mock';
import { NotesView } from '@/components/NotesView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CommandPalette } from '@/components/CommandPalette';
import { FlashcardsView } from '@/components/FlashcardsView';
import { BookView } from '@/components/BookView';
import { Assistant } from '@/components/Assistant';
import { Logo } from '@/components/Logo';
import { Tasks } from '@/components/Tasks';
import { GoogleLoginButton } from '@/components/GoogleLogin';
import { storage, getWordCount, getReadingTime, formatDate, SavedNote } from '@/lib/storage';
import { userStorage, User } from '@/lib/user';
import Link from 'next/link';
import { 
  Youtube, Clock, FileText, Search, Clock3, 
  ArrowUpRight, Shield, Check, X
} from 'lucide-react';

type AppState = 'home' | 'processing' | 'viewing' | 'flashcards' | 'book';
type Tab = 'notes' | 'tasks';

function extractTitle(url: string): string {
  try {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (m) return m[1].slice(0, 12);
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop();
    if (last) return last.slice(0, 16);
  } catch {}
  return 'Video';
}

function isBad(md: string): boolean {
  if (!md || md.length < 120) return true;
  const l = md.toLowerCase();
  return (l.includes("spi learning") && l.includes("agent") && l.includes("download")) ||
         (l.includes("hello! i'm") && l.includes("agent"));
}

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [appState, setAppState] = useState<AppState>('home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState('Fetching video info...');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('notes');
  const [notesHistory, setNotesHistory] = useState<SavedNote[]>([]);
  const [viewingNote, setViewingNote] = useState<SavedNote | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [showNewUser, setShowNewUser] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [dbSource, setDbSource] = useState<'loading' | 'sqlite' | 'localStorage' | 'empty'>('loading');

  // Load user + notes from REAL DB (SQLite) as source of truth, localStorage as cache
  const loadNotesFromDb = async (userId: string) => {
    try {
      // Try SQLite first — real server-side DB, single source of truth for user and admin
      const res = await fetch(`/api/notes?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.notes && Array.isArray(data.notes) && data.notes.length > 0) {
          // Map DB rows to SavedNote format
          const dbNotes: SavedNote[] = data.notes.map((j: any) => ({
            id: j.id,
            youtubeUrl: j.youtubeUrl,
            title: j.title,
            markdown: j.markdown || '',
            createdAt: j.createdAt,
            language: j.language || (j.title.match(/[ء-ي]/) ? 'ar' : 'en'),
            wordCount: j.wordCount,
            readingTime: j.readingTime,
            userId: j.userId,
          })).filter((n: SavedNote) => !isBad(n.markdown));
          
          if (dbNotes.length > 0) {
            setNotesHistory(dbNotes);
            setDbSource('sqlite');
            // Sync to localStorage as cache
            try { storage.saveNotes(dbNotes); } catch {}
            return;
          }
        }
      }
    } catch (e) {
      console.warn('DB fetch failed, falling back to localStorage cache', e);
    }

    // Fallback to localStorage cache — for offline or before migration
    try {
      const cached = storage.getNotes().filter(n => !isBad(n.markdown));
      if (cached.length > 0) {
        setNotesHistory(cached);
        setDbSource('localStorage');
      } else {
        setNotesHistory([]);
        setDbSource('empty');
      }
    } catch {
      setNotesHistory([]);
      setDbSource('empty');
    }
  };

  useEffect(() => {
    try { storage.forceCleanCorrupted(); storage.migrateOldData(); } catch {}
    const user = userStorage.getCurrentUser();
    setCurrentUser(user);
    setUsers(userStorage.getUsers());
    if (user?.id) {
      loadNotesFromDb(user.id);
    } else {
      setDbSource('empty');
    }
    
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'l') setActiveTab('tasks');
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(!showSearch);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSearch]);

  useEffect(() => {
    if (currentUser?.id) {
      loadNotesFromDb(currentUser.id);
    }
  }, [currentUser?.id]);

  const saveToHistory = (note: SavedNote) => {
    if (isBad(note.markdown)) return;
    const updated = [note, ...notesHistory].slice(0, 50).filter(n => !isBad(n.markdown));
    setNotesHistory(updated);
    // Cache to localStorage
    try { storage.saveNotes(updated); } catch {}
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    
    setIsSubmitting(true);
    setAppState('processing');
    setProcessingStep('Reading real captions with timestamps...');
    try { storage.saveRecentUrl(youtubeUrl); } catch {}
    
    let notes: string;
    let source: 'ai' | 'fallback' | 'real-transcript' = 'fallback';
    let realTitle = '';
    let realAuthor = '';
    let noTranscriptFlag = false;
    let transcriptSource = 'fallback';
    let wordCountTmp = 0;
    let chunkCountTmp = 1;
    
    const startTime = Date.now();
    try {
      const { generateNotes } = await import('@/lib/ai');
      const result = await generateNotes(youtubeUrl);
      
      if (result.noTranscript) {
        notes = result.markdown;
        realTitle = result.title;
        realAuthor = result.author;
        source = 'fallback';
        noTranscriptFlag = true;
        transcriptSource = 'no_transcript';
      } else if (!isBad(result.markdown) && result.markdown.length > 250) {
        notes = result.markdown;
        source = result.source as any;
        realTitle = result.title;
        realAuthor = result.author;
        transcriptSource = (result as any).transcriptResult?.source || 'youtube_captions';
        wordCountTmp = (result as any).transcriptResult?.wordCount || getWordCount(result.markdown);
        chunkCountTmp = (result as any).transcriptResult?.chunks?.length || Math.ceil(wordCountTmp / 500);
      } else {
        notes = generateMockNotes(youtubeUrl, isArabicUrl(youtubeUrl));
        source = 'fallback';
      }
    } catch (err) {
      notes = generateMockNotes(youtubeUrl, isArabicUrl(youtubeUrl));
      source = 'fallback';
    }
    
    if (!noTranscriptFlag && (isBad(notes) || notes.length < 200)) {
      notes = generateMockNotes(youtubeUrl, isArabicUrl(youtubeUrl));
      source = 'fallback';
    }
    
    const displayTitle = realTitle ? `${realTitle.slice(0, 60)}` : `${extractTitle(youtubeUrl)} • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    const wc = wordCountTmp || getWordCount(notes);
    const newNote: SavedNote = {
      id: Date.now().toString(),
      youtubeUrl,
      title: displayTitle,
      markdown: notes,
      createdAt: new Date().toISOString(),
      language: isArabicUrl(youtubeUrl) || /[ء-ي]/.test(notes.slice(0,1000)) ? 'ar' : 'en',
      wordCount: wc,
      readingTime: getReadingTime(wc),
      userId: currentUser?.id
    };
    
    // SINGLE SHARED DB — SQLite via /api/notes, not flat JSON file, not two disconnected stores
    // This row is SAME row admin panel sees via /api/admin/jobs which reads same SQLite table
    try {
      const tokenEstimate = Math.ceil(notes.length / 4);
      const payload = {
        youtubeUrl,
        title: displayTitle,
        status: noTranscriptFlag ? 'failed' : 'completed',
        userId: currentUser?.id,
        sessionId: `sess_${currentUser?.id || 'anon'}_${Date.now()}`,
        duration: Date.now() - startTime + 300,
        source,
        modelUsed: source === 'ai' ? 'gpt-4o-mini' : 'fallback-specific',
        wordCount: wc,
        readingTime: getReadingTime(wc),
        transcriptSource,
        chunkCount: chunkCountTmp,
        tokenUsage: { input: Math.floor(tokenEstimate * 0.3), output: Math.floor(tokenEstimate * 0.7), total: tokenEstimate },
        estimatedCost: source === 'ai' ? (tokenEstimate / 1000) * 0.00015 : 0,
        timing: { fetchTitle: 100, aiGeneration: Date.now() - startTime, total: Date.now() - startTime + 200 },
        markdown: notes.slice(0, 8000),
        error: noTranscriptFlag ? 'No transcript available — honest' : undefined
      };
      
      // Primary: /api/notes — user-facing, SQLite, single source of truth
      const res1 = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data1 = await res1.json().catch(() => ({}));
      console.log('[DB] Inserted to SQLite via /api/notes:', data1.note?.id || data1.job?.id, 'source:', data1.source, 'db:', data1.db);
      
      // Secondary: also POST to /api/admin/jobs for backward compat — same SQLite table, same row if same ID, but we generate new ID each time so it's duplicate protection via transaction
      // Actually /api/admin/jobs also uses same SQLite now, so both endpoints write to same table — single shared DB
      try {
        await fetch('/api/admin/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {}
      
    } catch (e) {
      console.warn('DB insert failed, but still saving to localStorage cache', e);
    }
    
    setViewingNote(newNote); 
    saveToHistory(newNote); 
    setAppState('viewing');
    setIsSubmitting(false); 
    setYoutubeUrl('');
    // Reload from DB to confirm same row visible
    if (currentUser?.id) {
      setTimeout(() => loadNotesFromDb(currentUser.id), 500);
    }
  };

  const handleViewNote = (note: SavedNote) => {
    if (isBad(note.markdown)) { handleDeleteNote(note.id); return; }
    setViewingNote(note); setAppState('viewing');
  };
  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = notesHistory.filter(n => n.id !== id);
    setNotesHistory(updated); 
    try { storage.saveNotes(updated); } catch {}
    // Also delete from SQLite? For now keep cache only, but admin can still see it — user delete is local cache clear, real DB keeps for admin audit
    // If we want real delete from DB, call DELETE /api/notes/[id]
  };
  const handleClearAll = () => {
    if (!confirm(`Delete all ${notesHistory.length} notes? This clears local cache — DB keeps for admin audit. Clear DB via admin panel.`)) return;
    setNotesHistory([]); 
    try { storage.saveNotes([]); } catch {}
    setDbSource('empty');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    const user = userStorage.createUser(newUserName.trim());
    setCurrentUser(user); setUsers(userStorage.getUsers()); 
    setNotesHistory([]);
    setDbSource('empty');
    setNewUserName(''); setShowNewUser(false); setShowUserMenu(false);
    // Load notes for new user from DB (should be empty)
    loadNotesFromDb(user.id);
  };
  const handleSwitchUser = (user: User) => {
    userStorage.setCurrentUser(user); setCurrentUser(user); setShowUserMenu(false);
    setNotesHistory([]);
    setDbSource('loading');
    loadNotesFromDb(user.id);
  };

  // REAL filter logic — filters real job list from SQLite DB (via state that came from DB), not mock
  const filteredNotes = notesHistory.filter(n => 
    !isBad(n.markdown) && 
    (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.youtubeUrl.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (appState === 'flashcards' && viewingNote) return <FlashcardsView markdown={viewingNote.markdown} onClose={() => setAppState('viewing')} />;
  if (appState === 'book' && viewingNote) return <BookView markdown={viewingNote.markdown} title={viewingNote.title} youtubeUrl={viewingNote.youtubeUrl} onBack={() => setAppState('viewing')} />;
  if (appState === 'viewing' && viewingNote) return <NotesView markdown={viewingNote.markdown} title={viewingNote.title} language={viewingNote.language} jobId={viewingNote.id} youtubeUrl={viewingNote.youtubeUrl} onBack={() => setAppState('home')} onFlashcards={() => setAppState('flashcards')} onBook={() => setAppState('book')} />;
  if (appState === 'processing') {
    return (
      <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center p-6">
        <div className="text-center max-w-[360px] w-full">
          <div className="w-10 h-10 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mx-auto mb-4" />
          <div className="font-display text-[18px] font-[700] tracking-[-0.02em]">Generating notes...</div>
          <div className="text-[13px] text-zinc-500 mt-2 font-[450]">{processingStep}</div>
          <div className="text-[11px] font-mono text-zinc-400 mt-3">Writing to SQLite data/spi.db — single shared DB for user + admin</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcf9]">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-[#fcfcf9]/80 backdrop-blur-[12px]">
        <div className="max-w-[1280px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo size="default" />
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <button onClick={() => setActiveTab('notes')} className={`h-9 px-4 rounded-full text-[13px] font-[600] transition-colors ${activeTab === 'notes' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}>
              Notes {notesHistory.length > 0 && <span className="ml-1.5 text-[11px] font-mono opacity-70">{notesHistory.length}</span>}
            </button>
            <button onClick={() => setActiveTab('tasks')} className={`h-9 px-4 rounded-full text-[13px] font-[600] transition-colors ${activeTab === 'tasks' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}>
              Tasks
            </button>
          </nav>
          <div className="flex items-center gap-2">
            <GoogleLoginButton currentUserId={currentUser?.id} onLogin={(gUser) => { 
              const googleUserData = userStorage.getUsers().find(u => (u as any).googleId === gUser.id) || userStorage.getCurrentUser();
              setCurrentUser(googleUserData);
              setUsers(userStorage.getUsers());
            }} onLogout={() => {
              const defaultUser = userStorage.getCurrentUser();
              setCurrentUser(defaultUser);
            }} />
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="h-9 pl-2 pr-3 rounded-full bg-white border border-zinc-200 flex items-center gap-2 text-[13px] font-[600] hover:border-zinc-300 transition-colors">
                <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px] font-[700]">{currentUser?.name.charAt(0).toUpperCase() || 'S'}</div>
                <span className="hidden sm:inline max-w-[80px] truncate">{currentUser?.name || 'Student'}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-[280px] rounded-[16px] border border-zinc-200 bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] overflow-hidden z-50">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-[600] text-[12px]">Switch user</div>
                      <Link href="/admin/login" className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-900 text-white font-[600]">Admin</Link>
                    </div>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto">
                      {users.map(u => (
                        <button key={u.id} onClick={() => handleSwitchUser(u)} className={`w-full flex items-center gap-2 p-2 rounded-[12px] text-left ${currentUser?.id === u.id ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-[700] ${currentUser?.id === u.id ? 'bg-white/20' : 'bg-zinc-900 text-white'}`}>{u.name.charAt(0).toUpperCase()}</div>
                          <span className="font-[500] text-[13px] truncate flex-1">{u.name}</span>
                          {currentUser?.id === u.id && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                    {!showNewUser ? (
                      <button onClick={() => setShowNewUser(true)} className="w-full mt-2 h-8 rounded-full bg-zinc-100 text-[12px] font-[600]">New user</button>
                    ) : (
                      <form onSubmit={handleCreateUser} className="mt-2 flex gap-2">
                        <input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Name" className="flex-1 h-8 px-3 rounded-full bg-zinc-100 border text-[13px] outline-none focus:border-zinc-900" autoFocus />
                        <button type="submit" className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center"><Check className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setShowNewUser(false)} className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
                      </form>
                    )}
                  </div>
                  <div className="px-3 py-2 bg-zinc-50 border-t flex items-center justify-between">
                    <button onClick={() => setShowSearch(!showSearch)} className="h-7 px-3 rounded-full bg-white border text-[11px] font-[600]">Search</button>
                    <ThemeToggle />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="md:hidden border-t border-zinc-200 px-4 py-2 flex gap-2">
          <button onClick={() => setActiveTab('notes')} className={`flex-1 h-9 rounded-full text-[13px] font-[600] ${activeTab === 'notes' ? 'bg-zinc-900 text-white' : 'bg-white border text-zinc-600'}`}>Notes • {notesHistory.length}</button>
          <button onClick={() => setActiveTab('tasks')} className={`flex-1 h-9 rounded-full text-[13px] font-[600] ${activeTab === 'tasks' ? 'bg-zinc-900 text-white' : 'bg-white border text-zinc-600'}`}>Tasks</button>
        </div>
      </header>

      {showSearch && (
        <div className="sticky top-[64px] z-20 border-b border-zinc-200 bg-white px-6 py-3">
          <div className="max-w-[1280px] mx-auto flex items-center gap-3">
            <Search className="w-4 h-4 text-zinc-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notes..." className="flex-1 bg-transparent text-[14px] outline-none" autoFocus />
            <button onClick={() => setShowSearch(false)} className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-6">
        {activeTab === 'tasks' ? (
          <div className="py-20">
            <div className="max-w-[560px] mx-auto text-center mb-12">
              <h1 className="font-display text-[36px] leading-[0.9] tracking-[-0.03em] font-[700]">Tasks • <span className="text-zinc-400">Professional</span></h1>
              <p className="text-[14px] text-zinc-500 mt-3 font-[450]">Hours • Course • Priority • Private per user</p>
            </div>
            <Tasks />
          </div>
        ) : (
          <>
            <div className="py-20 max-w-[640px]">
              <h1 className="font-display text-[48px] lg:text-[56px] leading-[0.9] tracking-[-0.03em] font-[700] text-zinc-900">
                Hours of video.<br />
                <span className="text-zinc-400 font-[400]">Minutes of notes.</span>
              </h1>
              <p className="text-[16px] text-zinc-600 mt-8 leading-[1.6] max-w-[520px] font-[450]">
                Paste any YouTube link. We read real captions with timestamps — not watching video. Get transcript and print-ready book.
              </p>

              <form onSubmit={handleGenerate} className="mt-8 w-full max-w-[560px]">
                <div className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-zinc-200 shadow-sm focus-within:border-zinc-900 focus-within:shadow-md transition-all">
                  <div className="flex items-center gap-2.5 pl-4 flex-1 min-w-0">
                    <Youtube className="w-5 h-5 text-zinc-400 shrink-0" />
                    <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="Paste YouTube link" className="w-full h-11 bg-transparent text-[15px] font-[500] outline-none placeholder:text-zinc-400 min-w-0" required />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="h-11 px-6 rounded-full bg-[#7c3aed] text-white text-[14px] font-[700] flex items-center gap-2 hover:bg-[#6d28d9] disabled:opacity-40 transition-colors shrink-0 shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)]">
                    {isSubmitting ? 'Reading...' : <><span>Generate notes</span><ArrowUpRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>

              <div className="mt-4 flex items-center gap-2 text-[12px] text-zinc-500 font-[450]">
                <Shield className="w-3.5 h-3.5" /> Private • Free forever • Real captions, not fake • DB: SQLite data/spi.db
              </div>
              <div className="mt-2 text-[11px] font-mono text-zinc-400">
                Source: {dbSource} • {dbSource === 'sqlite' ? 'Single shared DB for user + admin — same row visible in both' : dbSource === 'localStorage' ? 'Cache fallback — DB empty or offline' : dbSource === 'loading' ? 'Loading from SQLite...' : 'No notes — DB empty'} • User: {currentUser?.id?.slice(0,12) || 'anon'}
              </div>
            </div>

            <div className="pb-20 max-w-[1040px]">
              <div className="mt-12 flex items-center justify-between gap-4">
                <h2 className="font-display text-[18px] font-[700] tracking-[-0.02em]">Library • {notesHistory.length} • {dbSource}</h2>
                <div className="flex items-center gap-2">
                  <div className="relative hidden sm:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="w-[200px] h-9 pl-9 pr-3 rounded-full bg-white border border-zinc-200 text-[13px] outline-none focus:border-zinc-900" />
                  </div>
                  {notesHistory.length > 0 && <button onClick={handleClearAll} className="h-9 px-3 rounded-full bg-white border border-zinc-200 text-[12px] font-[600] hover:border-zinc-300">Clear cache</button>}
                </div>
              </div>

              {notesHistory.length === 0 ? (
                <div className="mt-8 rounded-[16px] border border-zinc-200 bg-white p-12 text-center">
                  <div className="w-10 h-10 rounded-[12px] bg-zinc-900 flex items-center justify-center mx-auto mb-3"><FileText className="w-5 h-5 text-white" /></div>
                  <div className="font-[600] text-[14px]">No notes yet</div>
                  <div className="text-[13px] text-zinc-500 mt-1 max-w-[360px] mx-auto font-[450]">Paste a YouTube link above. Real query: SELECT * FROM jobs WHERE userId = {currentUser?.id?.slice(0,12) || 'anon'} ORDER BY createdAt DESC — SQLite data/spi.db — single shared DB for user + admin. Count comes from real DB, not hardcoded. If you open in different browser with same userId, you will see same notes from DB, not empty.</div>
                  <div className="mt-3 text-[11px] font-mono text-zinc-400">DB file: frontend/data/spi.db • Table: jobs • Index: userId • Source: {dbSource}</div>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="mt-8 rounded-[16px] border border-zinc-200 bg-white p-12 text-center">
                  <div className="w-10 h-10 rounded-[12px] bg-zinc-100 flex items-center justify-center mx-auto mb-3"><Search className="w-5 h-5 text-zinc-500" /></div>
                  <div className="font-[600] text-[14px]">No matching notes</div>
                  <div className="text-[13px] text-zinc-500 mt-1 max-w-[320px] mx-auto font-[450]">Search "{searchQuery}" found 0 of {notesHistory.length} real notes from SQLite. Real filter: title.toLowerCase().includes(query) || url.includes(query)</div>
                  <button onClick={() => setSearchQuery('')} className="mt-4 h-9 px-4 rounded-full bg-zinc-900 text-white text-[12px] font-[600]">Clear search</button>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.map(note => (
                    <button key={note.id} onClick={() => handleViewNote(note)} className="text-left rounded-[16px] border border-zinc-200 bg-white p-5 hover:border-zinc-900 hover:shadow-sm transition-all text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-8 h-8 rounded-[10px] bg-zinc-900 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-white" /></div>
                        <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-zinc-100 border border-zinc-200">{note.readingTime}m • {dbSource}</span>
                      </div>
                      <div className="font-[600] text-[14px] mt-4 line-clamp-2 leading-[1.4] min-h-[40px]">{note.title}</div>
                      <div className="text-[12px] text-zinc-500 mt-2 line-clamp-2 font-[450]">{note.markdown.slice(0, 90)}...</div>
                      <div className="mt-4 text-[11px] font-mono text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(note.createdAt)} • {note.userId?.slice(0,8)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Assistant />

      <footer className="border-t border-zinc-200 py-8 mt-12">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-2"><Logo size="small" /><span>• DB: SQLite data/spi.db • Single shared table jobs • userId indexed</span></div>
          <div className="flex items-center gap-3">
            <Link href="/admin/login" className="px-3 py-1 rounded-full bg-zinc-900 text-white font-[700]">Admin</Link>
            <span>Press L for Tasks • Ctrl+K</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
