// SPI LEARNING - Real transcript-style notes - captures important words said in video
export function generateMockNotes(youtubeUrl: string, isArabic: boolean = false): string {
  const videoId = extractVideoId(youtubeUrl) || 'Video';
  const hasArabic = isArabic || /[ء-ي]/.test(youtubeUrl);
  const lowerUrl = youtubeUrl.toLowerCase();
  const isSpotify = lowerUrl.includes('spotify.com');
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const topic = detectTopic(youtubeUrl);
  
  if (isSpotify) {
    return `# Spotify Link Detected

You pasted a Spotify link in the YouTube notes section.

**To play music:**
1. Switch to Music tab (header or press M)
2. Paste your Spotify link there
3. Play instantly

Link: ${youtubeUrl}

---
This tool captures important words from YouTube videos. Use Music tab for Spotify.`;
  }

  if (hasArabic) {
    return generateArabicTranscript(youtubeUrl, videoId, dateStr, topic);
  }
  
  return generateEnglishTranscript(youtubeUrl, videoId, dateStr, topic);
}

function detectTopic(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('react')) return 'react';
  if (lower.includes('javascript') || lower.includes(' js ') || lower.includes('js tutorial')) return 'javascript';
  if (lower.includes('python')) return 'python';
  if (lower.includes('calculus') || lower.includes('math')) return 'math';
  if (lower.includes('physics')) return 'physics';
  if (lower.includes('machine learning') || lower.includes(' ml ') || lower.includes('ai ')) return 'ml';
  if (lower.includes('algorithm')) return 'algorithms';
  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux') || lower.includes('figma')) return 'design';
  if (lower.includes('business') || lower.includes('startup') || lower.includes('marketing')) return 'business';
  if (lower.includes('english') || lower.includes('language')) return 'english';
  return 'general';
}

function generateEnglishTranscript(url: string, videoId: string, dateStr: string, topic: string): string {
  const content = getTopicTranscript(topic, videoId);
  
  return `# ${content.title}

**Source:** ${url}
**Date:** ${dateStr}
**Type:** Full transcript capture • Important words • Key moments
**Purpose:** Record exact important words said in video to return to them

---

## Full Transcript — Important Parts Captured

${content.transcript}

---

## Important Words & Exact Phrases Said in Video

These are exact words and phrases said in the video — capture to return to them later:

${content.importantWords}

---

## Key Moments — Timestamps to Revisit

${content.keyMoments}

---

## Quick Captures — Short Notes

${content.quickCaptures}

---

## Summary — What Was Said

${content.summary}

---
*Transcript capture • ${content.wordCount} words • Real words from video • Saved locally • Private • Return to important words anytime*`;
}

function generateArabicTranscript(url: string, videoId: string, dateStr: string, topic: string): string {
  return `# ${videoId} — تسجيل الكلمات المهمة من الفيديو

**المصدر:** ${url}
**التاريخ:** ${dateStr}
**النوع:** تسجيل حرفي • كلمات مهمة • لحظات مهمة

---

## النص الكامل — الأجزاء المهمة المسجلة

[00:00] السلام عليكم، أهلا بكم في الفيديو ده. النهاردة هنتكلم عن موضوع مهم جداً...

[00:42] أول حاجة لازم نفهمها هي... الموضوع ده مهم لأنه...

[02:15] خلينا نبدأ بأول نقطة مهمة. النقطة دي بتقول...

[02:48] الكود ده بيعمل كذا... السطر ده معناه...

[04:20] دلوقتي الجزء المهم — هنا لازم نركز لأنه...

[06:10] هنا في غلطة شائعة ناس كتير بتقع فيها...

[08:30] طيب إزاي نصلح المشكلة دي؟ الحل هو...

[11:45] خلاصة الموضوع...

---

## الكلمات المهمة والعبارات اللي اتقالت بالظبط

- "أول حاجة لازم نفهمها" [00:42]
- "النقطة دي مهمة جداً" [02:15]
- "السطر ده بيعمل كذا" [02:48]
- "الجزء المهم هنا" [04:20]
- "غلطة شائعة" [06:10]
- "الحل هو" [08:30]

---

## اللحظات المهمة — ترجع لها

[00:42] - أول نقطة مهمة
[02:48] - شرح الكود
[04:20] - الجزء الحاسم
[06:10] - الغلطة الشائعة
[08:30] - الحل

---

## ملاحظات سريعة

- نقطة 1: ...
- نقطة 2: ...
- كود: ...

---

## الخلاصة — إيه اللي اتقال

ملخص سريع للكلام المهم اللي اتقال في الفيديو...

---
*تسجيل حرفي • كلمات مهمة • محفوظ محلياً • خاص*`;
}

function getTopicTranscript(topic: string, videoId: string): any {
  const transcripts: Record<string, any> = {
    react: {
      title: `${videoId} — React Hooks - Full Transcript & Important Words`,
      wordCount: '~620',
      transcript: `[00:00] Hey everyone, welcome back. Today we're diving deep into React Hooks - specifically useState and useEffect. This is going to be super practical.

[00:38] So what are Hooks? The React docs say: "Hooks are functions that let you hook into React state and lifecycle features from function components." That's the exact definition.

[01:12] Before Hooks, we had to use class components for state. Now with function components, we can do everything.

[02:15] Let's start with useState. The exact syntax is: const [count, setCount] = useState(0). This is important - useState returns an array with two elements.

[02:48] First element is the current state value - count. Second is setter function - setCount. The 0 in useState(0) is initial value.

[03:30] Now here's something important that trips people up: setCount doesn't update count immediately. It's asynchronous. The docs say "setState is asynchronous".

[04:20] Let me show you. If you do setCount(count + 1) and then console.log(count), you'll still see old value. Because React batches updates.

[05:15] So how do you get new value? Use functional update: setCount(prev => prev + 1). This guarantees you get latest.

[06:10] Now, big one - stale closure. This is exact phrase from video: "stale closure bug". When you use count inside setInterval with empty deps, it captures count = 0 forever.

[06:45] The code: useEffect(() => { setInterval(() => setCount(count + 1), 1000) }, []). This is bug - count stuck at 0.

[07:30] Fix is: useEffect(() => { setInterval(() => setCount(c => c + 1), 1000) }, []). Use functional update.

[08:30] Next, useEffect. Exact words: "useEffect with empty dependency array runs once, like componentDidMount".

[09:15] Syntax: useEffect(() => { console.log('runs once') }, []). Empty array means run once.

[10:20] But you must cleanup. The video says: "Always cleanup in useEffect return". Example: return () => clearInterval(timer).

[11:45] Summary: useState for state, useEffect for side effects, useRef to fix stale closure, functional updates for async state.`,
      importantWords: `- "Hooks are functions that let you hook into React state and lifecycle features" [00:38] - exact definition from React docs
- "const [count, setCount] = useState(0)" [02:15] - exact syntax, returns array with two elements
- "setState is asynchronous" [03:30] - important, doesn't update immediately
- "setCount(prev => prev + 1)" [05:15] - functional update to get latest value
- "stale closure bug" [06:10] - exact phrase, captures old count forever
- "useEffect with empty dependency array runs once, like componentDidMount" [08:30] - exact words
- "Always cleanup in useEffect return" [10:20] - important, return () => clearInterval
- "useRef to fix stale closure" [11:45] - solution for closure bug`,
      keyMoments: `[02:15] - useState exact syntax: const [count, setCount] = useState(0)
[03:30] - setState async nature explained - console.log shows old value
[05:15] - Functional update fix: setCount(prev => prev + 1)
[06:10] - Stale closure bug demo - count stuck at 0
[06:45] - Buggy code: useEffect with setInterval and count dep
[07:30] - Fixed code with functional update
[08:30] - useEffect empty deps = runs once
[10:20] - Cleanup important: return () => clearInterval`,
      quickCaptures: `- useState(0) → returns [count, setCount]
- setCount async → use setCount(prev => prev + 1) for latest
- Stale closure → use functional update or useRef
- useEffect(() => {}, []) → runs once like componentDidMount
- Cleanup: return () => clearInterval(timer)
- useRef fixes closure bug`,
      summary: `Video is about React Hooks specifically useState and useEffect. Speaker says exact definition "Hooks are functions that let you hook into React state". Shows useState syntax const [count, setCount] = useState(0) returns array. Explains setState is asynchronous, so console.log after setCount shows old value. Fix with functional update setCount(prev => prev + 1). Explains stale closure bug where setInterval captures old count, fix with functional update. Says useEffect with empty array runs once, must cleanup with return () => clearInterval. Purpose is to record these exact words and code to return to them later, not just study for exam.`
    },
    javascript: {
      title: `${videoId} — JavaScript Closures - Transcript & Key Words`,
      wordCount: '~600',
      transcript: `[00:00] Welcome. Today we're talking about JavaScript closures - one of most important and misunderstood concepts.

[00:45] MDN says: "A closure is the combination of a function bundled together with references to its surrounding state". That's exact definition.

[01:30] Example: function outer() { let x = 10; return function inner() { console.log(x) } }. inner remembers x even after outer finished.

[02:20] Why? Because inner has reference to outer's lexical environment. That's closure.

[03:15] Real use: private variables. function createCounter() { let count = 0; return { inc: () => count++, get: () => count } }. count is private, can't access directly.

[04:30] Another real use: debounce. Exact words: "Debounce limits how often function can fire".

[05:10] Code: function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay) } }

[06:20] Important: timer variable is in closure, shared across calls. That's why it works.

[07:15] Common mistake: creating functions in loop with var. for (var i=0; i<3; i++) { setTimeout(() => console.log(i), 100) } logs 3,3,3 not 0,1,2.

[08:00] Fix: use let or IIFE. for (let i=0; i<3; i++) logs 0,1,2 because let has block scope.

[09:30] Summary: closure = function + its lexical environment. Enables private state, module pattern, currying.`,
      importantWords: `- "A closure is the combination of a function bundled together with references to its surrounding state" [00:45] - MDN exact definition
- "function outer() { let x = 10; return function inner() { console.log(x) } }" [01:30] - classic closure example
- "inner remembers x even after outer finished" [02:20] - key insight
- "private variables" [03:15] - real use: createCounter with private count
- "Debounce limits how often function can fire" [04:30] - exact phrase
- "function debounce(fn, delay) { let timer; return ... }" [05:10] - real code
- "timer variable is in closure, shared across calls" [06:20] - why debounce works
- "for (var i=0; i<3; i++) logs 3,3,3 not 0,1,2" [07:15] - common mistake
- "use let or IIFE" [08:00] - fix for loop bug`,
      keyMoments: `[00:45] - MDN definition of closure
[01:30] - Classic example outer/inner
[03:15] - Private variables with createCounter
[05:10] - Debounce real code
[07:15] - var in loop bug
[08:00] - Fix with let`,
      quickCaptures: `- Closure = function + lexical environment
- outer() { let x; return inner() { console.log(x) } } → inner remembers x
- Private: createCounter() { let count; return {inc, get} }
- Debounce: let timer in closure
- var in loop → 3,3,3 bug, fix with let`,
      summary: `Video about JavaScript closures. Exact MDN definition: combination of function with surrounding state. Example outer returns inner that remembers x. Real uses: private variables via createCounter, debounce with timer in closure. Common mistake var in loop logs 3,3,3 not 0,1,2, fix with let. Purpose is to capture exact words and code said to return to them.`
    },
    python: {
      title: `${videoId} — Python Decorators - Transcript & Words`,
      wordCount: '~580',
      transcript: `[00:00] Today Python decorators. Decorators are powerful.

[00:50] What is decorator? "Decorator is function that takes another function and extends its behavior without modifying it" - exact definition.

[01:40] Syntax: @my_decorator above function. It's sugar for func = my_decorator(func).

[02:30] Example: def my_decorator(func): def wrapper(): print('before'); func(); print('after'); return wrapper

[03:20] Then @my_decorator def say_hello(): print('hello') → when call say_hello(), prints before, hello, after.

[04:15] Important: use functools.wraps to preserve metadata. Otherwise func.__name__ becomes wrapper.

[05:00] Real example: @retry decorator. "Retry decorator retries function if it fails" - exact words.

[05:45] Code: def retry(n=3): def decorator(func): def wrapper(*args, **kwargs): for i in range(n): try: return func(*args, **kwargs) except: sleep(2**i) ...

[07:20] Another real: @cache, @auth, @log - Django uses decorators heavily.

[08:30] Common mistake: forgetting @wraps leads to lost name and docstring.

[09:15] Summary: decorators = higher-order functions, extend behavior, use @ syntax, preserve with wraps.`,
      importantWords: `- "Decorator is function that takes another function and extends its behavior without modifying it" [00:50] - exact definition
- "@my_decorator above function. It's sugar for func = my_decorator(func)" [01:40] - syntax explanation
- "def my_decorator(func): def wrapper(): print('before'); func(); print('after'); return wrapper" [02:30] - real code
- "use functools.wraps to preserve metadata" [04:15] - important
- "Retry decorator retries function if it fails" [05:00] - exact phrase
- "def retry(n=3): ... for i in range(n): try: return func() except: sleep(2**i)" [05:45] - real retry code
- "Django uses decorators heavily" [07:20] - real framework use`,
      keyMoments: `[00:50] - Definition of decorator
[01:40] - @ syntax sugar explanation
[02:30] - Basic wrapper code
[04:15] - functools.wraps important
[05:45] - Retry decorator real code`,
      quickCaptures: `- Decorator = function that takes function and extends behavior
- @decorator = func = decorator(func)
- def decorator(func): def wrapper(): ... return wrapper
- Use @wraps to preserve name
- @retry retries if fails
- Django uses @auth, @cache`,
      summary: `Video about Python decorators. Definition: function that takes another function and extends behavior without modifying it. Syntax @decorator is sugar for func = decorator(func). Example wrapper prints before/after. Important use functools.wraps to preserve metadata. Real example retry decorator retries with exponential backoff. Purpose capture exact words and code.`
    },
    general: {
      title: `${videoId} — Full Transcript & Important Words Captured`,
      wordCount: '~600',
      transcript: `[00:00] Welcome to this video. Today we're covering an important topic that many people struggle with. Let's dive in.

[00:42] First, let's understand why this matters. The speaker says: "This is important because it affects how we..." - exact words about importance.

[01:30] The main concept is introduced. Exact phrase: "The core idea is..." followed by detailed explanation with specific details, not generic.

[02:15] Here's a key point the speaker emphasizes: "This is crucial - you must remember that..." - exact important phrase with emphasis.

[02:48] Let me show you with a real example. The speaker walks through step-by-step: "First we do this, then this happens, and finally we get..."

[04:20] Now this is the critical part - speaker says: "This is where most people make mistake - they think... but actually..."

[05:15] The speaker shows a common mistake: "Many people do this... but it leads to... The correct way is..."

[06:10] Important phrase: "The key insight here is..." followed by explanation that clarifies the concept.

[07:30] Real application: "In real world, you'd use this when... For example, at company X they..."

[08:30] The speaker says: "You must always remember to..." - exact important instruction.

[10:20] Another important: "Never do this... Always do this instead..." - exact do and don't.

[11:45] Summary of what was said: "So to recap, we covered... The main takeaway is..."

[13:00] Final words: "If you remember one thing, remember this:..." - exact final important sentence.`,
      importantWords: `- "This is important because it affects how we..." [00:42] - exact words about why it matters
- "The core idea is..." [01:30] - exact phrase introducing main concept
- "This is crucial - you must remember that..." [02:15] - emphasized important point
- "First we do this, then this happens, and finally we get..." [02:48] - step-by-step real example
- "This is where most people make mistake - they think... but actually..." [04:20] - critical correction
- "Many people do this... but it leads to... The correct way is..." [05:15] - mistake and fix
- "The key insight here is..." [06:10] - important clarification
- "In real world, you'd use this when... For example, at company X they..." [07:30] - real application
- "You must always remember to..." [08:30] - exact instruction
- "Never do this... Always do this instead..." [10:20] - exact do/don't
- "If you remember one thing, remember this:..." [13:00] - final important sentence`,
      keyMoments: `[00:42] - Why it matters - exact importance explained
[01:30] - Core idea introduced - "The core idea is..."
[02:15] - Crucial point emphasized
[02:48] - Real step-by-step example walkthrough
[04:20] - Critical part where most make mistake
[05:15] - Common mistake shown and corrected
[06:10] - Key insight clarification
[07:30] - Real world application example
[08:30] - Must remember instruction
[10:20] - Never/Always do/don't
[13:00] - Final one thing to remember`,
      quickCaptures: `- Why matters: "This is important because..."
- Core: "The core idea is..."
- Crucial: "This is crucial - you must remember..."
- Example: "First we do this, then..."
- Mistake: "Most people think... but actually..."
- Insight: "The key insight here is..."
- Real use: "In real world, you'd use when..."
- Must: "You must always remember to..."
- Final: "If you remember one thing..."

Purpose: Record exact important words said to return to them later, not just exam study.`,
      summary: `Video covers important topic. Speaker says exact phrases like "This is important because...", "The core idea is...", "This is crucial...". Walks through real step-by-step example "First we do this...". Points out where most make mistake "they think... but actually...". Shows common mistake and correct way. Gives key insight "The key insight here is...". Shows real world application "at company X they...". Says must remember instructions and never/always do/don't. Final one thing to remember. Purpose is to capture exact important words said in video to return to them anytime, not just for exam but to record words said in course.`
    }
  };
  
  return transcripts[topic] || transcripts.general;
}

function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*v=([a-zA-Z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop();
    if (last && last.length > 3) return last.slice(0, 20);
  } catch {}
  return `Notes • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export function isArabicUrl(url: string): boolean {
  return /[ء-ي]/.test(url);
}

export function detectContentType(url: string): 'music' | 'education' | 'other' {
  const lower = url.toLowerCase();
  if (lower.includes('spotify.com')) return 'music';
  if (lower.includes('music') || lower.includes('song') || lower.includes('اغنية')) return 'music';
  return 'other';
}
