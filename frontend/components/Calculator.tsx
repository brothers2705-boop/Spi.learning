'use client';
import { useState, useEffect } from 'react';
import { X, Copy, Check, History } from 'lucide-react';

interface CalcHistory { expr: string; result: string; }

export function Calculator({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [history, setHistory] = useState<CalcHistory[]>([]);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') inputNum(e.key);
      if (e.key === '.') inputDot();
      if (e.key === '+' || e.key === '-') performOp(e.key);
      if (e.key === '*') performOp('×');
      if (e.key === '/') { e.preventDefault(); performOp('÷'); }
      if (e.key === 'Enter' || e.key === '=') performOp('=');
      if (e.key === 'Escape') clear();
      if (e.key === 'Backspace') handleBackspace();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [display, prev, op, waiting]);

  const inputNum = (num: string) => {
    if (waiting) { setDisplay(num); setWaiting(false); }
    else { setDisplay(display === '0' ? num : display + num); }
  };
  const inputDot = () => {
    if (waiting) { setDisplay('0.'); setWaiting(false); return; }
    if (display.indexOf('.') === -1) setDisplay(display + '.');
  };
  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); setWaiting(false); };
  const handleBackspace = () => {
    if (waiting) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };
  const copyResult = async () => {
    await navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const performOp = (nextOp: string) => {
    const input = parseFloat(display);
    if (prev === null) {
      setPrev(display);
    } else if (op) {
      const prevVal = parseFloat(prev);
      let result = 0; let expr = '';
      switch (op) {
        case '+': result = prevVal + input; expr = `${prev} + ${input}`; break;
        case '-': result = prevVal - input; expr = `${prev} - ${input}`; break;
        case '×': result = prevVal * input; expr = `${prev} × ${input}`; break;
        case '÷': result = prevVal / input; expr = `${prev} ÷ ${input}`; break;
      }
      const resultStr = String(Number(result.toFixed(8))).slice(0, 12);
      setHistory(h => [{ expr, result: resultStr }, ...h].slice(0, 10));
      setDisplay(resultStr);
      setPrev(resultStr);
    }
    setWaiting(true);
    setOp(nextOp === '=' ? null : nextOp);
    if (nextOp === '=') { setPrev(null); }
  };

  const handleFunc = (fn: string) => {
    const val = parseFloat(display);
    let result = val; let expr = '';
    switch (fn) {
      case '√': result = Math.sqrt(val); expr = `√${val}`; break;
      case 'x²': result = val * val; expr = `${val}²`; break;
      case '%': result = val / 100; expr = `${val}%`; break;
      case '±': result = -val; expr = `±${val}`; break;
    }
    const resultStr = String(Number(result.toFixed(8))).slice(0, 12);
    if (expr) setHistory(h => [{ expr, result: resultStr }, ...h].slice(0, 10));
    setDisplay(resultStr);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fcfcf9]/80 backdrop-blur-[12px] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] border border-zinc-200 w-full max-w-[320px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-[48px] px-4 flex items-center justify-between border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[10px] bg-zinc-900 flex items-center justify-center text-white text-[11px] font-[700]">C</div>
            <span className="text-[13px] font-[600]">Calculator</span>
            {history.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-zinc-100 text-[10px] font-mono">{history.length}</span>}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowHistory(!showHistory)} className={`w-7 h-7 rounded-full flex items-center justify-center ${showHistory ? 'bg-zinc-900 text-white' : 'bg-zinc-100 hover:bg-zinc-200'}`}>
              <History className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {showHistory && history.length > 0 ? (
          <div className="p-3 max-h-[320px] overflow-auto">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-mono font-[700] tracking-[0.08em] text-zinc-500">HISTORY</span>
              <button onClick={() => setHistory([])} className="text-[11px] font-[600] text-zinc-500 hover:text-zinc-900">Clear</button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <button key={i} onClick={() => { setDisplay(h.result); setShowHistory(false); }} className="w-full text-left px-3 py-2 rounded-[10px] hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-colors">
                  <div className="text-[11px] font-mono text-zinc-500">{h.expr}</div>
                  <div className="font-mono text-[14px] font-[600]">= {h.result}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3.5">
            <div className="bg-zinc-900 rounded-[12px] p-4 mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-white/40">{prev ? `${prev} ${op || ''}` : 'READY'}</span>
                <button onClick={copyResult} className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                  {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-white/60" />}
                </button>
              </div>
              <div className="text-right font-mono text-[28px] font-[600] text-white leading-none truncate">{display}</div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-1.5">
              {[
                { l: '√', fn: () => handleFunc('√') },
                { l: 'x²', fn: () => handleFunc('x²') },
                { l: '%', fn: () => handleFunc('%') },
                { l: '±', fn: () => handleFunc('±') },
              ].map((b, i) => (
                <button key={i} onClick={b.fn} className="h-8 rounded-[10px] bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-[12px] font-mono font-[600]">{b.l}</button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { l: 'C', fn: clear, c: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600' },
                { l: '⌫', fn: handleBackspace, c: 'bg-zinc-100 hover:bg-zinc-200' },
                { l: '%', fn: () => handleFunc('%'), c: 'bg-zinc-100 hover:bg-zinc-200' },
                { l: '÷', fn: () => performOp('÷'), c: 'bg-zinc-900 text-white hover:bg-black', active: op === '÷' },
                { l: '7', fn: () => inputNum('7'), c: 'bg-white border border-zinc-200 hover:border-zinc-900' },
                { l: '8', fn: () => inputNum('8'), c: 'bg-white border border-zinc-200 hover:border-zinc-900' },
                { l: '9', fn: () => inputNum('9'), c: 'bg-white border border-zinc-200 hover:border-zinc-900' },
                { l: '×', fn: () => performOp('×'), c: 'bg-zinc-900 text-white hover:bg-black', active: op === '×' },
                { l: '4', fn: () => inputNum('4'), c: 'bg-white border border-zinc-200 hover:border-zinc-900' },
                { l: '5', fn: () => inputNum('5'), c: 'bg-white border border-zinc-200 hover:border-zinc-900' },
                { l: '6', fn: () => inputNum('6'), c: 'bg-white border border-zinc-200 hover:border-zinc-900' },
                { l: '-', fn: () => performOp('-'), c: 'bg-zinc-900 text-white hover:bg-black', active: op === '-' },
                { l: '1', fn: () => inputNum('1'), c: 'bg-white border border-zinc-200 hover:border-zinc-900' },
                { l: '2', fn: () => inputNum('2'), c: 'bg-white border border-zinc-200 hover:border-zinc-900' },
                { l: '3', fn: () => inputNum('3'), c: 'bg-white border border-zinc-200 hover:border-zinc-900' },
                { l: '+', fn: () => performOp('+'), c: 'bg-zinc-900 text-white hover:bg-black', active: op === '+' },
                { l: '0', fn: () => inputNum('0'), c: 'bg-white border border-zinc-200 hover:border-zinc-900 col-span-2' },
                { l: '.', fn: inputDot, c: 'bg-white border border-zinc-200 hover:border-zinc-900' },
                { l: '=', fn: () => performOp('='), c: 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]' },
              ].map((b: any, i) => (
                <button key={i} onClick={b.fn} className={`h-[44px] rounded-[10px] font-[600] text-[15px] flex items-center justify-center active:scale-[0.98] transition-colors ${b.c} ${b.active ? 'ring-2 ring-zinc-900 ring-offset-1' : ''}`}>{b.l}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
