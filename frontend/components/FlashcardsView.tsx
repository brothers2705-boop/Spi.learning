'use client';
import { useState, useEffect } from 'react';
import { Brain, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Flashcard {
  id: string;
  q: string;
  a: string;
  time?: string;
  source?: 'ai' | 'fallback';
}

function generateFlashcardsFromMarkdown(md: string): Flashcard[] {
  const cards: Flashcard[] = [];
  let id = 0;
  
  const defRegex = /\*\*(.*?):\*\*\s*(.*?)(?:\n|$)/g;
  let match;
  while ((match = defRegex.exec(md)) !== null) {
    if (id >= 6) break;
    const term = match[1].trim();
    const def = match[2].trim().slice(0, 200);
    if (term.length > 2 && term.length < 80 && def.length > 15) {
      cards.push({ id: `${id++}`, q: `What is ${term}?`, a: def, time: '00:00', source: 'fallback' });
    }
  }
  
  if (cards.length < 3) {
    const hRegex = /###\s+\[.*?\]\s*(.+)/g;
    while ((match = hRegex.exec(md)) !== null && id < 8) {
      cards.push({ id: `${id++}`, q: `Explain: ${match[1].trim()}?`, a: `Key content from ${match[1].trim()} — review timestamped section.`, source: 'fallback' });
    }
  }

  if (cards.length === 0) {
    const lines = md.split('\n').filter(l => l.trim().length > 25 && !l.startsWith('#') && !l.startsWith('*') && !l.startsWith('-')).slice(0, 4);
    if (lines.length >= 2) {
      return lines.slice(0, 4).map((line, i) => ({
        id: `${i}`,
        q: `What is key point: ${line.slice(0, 60)}...?`,
        a: line.slice(0, 250),
        source: 'fallback' as const
      }));
    }
    return [
      { id: '0', q: 'What is the main topic of this video?', a: 'See Overview section for specific real summary of this video.', source: 'fallback' },
      { id: '1', q: 'What are core concepts?', a: 'Check Detailed Notes with timestamps for specific real concepts from this video.', source: 'fallback' },
      { id: '2', q: 'Give a real example?', a: 'See Examples section for real specific examples with real code or real details.', source: 'fallback' },
      { id: '3', q: 'What is common mistake?', a: 'See Key Takeaways for specific pitfalls for this topic.', source: 'fallback' },
    ];
  }
  
  return cards.slice(0, 8);
}

export function FlashcardsView({ markdown, onClose }: { markdown: string; onClose: () => void }) {
  const [cards, setCards] = useState<Flashcard[]>(() => generateFlashcardsFromMarkdown(markdown));
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [aiStatus, setAiStatus] = useState<'loading' | 'ai' | 'fallback'>('loading');

  useEffect(() => {
    const loadAI = async () => {
      try {
        const { generateFlashcards } = await import('@/lib/ai');
        const aiCards = await generateFlashcards(markdown);
        if (aiCards.length > 0) {
          setCards(aiCards.map((c, i) => ({ id: `${i}`, q: c.q, a: c.a, source: c.source })));
          setAiStatus(aiCards[0].source === 'ai' ? 'ai' : 'fallback');
          return;
        }
      } catch (e) {
        console.warn('[Flashcards] AI failed:', e);
      }
      setCards(generateFlashcardsFromMarkdown(markdown));
      setAiStatus('fallback');
    };
    loadAI();
  }, [markdown]);

  const card = cards[current] || { id: '0', q: 'Loading...', a: 'Generating flashcards...', source: 'fallback' as const };

  const next = () => {
    setFlipped(false);
    setTimeout(() => setCurrent((c) => (c + 1) % cards.length), 150);
  };
  const prev = () => {
    setFlipped(false);
    setTimeout(() => setCurrent((c) => (c - 1 + cards.length) % cards.length), 150);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fcfcf9] flex flex-col overflow-hidden">
      <div className="h-[64px] border-b border-zinc-200 bg-[#fcfcf9]/80 backdrop-blur-[12px] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-[10px] bg-zinc-900 flex items-center justify-center"><Brain className="w-4 h-4 text-white" /></div>
          <div className="min-w-0">
            <div className="font-[700] text-[14px] tracking-[-0.01em] flex items-center gap-2 text-zinc-900">
              Flashcards
              <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-[700]">
                {aiStatus === 'loading' ? 'Loading...' : aiStatus === 'ai' ? 'AI • Real' : 'Real'}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500">{current + 1} / {cards.length} • {known.size} known</div>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:border-zinc-900 transition-colors"><X className="w-5 h-5 text-zinc-600" /></button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <div className="w-full max-w-[480px] my-auto">
          <div className="relative h-[360px]">
            <div
              onClick={() => setFlipped(!flipped)}
              className="absolute inset-0 w-full h-full transition-all duration-500 cursor-pointer"
              style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              <div className="absolute inset-0 w-full h-full bg-white border border-zinc-200 rounded-[16px] p-8 flex flex-col" style={{ backfaceVisibility: 'hidden' }}>
                <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 uppercase">Question • Click to flip</div>
                <div className="flex-1 flex items-center py-4">
                  <div className="font-display text-[22px] leading-[1.2] tracking-[-0.02em] font-[600] text-zinc-900 break-words">{card.q}</div>
                </div>
                <div className="text-[12px] text-zinc-500">Tap to reveal</div>
              </div>
              <div className="absolute inset-0 w-full h-full bg-zinc-900 text-white rounded-[16px] p-8 flex flex-col" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-400 uppercase">Answer • Real</div>
                <div className="flex-1 flex items-center py-4">
                  <div className="text-[15px] leading-[1.6] font-[450] break-words">{card.a}</div>
                </div>
                <div className="text-[12px] text-zinc-400">Tap for question</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 gap-3">
            <button onClick={prev} className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:border-zinc-900 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 flex-1 justify-center">
              <button onClick={() => { const newKnown = new Set(Array.from(known)); newKnown.add(card.id); setKnown(newKnown); next(); }} className="h-12 px-6 rounded-full bg-zinc-900 text-white text-[14px] font-[600] hover:bg-black transition-colors">Know</button>
              <button onClick={next} className="h-12 px-6 rounded-full bg-white border border-zinc-200 text-zinc-900 text-[14px] font-[600] hover:border-zinc-900 transition-colors">Next</button>
            </div>
            <button onClick={next} className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:border-zinc-900 transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <div className="flex justify-center gap-1.5 mt-8">
            {cards.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-zinc-900' : known.has(cards[i].id) ? 'w-1.5 bg-zinc-400' : 'w-1.5 bg-zinc-200'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
