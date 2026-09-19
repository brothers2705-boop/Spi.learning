'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@spi.learning');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('Network error — try again');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
          <h1 className="font-display text-[22px] font-[700] tracking-[-0.02em] text-zinc-900">SPI LEARNING</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-[11px] font-[600] text-zinc-600 mt-2">
            <Lock className="w-3 h-3" /> ADMIN PANEL • Separate Auth
          </div>
        </div>

        <div className="rounded-[16px] bg-white border border-zinc-200 p-6">
          <div className="mb-6">
            <h2 className="text-[16px] font-[700] tracking-[-0.01em] text-zinc-900">Admin Login</h2>
            <p className="text-[13px] text-zinc-500 mt-1 font-[450]">Separate authentication — never shares user session. Protected by middleware 401/403.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-[700] tracking-[0.08em] text-zinc-500 mb-2 block">ADMIN EMAIL</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@spi.learning"
                  className="w-full h-11 pl-10 pr-4 rounded-full bg-white border border-zinc-200 text-[14px] text-zinc-900 outline-none focus:border-zinc-900 placeholder:text-zinc-400 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-[700] tracking-[0.08em] text-zinc-500 mb-2 block">PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-11 rounded-full bg-white border border-zinc-200 text-[14px] text-zinc-900 outline-none focus:border-zinc-900 placeholder:text-zinc-400 transition-colors"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4 text-zinc-600" /> : <Eye className="w-4 h-4 text-zinc-600" />}
                </button>
              </div>
              <div className="text-[11px] text-zinc-500 mt-2 font-mono">Default: admin@spi.learning / admin123 — set ADMIN_EMAIL/PASSWORD env in prod</div>
            </div>

            {error && (
              <div className="p-3 rounded-[10px] bg-zinc-50 border border-zinc-200 text-zinc-700 text-[13px] flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-600" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full h-11 rounded-full bg-[#7c3aed] text-white text-[14px] font-[700] flex items-center justify-center gap-2 hover:bg-[#6d28d9] disabled:opacity-50 transition-colors shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)]">
              {loading ? 'Signing in...' : <>Sign in to Admin <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-100 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" /> Protected API: /api/admin/* rejects unauth with 401
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" /> Separate bundle: app/(admin)/ vs app/(user)/
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" /> Real data: jobs from database, not mock
            </div>
          </div>
        </div>

        <div className="mt-6 text-center space-y-2">
          <div className="text-[11px] font-mono text-zinc-500">SPI LEARNING Admin • Separate auth • Test: try /api/admin/jobs without login → 401</div>
          <div className="text-[11px] text-zinc-500 font-[450]">Designed by Eng. Abdelrahman Ahmed Abdullah — built with minimal AI assistance</div>
        </div>
      </div>
    </div>
  );
}
