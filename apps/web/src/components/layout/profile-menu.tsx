'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Bookmark, Settings, ChevronDown, User } from 'lucide-react'

export function ProfileMenu() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!user) return null

  const displayName = user.fullName || user.username || 'User'
  const email = user.primaryEmailAddress?.emailAddress || ''

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl p-1 hover:bg-white/10 transition-all group"
        aria-label="Profile menu"
      >
        <div className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-primary/40 group-hover:ring-primary/70 transition-all flex-shrink-0">
          {user.imageUrl ? (
            <Image src={user.imageUrl} alt={displayName} fill className="object-cover" sizes="32px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary text-white font-bold text-sm">
              {displayName[0].toUpperCase()}
            </div>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-white/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-white/10 bg-zinc-900/98 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* User header */}
            <div className="p-4 bg-gradient-to-br from-primary/8 to-transparent border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-primary/50 flex-shrink-0">
                  {user.imageUrl ? (
                    <Image src={user.imageUrl} alt={displayName} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-white font-bold text-xl">
                      {displayName[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-base leading-tight truncate">{displayName}</p>
                  {email && (
                    <p className="text-zinc-400 text-sm mt-0.5 truncate">{email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              <Link
                href="/watchlist"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <Bookmark className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">My List</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <User className="h-4 w-4 text-white/50" />
                <span className="text-sm font-medium">Profile</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <Settings className="h-4 w-4 text-white/50" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </div>

            {/* Sign out */}
            <div className="p-2 border-t border-white/10">
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
