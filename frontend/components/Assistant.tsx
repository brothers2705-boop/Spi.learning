'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Send, Trash2, Shield, MessageCircle } from 'lucide-react';
import { chatWithAssistant, SYSTEM_PROMPT, loadAssistant, getPuterStatus } from '@/lib/ai';
import { userStorage } from '@/lib/user';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'ai' | 'local';
  model?: string;
  provider?: string;
}

const QUICK_ACTIONS = [
  { label: 'Real transcript pipeline?', prompt: 'Explain real transcript pipeline — how do you read captions with timestamps? Do you watch video?' },
  { label: 'Book vs Quick Notes?', prompt: 'What is real difference between Quick Notes export and Book/Course export? Show me they are different files' },
  { label: 'Cost table honest?', prompt: 'Give me honest cost table: feature → tool used → free or paid → what happens at free limit' },
  { label: 'No transcript case?', prompt: 'What happens if video has no transcript? Do you fake notes or say clearly no transcript?' },
];

export function Assistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ loaded: boolean; loading: boolean; error: boolean; exists: boolean }>({ loaded: false, loading: true, error: false, exists: false });
  const [loaded, setLoaded] = useState(false);
  const [storageKey, setStorageKey] = useState('spi_assistant_default');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssistant().then(() => {
      setAiStatus(getPuterStatus());
    });
    const interval = setInterval(() => setAiStatus(getPuterStatus()), 2000);
    
    const user = userStorage.getCurrentUser();
    const keys = userStorage.getUserDataKeys(user?.id || 'default');
    setStorageKey(keys.assistant);
    
    try {
      const saved = localStorage.getItem(keys.assistant) || localStorage.getItem('spi_assistant') || localStorage.getItem('spi_ai_chat');
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `**SPI LEARNING assistant — free, honest pipeline**

**Real pipeline:**
- Reads REAL YouTube captions with timestamps via YouTube captions API (free) — does NOT watch video
- If no transcript, says "No transcript available" — NOT faking
- Chunking preserved for 3h+ long videos
- Book vs Quick: real difference — Quick simple, Book premium A4 with cover, TOC real page numbers, chapters, print-ready
- Cost: 100% free except optional Anthropic — transcript free, assistant free (Gemini free tier + Groq + Puter.js), Google OAuth free, storage free, book PDF free

Private to you. Ask anything.`,
            timestamp: new Date().toISOString(),
            source: 'local',
            model: 'welcome',
            provider: 'Local — free'
          }
        ]);
      }
    } catch {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hey! Ready to help with real transcript pipeline, book vs quick notes, cost table.",
          timestamp: new Date().toISOString(),
          source: 'local'
        }
      ]);
    }
    setLoaded(true);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKey, JSON.stringify(messages.slice(-30)));
  }, [messages, loaded, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(m => [...m, userMessage]);
    setInput('');
    setIsLoading(true);
    setAiStatus(getPuterStatus());

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const response = await chatWithAssistant(text, {
        model: 'gpt-4o-mini',
        systemPrompt: SYSTEM_PROMPT,
        history
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        source: response.source,
        model: response.model,
        provider: (response as any).provider
      };
      setMessages(m => [...m, assistantMessage]);
      setAiStatus(getPuterStatus());
    } catch (e) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Offline mode — still working**

Real pipeline: reads real YouTube captions with timestamps — does NOT watch video. If no transcript: clear error. Book vs Quick: real difference, print-ready A4, TOC real page numbers.

Everything saved locally, private to you.`,
        timestamp: new Date().toISOString(),
        source: 'local',
        model: 'error-fallback',
        provider: 'Local — free, always works'
      };
      setMessages(m => [...m, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `**Chat cleared!**

AI Status: ${aiStatus.loaded ? 'Connected — free' : aiStatus.loading ? 'Connecting...' : 'Offline — local help'}

Try: Real transcript pipeline? Book vs Quick? Cost table? Which provider?

Private to you.`,
        timestamp: new Date().toISOString(),
        source: 'local',
        provider: 'Local — free'
      }
    ]);
    localStorage.removeItem(storageKey);
  };

  const statusText = aiStatus.loaded ? 'Connected' : aiStatus.loading ? 'Connecting...' : 'Offline';
  const statusDot = aiStatus.loaded ? 'bg-zinc-900' : aiStatus.loading ? 'bg-zinc-400 animate-pulse' : 'bg-zinc-300';

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-zinc-900 text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Study assistant"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          <div className={`absolute -top-1 -right-1 w-3 h-3 ${statusDot} rounded-full border-2 border-white`} />
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 md:bottom-6 md:right-6 md:top-auto md:left-auto z-50 md:w-[400px] md:h-[560px] w-full h-full bg-[#fcfcf9] md:rounded-[16px] border border-zinc-200 md:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden">
          <div className="h-[64px] px-4 flex items-center justify-between border-b border-zinc-200 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-zinc-900 flex items-center justify-center">
                <span className="text-white font-[700] text-[14px]">S</span>
              </div>
              <div>
                <div className="font-[700] text-[13px] tracking-[-0.01em] flex items-center gap-2 text-zinc-900">
                  Assistant
                  <span className={`px-2 py-0.5 rounded-full text-white text-[10px] font-[700] flex items-center gap-1 ${aiStatus.loaded ? 'bg-zinc-900' : 'bg-zinc-400'}`}>
                    <span className={`w-1 h-1 rounded-full bg-white ${aiStatus.loading ? 'animate-pulse' : ''}`} />{statusText}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 font-[500] flex items-center gap-1.5 mt-0.5">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Private</span>
                  <span>•</span>
                  <span className="truncate max-w-[160px]">{aiStatus.loaded ? 'Free provider' : 'Local'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat} className="w-8 h-8 rounded-full bg-white border border-zinc-200 hover:border-zinc-900 flex items-center justify-center transition-colors"><Trash2 className="w-4 h-4 text-zinc-600" /></button>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white border border-zinc-200 hover:border-zinc-900 flex items-center justify-center transition-colors"><X className="w-4 h-4 text-zinc-600" /></button>
            </div>
          </div>

          <div className="px-4 py-2 text-[11px] font-[500] flex items-center gap-2 border-b border-zinc-200 bg-white text-zinc-600">
            <div className={`w-2 h-2 rounded-full ${statusDot}`} />
            <span>{aiStatus.loaded ? 'Free AI — Gemini free tier + Groq + Puter.js free — not paid' : aiStatus.loading ? 'Connecting to free AI...' : 'Offline — local help, still useful'}</span>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4 bg-[#fcfcf9]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-[16px] px-4 py-3 text-[13px] leading-[1.6] font-[450] break-words ${m.role === 'user' ? 'bg-zinc-900 text-white rounded-br-[6px]' : 'bg-white border border-zinc-200 text-zinc-900 rounded-bl-[6px]'}`}>
                  {m.role === 'assistant' ? (
                    <div className="prose prose-zinc max-w-none prose-p:text-[13px] prose-p:leading-[1.6] prose-p:my-1.5 prose-strong:font-[700] prose-code:text-[11px] prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-li:text-[13px]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                  )}
                  <div className={`flex flex-col gap-1 mt-2 text-[10px] font-mono ${m.role === 'user' ? 'text-white/60 items-end' : 'text-zinc-500'}`}>
                    <div className="flex items-center gap-2">
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {m.role === 'assistant' && m.source && (
                        <>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-[700] ${m.source === 'ai' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'}`}>{m.source === 'ai' ? `AI • ${m.model}` : `Local • ${m.model}`}</span>
                        </>
                      )}
                    </div>
                    {m.role === 'assistant' && m.provider && (
                      <div className="text-[9px] leading-[1.3] opacity-70 max-w-[260px]">Provider: {m.provider.slice(0, 120)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-[16px] rounded-bl-[6px] px-4 py-3 flex items-center gap-2 border border-zinc-200">
                  <div className="w-2 h-2 rounded-full bg-zinc-900 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-zinc-900 animate-bounce" style={{ animationDelay: '100ms' }} />
                  <div className="w-2 h-2 rounded-full bg-zinc-900 animate-bounce" style={{ animationDelay: '200ms' }} />
                  <span className="text-[11px] font-mono text-zinc-500 ml-1">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 3 && (
            <div className="px-3 pb-2 bg-[#fcfcf9]">
              <div className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500 mb-2 px-1">QUICK ACTIONS</div>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button key={action.label} onClick={() => handleSend(action.prompt)} className="p-3 rounded-[10px] bg-white border border-zinc-200 hover:border-zinc-900 text-left transition-colors">
                    <div className="text-[12px] font-[600] leading-tight text-zinc-900">{action.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 border-t border-zinc-200 bg-white">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={aiStatus.loaded ? "Ask which provider/model..." : "Ask: real pipeline? cost table?"}
                  className="w-full h-11 pl-4 pr-4 rounded-full bg-white border border-zinc-200 text-[13px] font-[500] outline-none focus:border-zinc-900 placeholder:text-zinc-400 transition-colors"
                />
              </div>
              <button type="submit" disabled={!input.trim() || isLoading} className="w-11 h-11 rounded-full bg-[#7c3aed] text-white flex items-center justify-center hover:bg-[#6d28d9] disabled:opacity-40 transition-colors shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)]">
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 text-[10px] font-mono text-zinc-400 text-center">Private per user • Free: Gemini 15 RPM + Groq 14.4k/day + Puter.js unlimited</div>
          </div>
        </div>
      )}
    </>
  );
}
