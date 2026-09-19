'use client';
import { Youtube, BookOpen, Brain, MessageCircle, FileText, FileDown } from 'lucide-react';

// Consistent icon library: lucide-react, stroke width 2 (default)
// All icons come from ONE library, ONE consistent stroke width
// Refined treatments for core actions: subtle duotone / accent dot, restrained not gimmicky

interface RefinedProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'accent';
}

function AccentDot() {
  return <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7c3aed] border-2 border-[#fcfcf9]" />;
}

export function IconGenerateNotes({ size = 16, className = 'w-4 h-4 text-white', variant = 'default' }: RefinedProps) {
  return (
    <span className="relative inline-flex">
      <span className={`w-9 h-9 rounded-[10px] ${variant === 'accent' ? 'bg-[#7c3aed]' : 'bg-zinc-900'} flex items-center justify-center`}>
        <Youtube className={className} />
      </span>
      <AccentDot />
    </span>
  );
}

export function IconBookExport({ size = 16, className = 'w-4 h-4 text-white', variant = 'default' }: RefinedProps) {
  return (
    <span className="relative inline-flex">
      <span className={`w-9 h-9 rounded-[10px] ${variant === 'accent' ? 'bg-[#7c3aed]' : 'bg-zinc-900'} flex items-center justify-center`}>
        <BookOpen className={className} />
      </span>
      <AccentDot />
    </span>
  );
}

export function IconFlashcards({ size = 16, className = 'w-4 h-4 text-white', variant = 'default' }: RefinedProps) {
  return (
    <span className="relative inline-flex">
      <span className={`w-9 h-9 rounded-[10px] ${variant === 'accent' ? 'bg-[#7c3aed]' : 'bg-zinc-900'} flex items-center justify-center`}>
        <Brain className={className} />
      </span>
      <AccentDot />
    </span>
  );
}

export function IconAssistant({ size = 16, className = 'w-4 h-4 text-white', variant = 'default' }: RefinedProps) {
  return (
    <span className="relative inline-flex">
      <span className={`w-9 h-9 rounded-[10px] ${variant === 'accent' ? 'bg-[#7c3aed]' : 'bg-zinc-900'} flex items-center justify-center`}>
        <MessageCircle className={className} />
      </span>
      <AccentDot />
    </span>
  );
}

export function IconNotes({ size = 16, className = 'w-4 h-4 text-white', variant = 'default' }: RefinedProps) {
  return (
    <span className="relative inline-flex">
      <span className={`w-9 h-9 rounded-[10px] ${variant === 'accent' ? 'bg-[#7c3aed]' : 'bg-zinc-900'} flex items-center justify-center`}>
        <FileText className={className} />
      </span>
      {variant === 'accent' && <AccentDot />}
    </span>
  );
}

// Audit list — all icons used across app, confirming single library lucide-react, stroke 2
export const ICON_AUDIT = {
  library: 'lucide-react',
  strokeWidth: 2,
  consistent: true,
  icons: [
    'Youtube', 'FileText', 'BookOpen', 'Brain', 'MessageCircle', 'Clock', 'Shield', 'Search',
    'Calculator', 'Timer', 'Music', 'ListTodo', 'GraduationCap', 'Youtube', 'ArrowUpRight',
    'Check', 'X', 'Copy', 'History', 'Play', 'Pause', 'RotateCcw', 'Headphones', 'RefreshCw',
    'Trash2', 'ExternalLink', 'AlertCircle', 'AlertTriangle', 'CheckCircle', 'XCircle',
    'BarChart3', 'Download', 'StopCircle', 'Eye', 'Calendar', 'DollarSign', 'Layers',
    'Lock', 'Mail', 'EyeOff', 'ArrowRight', 'Command', 'Plus', 'Tag', 'Zap', 'TrendingUp',
    'ChevronLeft', 'ChevronRight', 'Quote', 'CheckCircle2', 'FileDown', 'ClipboardList',
    'Languages', 'Globe', 'Heart', 'Sparkles', 'Sun', 'Moon', 'LogOut'
  ],
  refined: [
    { action: 'Generate Notes', icon: 'Youtube + accent dot #7c3aed', file: 'icons.tsx IconGenerateNotes', usage: 'Landing hero CTA, tool Generate button' },
    { action: 'Book/Course export', icon: 'BookOpen + accent dot', file: 'icons.tsx IconBookExport', usage: 'BookView, NotesView premium export, landing features' },
    { action: 'Flashcards', icon: 'Brain + accent dot', file: 'icons.tsx IconFlashcards', usage: 'FlashcardsView, Tasks' },
    { action: 'Assistant', icon: 'MessageCircle + accent dot', file: 'icons.tsx IconAssistant', usage: 'Assistant floating bubble' },
    { action: 'Notes', icon: 'FileText + optional accent', file: 'icons.tsx IconNotes', usage: 'Library cards, notes view' },
  ],
  note: 'All icons from lucide-react, strokeWidth 2 default, no mixed libraries (no Phosphor, no Heroicons), consistent rounded-[10px] containers, zinc-900 base, #7c3aed accent only on primary actions + subtle dot on core actions — restrained not gimmicky'
};
