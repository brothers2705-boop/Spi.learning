import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SPI LEARNING - Lecture to study notes, instantly.',
  description: 'Turn long YouTube lectures into complete, organized university-level study notes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
