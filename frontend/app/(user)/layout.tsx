import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SPI LEARNING - Lecture to study notes, instantly.',
  description: 'Turn long YouTube lectures into complete, organized university-level study notes.',
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen antialiased font-sans bg-[#fcfcf9] text-zinc-900">
      {children}
    </div>
  )
}
