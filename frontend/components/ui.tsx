'use client';
import { ReactNode } from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}: { 
  children: ReactNode; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: any;
}) {
  const base = 'inline-flex items-center justify-center font-[700] rounded-full transition-colors touch-manipulation active:scale-[0.98] disabled:opacity-40';
  const sizes = {
    sm: 'h-8 px-3 text-[12px]',
    md: 'h-10 px-5 text-[13px]',
    lg: 'h-11 px-6 text-[14px]',
  };
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-black',
    secondary: 'bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200 hover:border-zinc-900',
    ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
    accent: 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-[0_4px_14px_-2px_rgba(124,58,237,0.4)]',
    outline: 'bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-900',
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export function Card({ children, className = '', hover = true, ...props }: { children: ReactNode; className?: string; hover?: boolean; [key: string]: any }) {
  return (
    <div className={`bg-white border border-zinc-200 rounded-[16px] ${hover ? 'hover:border-zinc-900 hover:shadow-sm' : ''} transition-colors ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '', ...props }: { children: ReactNode; variant?: 'default' | 'accent' | 'success' | 'warning' | 'outline'; className?: string; [key: string]: any }) {
  const variants = {
    default: 'bg-zinc-900 text-white',
    accent: 'bg-[#7c3aed] text-white',
    success: 'bg-zinc-900 text-white',
    warning: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
    outline: 'bg-white border border-zinc-200 text-zinc-700',
  };
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-[600] ${variants[variant]} ${className}`} {...props}>{children}</span>;
}

export function Input({ className = '', ...props }: { className?: string; [key: string]: any }) {
  return <input className={`h-10 px-4 rounded-full bg-white border border-zinc-200 text-[13px] font-[500] outline-none focus:border-zinc-900 placeholder:text-zinc-400 transition-colors ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }: { className?: string; [key: string]: any }) {
  return <textarea className={`px-4 py-3 rounded-[16px] bg-white border border-zinc-200 text-[13px] font-[500] outline-none focus:border-zinc-900 placeholder:text-zinc-400 transition-colors ${className}`} {...props} />;
}

export function AdminCard({ children, className = '', ...props }: { children: ReactNode; className?: string; [key: string]: any }) {
  return <div className={`bg-white border border-zinc-200 rounded-[16px] ${className}`} {...props}>{children}</div>;
}

export function AdminBadge({ children, variant = 'default', className = '' }: { children: ReactNode; variant?: 'default' | 'accent' | 'success' | 'warning'; className?: string }) {
  const variants = {
    default: 'bg-zinc-900 text-white',
    accent: 'bg-[#7c3aed] text-white',
    success: 'bg-zinc-900 text-white',
    warning: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[700] ${variants[variant]} ${className}`}>{children}</span>;
}
