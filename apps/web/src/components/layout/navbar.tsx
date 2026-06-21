'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { Search, Bell, Menu, X, Film, Sparkles, ChevronDown, Tv } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useUIStore } from '../../store/ui-store'
import { SearchModal } from '../search/search-modal'
import { AIModal } from '../search/ai-modal'
import { ProfileMenu } from './profile-menu'

const authNavLinks = [
  { href: '/trending', label: 'Trending' },
  { href: '/watchlist', label: 'My List' },
]

const publicNavLinks = [
  { href: '/trending', label: 'Trending' },
]

export function Navbar() {
  const pathname = usePathname()
  const { isSignedIn } = useAuth()
  const { searchOpen, setSearchOpen, aiOpen, setAiOpen, mobileMenuOpen, setMobileMenuOpen } = useUIStore()
  const [scrolled, setScrolled] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)
  const browseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setSearchOpen])

  // Close browse dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (browseRef.current && !browseRef.current.contains(e.target as Node)) {
        setBrowseOpen(false)
      }
    }
    if (browseOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [browseOpen])

  const navLinks = isSignedIn ? authNavLinks : publicNavLinks

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-white/5 shadow-2xl'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
                <Film className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Cine<span className="text-primary">scape</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Browse dropdown */}
              <div ref={browseRef} className="relative">
                <button
                  onClick={() => setBrowseOpen(!browseOpen)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    browseOpen ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  Browse
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', browseOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {browseOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-zinc-900/98 backdrop-blur-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-2">
                        <p className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Content</p>
                        <Link
                          href="/movies"
                          onClick={() => setBrowseOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/8 transition-all group"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 group-hover:bg-primary/25 transition-colors flex-shrink-0">
                            <Film className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Movies</p>
                            <p className="text-xs text-white/40">Browse all films by genre</p>
                          </div>
                        </Link>
                        <Link
                          href="/tv"
                          onClick={() => setBrowseOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/8 transition-all group"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 group-hover:bg-primary/25 transition-colors flex-shrink-0">
                            <Tv className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">TV Shows</p>
                            <p className="text-xs text-white/40">Series, mini-series & more</p>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    pathname === link.href
                      ? 'text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  {pathname === link.href && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-white/10"
                      transition={{ type: 'spring', duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:block text-xs text-white/40 font-medium">Search</span>
              </button>

              {/* AI Discover button */}
              <button
                onClick={() => setAiOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-primary hover:text-primary/80 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all duration-200"
                aria-label="AI Discovery"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:block text-xs font-semibold">AI</span>
              </button>

              {isSignedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <Bell className="h-4 w-4" />
                  </Link>
                  <ProfileMenu />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-4 py-2 text-sm font-bold rounded-lg bg-primary hover:bg-primary/90 text-white transition-all active:scale-95"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl"
            >
              <nav className="px-4 py-4 flex flex-col gap-1">
                <Link href="/movies" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                  <Film className="h-4 w-4" /> Movies
                </Link>
                <Link href="/tv" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                  <Tv className="h-4 w-4" /> TV Shows
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-3 rounded-lg text-sm font-medium transition-all',
                      pathname === link.href ? 'bg-primary/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <button onClick={() => { setSearchOpen(true); setMobileMenuOpen(false) }} className="px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all text-left flex items-center gap-2">
                  <Search className="h-4 w-4" /> Search
                </button>
                <button onClick={() => { setAiOpen(true); setMobileMenuOpen(false) }} className="px-4 py-3 rounded-lg text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 transition-all text-left flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> AI Discovery
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AIModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  )
}
