import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SPI LEARNING — Admin Panel',
  description: 'Admin panel — separate auth, real jobs data, protected API',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen antialiased font-sans bg-[#fcfcf9] text-zinc-900">
      {children}
    </div>
  )
}
