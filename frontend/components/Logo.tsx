'use client';

interface LogoProps {
  size?: 'small' | 'default' | 'large' | 'hero';
  variant?: 'default' | 'accent' | 'mono';
  showWordmark?: boolean;
  className?: string;
}

// Real custom logomark — video → structured notes/book
// Concept: Play-button shape morphing into folded page/bookmark corner
// - Document with folded corner (book/page)
// - Play triangle inside (video)
// - Two structured lines below (notes)
// Single-color, works at 16px favicon and 200px hero, scalable SVG
// Premium, not generic S-in-box
function LogoMark({ className = 'w-8 h-8', variant = 'default' }: { className?: string; variant?: 'default' | 'accent' | 'mono' }) {
  const colorClass = variant === 'accent' ? 'text-[#7c3aed]' : variant === 'mono' ? 'text-zinc-500' : 'text-zinc-900';
  
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${colorClass}`}
      aria-hidden="true"
    >
      {/* Document/page base with folded corner — represents book/course */}
      <path
        d="M7 2.5H20L27 9.5V29.5H7V2.5Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Folded corner line */}
      <path
        d="M20 2.5V9.5H27"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Fold fill subtle — shows page curl, premium detail */}
      <path
        d="M20 2.5L20 9.5L27 9.5L20 2.5Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Play triangle — video, morphs into page, centered */}
      <path
        d="M12.2 8.8V19.8L21.2 14.3L12.2 8.8Z"
        fill="currentColor"
      />
      {/* Structured notes lines — waveform resolving into text */}
      <path
        d="M11.5 23.5H21.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M11.5 26.5H17.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Alternative refined mark — open book with timestamp/play mark on spine
// Used for larger hero sizes where more detail is visible
function LogoMarkBook({ className = 'w-8 h-8', variant = 'default' }: { className?: string; variant?: 'default' | 'accent' | 'mono' }) {
  const colorClass = variant === 'accent' ? 'text-[#7c3aed]' : variant === 'mono' ? 'text-zinc-500' : 'text-zinc-900';
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} ${colorClass}`} aria-hidden="true">
      {/* Open book base */}
      <path d="M4 7C4 5.5 5 4.5 6.5 4.5H15.5V27.5H6.5C5 27.5 4 26.5 4 25V7Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" fill="none"/>
      <path d="M28 7C28 5.5 27 4.5 25.5 4.5H16.5V27.5H25.5C27 27.5 28 26.5 28 25V7Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" fill="none"/>
      {/* Spine with play mark */}
      <path d="M15.5 4.5V27.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
      {/* Play triangle on right page — timestamp mark */}
      <path d="M19.5 10.5V19.5L26 15L19.5 10.5Z" fill="currentColor"/>
      {/* Notes lines */}
      <path d="M7 21H13M19 21H25M7 24H11M19 24H23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function Logo({ size = 'default', variant = 'default', showWordmark = true, className = '' }: LogoProps) {
  const sizes = {
    small: { mark: 'w-7 h-7', text: 'text-[13px]', sub: 'text-[10px]', gap: 'gap-2' },
    default: { mark: 'w-8 h-8', text: 'text-[14px]', sub: 'text-[10px]', gap: 'gap-2.5' },
    large: { mark: 'w-10 h-10', text: 'text-[17px]', sub: 'text-[11px]', gap: 'gap-3' },
    hero: { mark: 'w-14 h-14', text: 'text-[22px]', sub: 'text-[12px]', gap: 'gap-3.5' },
  };
  const s = sizes[size];
  const useBookVariant = size === 'hero' || size === 'large';

  return (
    <div className={`flex items-center ${s.gap} select-none ${className}`}>
      {useBookVariant ? <LogoMarkBook className={s.mark} variant={variant} /> : <LogoMark className={s.mark} variant={variant} />}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-[700] tracking-[-0.03em] ${variant === 'accent' ? 'text-[#7c3aed]' : 'text-zinc-900'} ${s.text}`}>
            SPI LEARNING
          </span>
          <span className={`font-mono font-[500] tracking-[0.08em] text-zinc-500 ${s.sub} mt-[2px]`}>
            Free forever
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ className = 'w-8 h-8', variant = 'default' }: { className?: string; variant?: 'default' | 'accent' | 'mono' }) {
  return <LogoMark className={className} variant={variant} />;
}

export function LogoMarkOnly({ className = 'w-8 h-8', variant = 'default', book = false }: { className?: string; variant?: 'default' | 'accent' | 'mono'; book?: boolean }) {
  return book ? <LogoMarkBook className={className} variant={variant} /> : <LogoMark className={className} variant={variant} />;
}

// Raw SVG string for favicon generation, OG image, etc.
export const LOGO_SVG_RAW = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2.5H20L27 9.5V29.5H7V2.5Z" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round" fill="none"/><path d="M20 2.5V9.5H27" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round" fill="none"/><path d="M20 2.5L20 9.5L27 9.5L20 2.5Z" fill="currentColor" fill-opacity="0.12"/><path d="M12.2 8.8V19.8L21.2 14.3L12.2 8.8Z" fill="currentColor"/><path d="M11.5 23.5H21.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M11.5 26.5H17.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

export const LOGO_SVG_RAW_BOOK = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7C4 5.5 5 4.5 6.5 4.5H15.5V27.5H6.5C5 27.5 4 26.5 4 25V7Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" fill="none"/><path d="M28 7C28 5.5 27 4.5 25.5 4.5H16.5V27.5H25.5C27 27.5 28 26.5 28 25V7Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" fill="none"/><path d="M15.5 4.5V27.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M19.5 10.5V19.5L26 15L19.5 10.5Z" fill="currentColor"/><path d="M7 21H13M19 21H25M7 24H11M19 24H23" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
