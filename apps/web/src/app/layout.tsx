import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { QueryProvider } from '../components/providers/query-provider'
import { ThemeProvider } from '../components/providers/theme-provider'
import { Toaster } from '../components/ui/toaster'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: {
    default: 'Cinescape — Discover Movies & TV Shows',
    template: '%s | Cinescape',
  },
  description:
    'Cinescape is a premium movie and TV discovery platform. Find trending movies, popular TV shows, and stream your favorites.',
  keywords: ['movies', 'tv shows', 'streaming', 'discovery', 'watchlist'],
  authors: [{ name: 'Cinescape' }],
  creator: 'Cinescape',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cinescape.app',
    siteName: 'Cinescape',
    title: 'Cinescape — Discover Movies & TV Shows',
    description: 'Premium movie and TV discovery platform',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cinescape',
    description: 'Premium movie and TV discovery platform',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#3b9eff',
          colorBackground: '#060c18',
          colorText: '#fafafa',
          colorInputBackground: '#1c1c1e',
          colorInputText: '#fafafa',
          colorTextSecondary: '#a1a1aa',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'bg-zinc-900 border border-zinc-800 shadow-2xl',
          headerTitle: 'text-white',
          headerSubtitle: 'text-zinc-400',
          formFieldLabel: 'text-zinc-300',
          formFieldInput: 'bg-zinc-800 border-zinc-700 text-white',
          footerActionLink: 'text-red-500 hover:text-red-400',
          identityPreviewText: 'text-zinc-300',
          identityPreviewEditButton: 'text-red-500',
          socialButtonsBlockButton: 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white',
          socialButtonsBlockButtonText: 'text-white font-medium',
          socialButtonsBlockButtonArrow: 'text-white',
          dividerLine: 'bg-zinc-700',
          dividerText: 'text-zinc-400',
        },
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${mono.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen bg-background font-sans antialiased">
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
