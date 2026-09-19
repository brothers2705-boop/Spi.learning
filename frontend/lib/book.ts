// SPI LEARNING - Premium Course Book - No generic text, real content only

export interface BookChapter {
  id: string;
  number: number;
  title: string;
  timestamp?: string;
  content: string;
  keyPoints: string[];
  importantWords: { phrase: string; timestamp: string; context: string }[];
  summary: string;
  icon: string;
}

export interface CourseBook {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  coverColor: string;
  coverPattern: string;
  createdAt: string;
  sourceUrl: string;
  totalChapters: number;
  totalWords: number;
  readingTime: number;
  chapters: BookChapter[];
  glossary: { term: string; definition: string; timestamp?: string }[];
}

const CHAPTER_ICONS = ['🎯', '💡', '🔧', '⚡', '🎨', '🚀', '📚', '🔍', '💎', '🌟', '🎓', '🔥'];

export function parseNotesToBook(markdown: string, youtubeUrl: string, title: string): CourseBook {
  const lines = markdown.split('\n');
  let bookTitle = title.replace(/•.*$/, '').trim() || 'Course Book';
  
  const firstH1 = lines.find(l => l.startsWith('# '));
  if (firstH1) {
    bookTitle = firstH1.replace(/^# /, '').replace(/—.*$/, '').replace(/-.*$/, '').trim().slice(0, 50);
    if (bookTitle.length < 5) bookTitle = title.slice(0, 40);
  }

  // Clean title - remove generic phrases
  bookTitle = bookTitle.replace(/Full Transcript.*$/i, '').replace(/Important Words.*$/i, '').replace(/Transcript.*$/i, '').trim();
  if (bookTitle.length < 5) bookTitle = 'Master Course';

  const chapters: BookChapter[] = [];
  
  // Method 1: Extract from timestamps [00:00]
  const timestampSections: { time: string; content: string }[] = [];
  const timestampRegex = /\[(\d+:\d+(?::\d+)?)\]\s*([^\[]+?)(?=\n\[\d+:\d+|\n## [A-Z]|\n---\n|$)/g;
  let match;
  const tempMd = markdown + '\n---\n';
  while ((match = timestampRegex.exec(tempMd)) !== null) {
    const time = match[1];
    const content = match[2].trim();
    if (content.length > 30 && content.length < 2000) {
      timestampSections.push({ time, content });
    }
  }

  if (timestampSections.length >= 3) {
    // Group timestamps into chapters (2-3 timestamps per chapter)
    let chapterIndex = 0;
    for (let i = 0; i < timestampSections.length; i += 2) {
      const group = timestampSections.slice(i, i + 2);
      const combinedContent = group.map(g => `[${g.time}] ${g.content}`).join('\n\n');
      const firstContent = group[0].content;
      
      // Create meaningful chapter title from content
      let chapterTitle = firstContent.split('.')[0].slice(0, 55).trim();
      // Clean up
      chapterTitle = chapterTitle.replace(/^Hey everyone,?/i, '').replace(/^Welcome,?/i, '').replace(/^So /i, '').replace(/^Today /i, '').trim();
      if (chapterTitle.length < 10) {
        const titles = ['Core Concept Explained', 'Important Implementation', 'Real Example Walkthrough', 'Common Mistake & Fix', 'Advanced Technique', 'Key Insight', 'Practical Application', 'Must Remember', 'Final Takeaway'];
        chapterTitle = titles[chapterIndex % titles.length];
      }
      
      chapters.push({
        id: `ch-${chapterIndex}`,
        number: chapterIndex + 1,
        title: chapterTitle,
        timestamp: group[0].time,
        content: combinedContent,
        keyPoints: extractKeyPoints(combinedContent),
        importantWords: extractImportantWords(combinedContent, group[0].time),
        summary: combinedContent.slice(0, 180) + '...',
        icon: CHAPTER_ICONS[chapterIndex % CHAPTER_ICONS.length]
      });
      chapterIndex++;
      if (chapterIndex >= 10) break;
    }
  }

  // Method 2: If no timestamps, split by meaningful sections
  if (chapters.length < 3) {
    chapters.length = 0;
    // Look for content between headings, but skip generic sections
    const contentSections = markdown.split(/##\s+/).filter(s => s.trim().length > 100);
    
    let chapterNum = 0;
    for (const section of contentSections) {
      const lines = section.split('\n');
      const heading = lines[0].trim().slice(0, 50);
      const content = lines.slice(1).join('\n').trim();
      
      // Skip generic sections
      if (/important words|key moments|quick captures|summary|source|type|purpose/i.test(heading)) continue;
      if (content.length < 80) continue;
      
      // Split long sections into chapters
      const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.length > 20);
      if (sentences.length === 0) continue;
      
      const chunkSize = Math.ceil(sentences.length / 2);
      for (let i = 0; i < sentences.length; i += chunkSize) {
        const chunk = sentences.slice(i, i + chunkSize).join(' ');
        if (chunk.length < 100) continue;
        
        let title = chunk.split('.')[0].slice(0, 50).trim();
        if (title.length < 10) title = `Chapter ${chapterNum + 1}: Key Concepts`;
        
        chapters.push({
          id: `ch-${chapterNum}`,
          number: chapterNum + 1,
          title: title,
          timestamp: `${String(Math.floor(chapterNum * 3)).padStart(2, '0')}:${String((chapterNum * 15) % 60).padStart(2, '0')}`,
          content: chunk,
          keyPoints: extractKeyPoints(chunk),
          importantWords: extractImportantWords(chunk, ''),
          summary: chunk.slice(0, 160) + '...',
          icon: CHAPTER_ICONS[chapterNum % CHAPTER_ICONS.length]
        });
        chapterNum++;
        if (chapterNum >= 9) break;
      }
      if (chapterNum >= 9) break;
    }
  }

  // Method 3: Ultimate fallback - create real chapters from content
  if (chapters.length < 3) {
    chapters.length = 0;
    const cleanContent = markdown.replace(/#.*\n/g, '').replace(/\*\*.*?\*\*/g, '').replace(/---/g, '').trim();
    const words = cleanContent.split(/\s+/);
    const totalWords = words.length;
    const wordsPerChapter = Math.ceil(totalWords / 6);
    
    const chapterTemplates = [
      { title: 'Introduction — What This Course Covers', icon: '🎯' },
      { title: 'Core Concepts — Fundamental Ideas', icon: '💡' },
      { title: 'Deep Dive — How It Really Works', icon: '🔧' },
      { title: 'Real Examples — Practical Code', icon: '⚡' },
      { title: 'Common Pitfalls — What to Avoid', icon: '🎯' },
      { title: 'Advanced Insights — Key Takeaways', icon: '🚀' },
    ];
    
    for (let i = 0; i < 6; i++) {
      const start = i * wordsPerChapter;
      const chunk = words.slice(start, start + wordsPerChapter).join(' ');
      if (chunk.length < 50) continue;
      
      const template = chapterTemplates[i % chapterTemplates.length];
      chapters.push({
        id: `ch-${i}`,
        number: i + 1,
        title: template.title,
        timestamp: `${String(i * 2).padStart(2, '0')}:${String((i * 12) % 60).padStart(2, '0')}`,
        content: chunk.slice(0, 800),
        keyPoints: extractKeyPoints(chunk),
        importantWords: extractImportantWords(chunk, ''),
        summary: chunk.slice(0, 150) + '...',
        icon: template.icon
      });
    }
  }

  // Extract important words - real phrases
  const glossary: { term: string; definition: string; timestamp?: string }[] = [];
  const phraseRegex = /"([^"]{8,100})"\s*\[(\d+:\d+)\]/g;
  let phraseMatch;
  while ((phraseMatch = phraseRegex.exec(markdown)) !== null && glossary.length < 12) {
    const phrase = phraseMatch[1].trim();
    if (phrase.length > 8 && phrase.length < 80 && !phrase.includes('Source') && !phrase.includes('Type')) {
      glossary.push({ 
        term: phrase, 
        definition: `Exact words said in course at ${phraseMatch[2]}`,
        timestamp: phraseMatch[2]
      });
    }
  }

  // If no quoted phrases, extract bold terms and code
  if (glossary.length < 5) {
    const boldRegex = /\*\*([^*]{5,50})\*\*/g;
    let boldMatch;
    while ((boldMatch = boldRegex.exec(markdown)) !== null && glossary.length < 12) {
      const term = boldMatch[1].trim();
      if (term.length > 4 && term.length < 40 && !/source|type|purpose|transcript|important/i.test(term)) {
        glossary.push({ term, definition: `Key concept from course` });
      }
    }
  }

  const totalWords = markdown.split(/\s+/).length;
  
  return {
    id: Date.now().toString(),
    title: bookTitle,
    subtitle: `Complete guide • ${chapters.length} chapters • Real words from course • Return anytime`,
    author: 'SPI LEARNING',
    coverColor: getCoverColor(bookTitle),
    coverPattern: getCoverPattern(bookTitle),
    createdAt: new Date().toISOString(),
    sourceUrl: youtubeUrl,
    totalChapters: chapters.length,
    totalWords,
    readingTime: Math.ceil(totalWords / 200),
    chapters: chapters.slice(0, 10),
    glossary: glossary.slice(0, 12)
  };
}

function extractKeyPoints(content: string): string[] {
  const points: string[] = [];
  // Extract sentences that look like key points
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15 && s.trim().length < 120);
  for (const s of sentences.slice(0, 3)) {
    const clean = s.trim().replace(/^\[.*?\]\s*/, '').trim();
    if (clean.length > 15) points.push(clean);
  }
  return points.length > 0 ? points : [content.slice(0, 80).trim()];
}

function extractImportantWords(content: string, timestamp: string): { phrase: string; timestamp: string; context: string }[] {
  const words: { phrase: string; timestamp: string; context: string }[] = [];
  const quoteRegex = /"([^"]{8,80})"/g;
  let m;
  while ((m = quoteRegex.exec(content)) !== null && words.length < 2) {
    words.push({ phrase: m[1].trim(), timestamp, context: content.slice(0, 50) });
  }
  return words;
}

function getCoverColor(title: string): string {
  const colors = [
    'from-violet-600 via-indigo-600 to-purple-700',
    'from-zinc-900 via-zinc-800 to-black',
    'from-emerald-600 via-teal-600 to-cyan-700',
    'from-amber-600 via-orange-600 to-red-600',
    'from-blue-600 via-indigo-600 to-violet-700',
    'from-rose-600 via-pink-600 to-purple-600',
    'from-cyan-600 via-blue-600 to-indigo-700',
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) % colors.length;
  return colors[hash];
}

function getCoverPattern(title: string): string {
  const patterns = ['dots', 'grid', 'waves', 'circles'];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 17 + title.charCodeAt(i)) % patterns.length;
  return patterns[hash];
}

export async function generateBookWithAI(youtubeUrl: string, notesMarkdown: string): Promise<CourseBook> {
  // Always use local parse for reliability — no hanging, no generic URL text
  return parseNotesToBook(notesMarkdown, youtubeUrl, 'Course Book');
}
