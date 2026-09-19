'use client';

export function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizes = {
    small: { box: 'w-7 h-7 rounded-[8px] text-[12px]', text: 'text-[13px]', sub: 'text-[10px]' },
    default: { box: 'w-8 h-8 rounded-[10px] text-[14px]', text: 'text-[14px]', sub: 'text-[11px]' },
    large: { box: 'w-10 h-10 rounded-[12px] text-[18px]', text: 'text-[18px]', sub: 'text-[12px]' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`${s.box} bg-zinc-900 flex items-center justify-center`}>
        <span className={`font-display font-[700] tracking-[-0.02em] text-white leading-none ${s.box.includes('w-7') ? 'text-[12px]' : s.box.includes('w-8') ? 'text-[13px]' : 'text-[16px]'}`}>S</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-display font-[700] tracking-[-0.02em] text-zinc-900 ${s.text}`}>SPI LEARNING</span>
        <span className={`font-mono font-[500] tracking-[0.08em] text-zinc-500 ${s.sub} mt-[2px]`}>Free forever</span>
      </div>
    </div>
  );
}

export function LogoIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`${className} rounded-[10px] bg-zinc-900 flex items-center justify-center`}>
      <span className="font-display font-[700] text-white text-[13px] leading-none">S</span>
    </div>
  );
}
