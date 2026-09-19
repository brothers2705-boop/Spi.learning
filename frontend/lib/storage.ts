'use client';
import { userStorage } from './user';

export interface SavedNote {
  id: string;
  youtubeUrl: string;
  title: string;
  markdown: string;
  createdAt: string;
  language: string;
  wordCount?: number;
  readingTime?: number;
  userId?: string;
}

function getCurrentUserId(): string {
  if (typeof window === 'undefined') return 'default';
  const user = userStorage.getCurrentUser();
  return user?.id || 'default';
}

function getKeys() {
  const userId = getCurrentUserId();
  return userStorage.getUserDataKeys(userId);
}

function isCorruptedNote(markdown: string): boolean {
  if (!markdown) return true;
  const lower = markdown.toLowerCase();
  // Detect  welcome bug described by user: "Back Flashcards EN 45 words Hello! I'm SPI LEARNING  Download MD Copy all"
  const hasWelcome = lower.includes("i'm spi learning ai agent") || 
                     lower.includes("hello! i'm") && lower.includes("ai agent") ||
                     lower.includes("i'm your study assistant") ||
                     (lower.includes("download md") && lower.includes("copy all") && markdown.length < 800) ||
                     (lower.includes("i'm here to help") && markdown.length < 500);
  return hasWelcome;
}

function cleanNotes(notes: SavedNote[]): SavedNote[] {
  return notes.filter(n => {
    if (!n.markdown || n.markdown.length < 100) return false;
    if (isCorruptedNote(n.markdown)) return false;
    return true;
  });
}

export const storage = {
  getNotes: (): SavedNote[] => {
    if (typeof window === 'undefined') return [];
    try {
      const keys = getKeys();
      const data = localStorage.getItem(keys.notes);
      const parsed = data ? JSON.parse(data) : [];
      const cleaned = cleanNotes(parsed);
      // If we cleaned some, save back
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(keys.notes, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch { return []; }
  },
  
  saveNotes: (notes: SavedNote[]) => {
    try {
      const keys = getKeys();
      const userId = getCurrentUserId();
      const cleaned = cleanNotes(notes);
      const notesWithUser = cleaned.map(n => ({ ...n, userId }));
      localStorage.setItem(keys.notes, JSON.stringify(notesWithUser.slice(0, 50)));
      
      // Update stats
      const stats = storage.getStudyStats();
      stats.totalNotes = cleaned.length;
      storage.saveStudyStats(stats);
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  },
  
  getRecentUrls: (): string[] => {
    try {
      const data = localStorage.getItem('spi_recent_urls');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },
  
  saveRecentUrl: (url: string) => {
    try {
      const recent = storage.getRecentUrls().filter(u => u !== url).slice(0, 5);
      recent.unshift(url);
      localStorage.setItem('spi_recent_urls', JSON.stringify(recent.slice(0, 5)));
    } catch {}
  },
  
  getStudyStats: () => {
    try {
      const keys = getKeys();
      const data = localStorage.getItem(keys.stats);
      return data ? JSON.parse(data) : { totalSessions: 0, totalFocusMinutes: 0, totalNotes: 0, totalTasks: 0 };
    } catch { return { totalSessions: 0, totalFocusMinutes: 0, totalNotes: 0, totalTasks: 0 }; }
  },
  
  saveStudyStats: (stats: any) => {
    try {
      const keys = getKeys();
      localStorage.setItem(keys.stats, JSON.stringify(stats));
    } catch {}
  },
  
  updateStudyStats: (updater: (s: any) => any) => {
    try {
      const current = storage.getStudyStats();
      const updated = updater(current);
      storage.saveStudyStats(updated);
      return updated;
    } catch { return { totalSessions: 0, totalFocusMinutes: 0 }; }
  },

  // Legacy support - migrate old data + clean corrupted
  migrateOldData: () => {
    if (typeof window === 'undefined') return;
    try {
      const oldNotes = localStorage.getItem('spi_notes_history');
      const oldTasks = localStorage.getItem('spi_tasks');
      const oldAssistant = localStorage.getItem('spi_ai_chat') || localStorage.getItem('spi_assistant');
      
      const userId = getCurrentUserId();
      const keys = userStorage.getUserDataKeys(userId);
      
      if (oldNotes && !localStorage.getItem(keys.notes)) {
        try {
          const parsed = JSON.parse(oldNotes);
          const cleaned = cleanNotes(parsed);
          localStorage.setItem(keys.notes, JSON.stringify(cleaned));
        } catch {
          localStorage.setItem(keys.notes, oldNotes);
        }
        localStorage.removeItem('spi_notes_history');
      }
      if (oldTasks && !localStorage.getItem(keys.tasks)) {
        localStorage.setItem(keys.tasks, oldTasks);
        localStorage.removeItem('spi_tasks');
      }
      if (oldAssistant && !localStorage.getItem(keys.assistant)) {
        localStorage.setItem(keys.assistant, oldAssistant);
        localStorage.removeItem('spi_ai_chat');
        localStorage.removeItem('spi_assistant');
      }
      
      // Also clean current user's notes if corrupted
      const currentNotes = localStorage.getItem(keys.notes);
      if (currentNotes) {
        try {
          const parsed = JSON.parse(currentNotes);
          const cleaned = cleanNotes(parsed);
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(keys.notes, JSON.stringify(cleaned));
          }
        } catch {}
      }
      
      // Clean ALL user notes across all users
      const users = userStorage.getUsers();
      users.forEach(u => {
        const k = userStorage.getUserDataKeys(u.id);
        const notesData = localStorage.getItem(k.notes);
        if (notesData) {
          try {
            const parsed = JSON.parse(notesData);
            const cleaned = cleanNotes(parsed);
            if (cleaned.length !== parsed.length) {
              localStorage.setItem(k.notes, JSON.stringify(cleaned));
            }
          } catch {}
        }
      });
    } catch {}
  },
  
  // Force clean all corrupted notes everywhere
  forceCleanCorrupted: () => {
    if (typeof window === 'undefined') return;
    try {
      const users = userStorage.getUsers();
      users.forEach(u => {
        const keys = userStorage.getUserDataKeys(u.id);
        const data = localStorage.getItem(keys.notes);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            const cleaned = cleanNotes(parsed);
            localStorage.setItem(keys.notes, JSON.stringify(cleaned));
          } catch {
            localStorage.removeItem(keys.notes);
          }
        }
      });
      
      // Also clean legacy keys
      ['spi_notes_history', 'spi_notes_default', 'spi_notes'].forEach(k => {
        const d = localStorage.getItem(k);
        if (d) {
          try {
            const p = JSON.parse(d);
            const c = cleanNotes(p);
            if (c.length === 0) localStorage.removeItem(k);
            else localStorage.setItem(k, JSON.stringify(c));
          } catch {
            localStorage.removeItem(k);
          }
        }
      });
    } catch {}
  }
};

export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
    return d.toLocaleDateString();
  } catch { return 'recently'; }
}
