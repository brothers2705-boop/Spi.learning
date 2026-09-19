'use client';
import { useState, useEffect, useRef } from 'react';
import { Music, Play, AlertCircle, Trash2, ExternalLink, Headphones, RefreshCw } from 'lucide-react';
import { userStorage } from '@/lib/user';

type SpotifyType = 'playlist' | 'album' | 'track' | 'artist' | 'episode' | 'show';
interface ParsedSpotify { type: SpotifyType; id: string; originalUrl: string; }

function parseSpotifyUrl(input: string): ParsedSpotify | null {
  try {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const url = new URL(trimmed);
    if (!url.hostname.toLowerCase().includes('spotify.com')) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const type = parts[0] as SpotifyType;
    const id = parts[1].split('?')[0].split('#')[0];
    const allowed: SpotifyType[] = ['playlist','album','track','artist','episode','show'];
    if (!allowed.includes(type)) return null;
    if (!/^[a-zA-Z0-9]{10,32}$/.test(id)) return null;
    return { type, id, originalUrl: trimmed };
  } catch { return null; }
}
function buildEmbedUrl(p: ParsedSpotify): string {
  return `https://open.spotify.com/embed/${p.type}/${p.id}?utm_source=generator&theme=0`;
}

export function SpotifyEmbed() {
  const [inputUrl, setInputUrl] = useState('');
  const [current, setCurrent] = useState<ParsedSpotify | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storageKey, setStorageKey] = useState('spi_spotify_default');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = userStorage.getCurrentUser();
    const keys = userStorage.getUserDataKeys(user?.id || 'default');
    setStorageKey(keys.spotify);
    const last = localStorage.getItem(keys.spotify) || localStorage.getItem('spi_last_spotify_url');
    if (last) {
      const parsed = parseSpotifyUrl(last);
      if (parsed) { setInputUrl(last); setCurrent(parsed); }
    }
  }, []);

  const handlePlay = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputUrl.trim()) { setError('Paste a Spotify link first'); return; }
    const parsed = parseSpotifyUrl(inputUrl);
    if (!parsed) { setError('Only open.spotify.com links allowed'); return; }
    setIsLoading(true); setError(null);
    setCurrent(parsed);
    localStorage.setItem(storageKey, parsed.originalUrl);
    localStorage.setItem('spi_last_spotify_url', parsed.originalUrl);
    setIsLoading(false);
  };

  const handleChange = () => {
    setCurrent(null); setInputUrl(''); setError(null);
    localStorage.removeItem(storageKey);
    localStorage.removeItem('spi_last_spotify_url');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const getHeight = (t: SpotifyType) => (t === 'track' || t === 'episode' ? 152 : 380);

  return (
    <div className="w-full max-w-[640px] mx-auto">
      <div className="bg-white rounded-[16px] border border-zinc-200 overflow-hidden">
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-zinc-900 flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-[700] text-[13px] tracking-[-0.01em] text-zinc-900">Study music</div>
                <div className="text-[11px] text-zinc-500 font-[450] mt-0.5">Any playlist • Instant • Private</div>
              </div>
            </div>
            {current && (
              <button onClick={handleChange} className="h-7 px-3 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] font-[600] hover:border-zinc-900 transition-colors">
                <RefreshCw className="w-3 h-3 inline mr-1" /> Change
              </button>
            )}
          </div>

          <div className="mt-5">
            <form onSubmit={handlePlay} className="flex items-center gap-2 p-1 rounded-full bg-white border border-zinc-200">
              <div className="flex-1 flex items-center gap-2.5 pl-3 min-w-0">
                <Headphones className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={inputUrl}
                  onChange={(e) => { setInputUrl(e.target.value); setError(null); }}
                  placeholder="open.spotify.com/playlist/..."
                  className="flex-1 h-8 bg-transparent text-[13px] font-[500] outline-none placeholder:text-zinc-400 min-w-0 truncate"
                />
                {inputUrl && (
                  <button type="button" onClick={() => { setInputUrl(''); setError(null); inputRef.current?.focus(); }} className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center mr-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button type="submit" disabled={isLoading} className="h-8 px-4 rounded-full bg-zinc-900 text-white text-[12px] font-[600] flex items-center gap-1.5 hover:bg-black disabled:opacity-50">
                {isLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                {current ? 'Update' : 'Play'}
              </button>
            </form>

            {error && (
              <div className="mt-2.5 flex gap-2 p-2.5 rounded-[10px] bg-zinc-50 border border-zinc-200">
                <AlertCircle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                <span className="text-[12px] font-[500] text-zinc-700 leading-[1.4]">{error}</span>
              </div>
            )}
          </div>
        </div>

        {current ? (
          <div className="border-t border-zinc-100 p-2.5 bg-[#fcfcf9]">
            <div className="rounded-[10px] overflow-hidden bg-black p-1.5">
              <iframe
                key={`${current.type}-${current.id}`}
                src={buildEmbedUrl(current)}
                width="100%"
                height={getHeight(current.type)}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-[8px] w-full block"
                title={`Spotify ${current.type}`}
              />
            </div>
            <div className="flex items-center justify-between mt-2.5 px-1">
              <span className="text-[11px] font-mono text-zinc-500 truncate">{current.type} • {current.id.slice(0,8)}... • Private</span>
              <a href={current.originalUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-[500] text-zinc-500 hover:text-zinc-900 flex items-center gap-1">Open <ExternalLink className="w-3 h-3" /></a>
            </div>
          </div>
        ) : (
          <div className="border-t border-zinc-100 p-4 bg-[#fcfcf9]/50">
            <div className="rounded-[12px] border border-zinc-200 bg-white p-6 text-center">
              <div className="w-8 h-8 rounded-[10px] bg-zinc-900 flex items-center justify-center mx-auto mb-3">
                <Music className="w-4 h-4 text-white" />
              </div>
              <div className="font-[600] text-[13px]">Drop a Spotify link</div>
              <div className="text-[11px] text-zinc-500 mt-1">Playlist, album, or track • Plays instantly • Private</div>
              <div className="mt-4 flex justify-center gap-1.5">
                {[
                  { t: 'Lo-Fi', id: '37i9dQZF1DWWQRwui0ExPn' },
                  { t: 'Focus', id: '37i9dQZF1DWZeKCadgRdKQ' },
                ].map(p => (
                  <button key={p.id} onClick={() => { const url = `https://open.spotify.com/playlist/${p.id}`; setInputUrl(url); }} className="px-2.5 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-[600] hover:bg-black">
                    {p.t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
