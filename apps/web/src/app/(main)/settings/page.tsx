'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  User,
  Palette,
  Play,
  Bell,
  Shield,
  Trash2,
  ChevronRight,
  Monitor,
  Volume2,
  Subtitles,
} from 'lucide-react'
import { userApi } from '../../../lib/api-client'
import { usePlayerStore } from '../../../store/player-store'
import { cn } from '../../../lib/utils'

const ACCENT_COLORS = [
  { value: 'e50914', label: 'Netflix Red', hex: '#e50914' },
  { value: '0284c7', label: 'Sky Blue', hex: '#0284c7' },
  { value: '7c3aed', label: 'Violet', hex: '#7c3aed' },
  { value: 'dc2626', label: 'Red', hex: '#dc2626' },
  { value: '16a34a', label: 'Green', hex: '#16a34a' },
  { value: 'ea580c', label: 'Orange', hex: '#ea580c' },
  { value: 'db2777', label: 'Pink', hex: '#db2777' },
  { value: 'ca8a04', label: 'Yellow', hex: '#ca8a04' },
]

type Section = 'appearance' | 'playback' | 'account' | 'notifications' | 'privacy'

export default function SettingsPage() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const { accentColor, setAccentColor, autoPlayNext, setAutoPlayNext } = usePlayerStore()
  const [activeSection, setActiveSection] = useState<Section>('appearance')

  const { data: settings } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return null
      return userApi.getSettings(token)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const token = await getToken()
      if (!token) throw new Error('Unauthorized')
      return userApi.updateSettings(token, payload)
    },
    onSuccess: () => {
      toast.success('Settings saved')
      queryClient.invalidateQueries({ queryKey: ['user-settings'] })
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'playback', label: 'Playback', icon: Play },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black gradient-text mb-1">Settings</h1>
          <p className="text-sm text-white/40">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar nav */}
          <nav className="w-full lg:w-56 flex-shrink-0">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                      activeSection === item.id
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                    {activeSection === item.id && (
                      <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Panel */}
          <div className="flex-1 min-w-0">
            {activeSection === 'appearance' && (
              <SettingsPanel title="Appearance">
                <SettingsSection title="Accent Color">
                  <p className="text-sm text-white/40 mb-4">
                    Choose a color for the player controls and highlights.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {ACCENT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setAccentColor(color.value)}
                        title={color.label}
                        className={cn(
                          'relative w-9 h-9 rounded-full transition-all',
                          accentColor === color.value
                            ? 'ring-2 ring-offset-2 ring-offset-background ring-white scale-110'
                            : 'hover:scale-110'
                        )}
                        style={{ backgroundColor: color.hex }}
                      >
                        {accentColor === color.value && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-white/30 mt-3">
                    Current: <code className="text-primary">#{accentColor}</code>
                  </p>
                </SettingsSection>

                <SettingsSection title="Interface">
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">Dark Mode</p>
                      <p className="text-xs text-white/40">WatchBlitz always uses dark mode for the best cinematic experience</p>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40">
                      Always on
                    </div>
                  </div>
                </SettingsSection>
              </SettingsPanel>
            )}

            {activeSection === 'playback' && (
              <SettingsPanel title="Playback">
                <SettingsSection title="Player">
                  <ToggleSetting
                    label="Auto-play next episode"
                    description="Automatically play the next episode when one ends"
                    checked={autoPlayNext}
                    onChange={() => setAutoPlayNext(!autoPlayNext)}
                  />
                  <ToggleSetting
                    label="Theater mode by default"
                    description="Open the player in theater mode automatically"
                    checked={(settings as { theaterMode?: boolean } | null)?.theaterMode ?? false}
                    onChange={(v) => updateMutation.mutate({ theaterMode: v })}
                  />
                </SettingsSection>

                <SettingsSection title="Video Quality">
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Monitor className="h-4 w-4" />
                    Video quality is managed automatically by the player for optimal performance.
                  </div>
                </SettingsSection>
              </SettingsPanel>
            )}

            {activeSection === 'account' && (
              <SettingsPanel title="Account">
                <SettingsSection title="Profile">
                  <p className="text-sm text-white/40 mb-4">
                    Manage your profile through Clerk's user portal.
                  </p>
                  <a
                    href="/user"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                  >
                    <User className="h-4 w-4" /> Edit Profile
                  </a>
                </SettingsSection>

                <SettingsSection title="Watch History">
                  <p className="text-sm text-white/40 mb-4">
                    Clear your entire watch history and progress data. This action cannot be undone.
                  </p>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                    onClick={() => {
                      if (confirm('Clear all watch history? This cannot be undone.')) {
                        toast.info('Watch history cleared')
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Clear Watch History
                  </button>
                </SettingsSection>

                <SettingsSection title="Delete Account">
                  <p className="text-sm text-white/40 mb-4">
                    Permanently delete your WatchBlitz account and all associated data. This action is irreversible.
                  </p>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                    onClick={() => toast.error('Please contact support to delete your account')}
                  >
                    <Trash2 className="h-4 w-4" /> Delete Account
                  </button>
                </SettingsSection>
              </SettingsPanel>
            )}

            {activeSection === 'notifications' && (
              <SettingsPanel title="Notifications">
                <SettingsSection title="Email Notifications">
                  <ToggleSetting
                    label="New releases"
                    description="Get notified when new movies or shows are added from your watchlist"
                    checked={(settings as { emailNotifications?: boolean } | null)?.emailNotifications ?? true}
                    onChange={(v) => updateMutation.mutate({ emailNotifications: v })}
                  />
                  <ToggleSetting
                    label="Recommendations"
                    description="Receive personalized movie and show recommendations"
                    checked={(settings as { emailRecommendations?: boolean } | null)?.emailRecommendations ?? false}
                    onChange={(v) => updateMutation.mutate({ emailRecommendations: v })}
                  />
                </SettingsSection>
              </SettingsPanel>
            )}

            {activeSection === 'privacy' && (
              <SettingsPanel title="Privacy & Security">
                <SettingsSection title="Data & Privacy">
                  <ToggleSetting
                    label="Analytics"
                    description="Share anonymous usage data to help improve WatchBlitz"
                    checked={(settings as { analytics?: boolean } | null)?.analytics ?? true}
                    onChange={(v) => updateMutation.mutate({ analytics: v })}
                  />
                </SettingsSection>

                <SettingsSection title="Session">
                  <p className="text-sm text-white/40 mb-4">
                    Sessions are managed securely by Clerk. You can view and revoke active sessions from your account dashboard.
                  </p>
                </SettingsSection>
              </SettingsPanel>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={title}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">{title}</h2>
      {children}
    </motion.div>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-white/40 mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative flex-shrink-0 h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          checked ? 'bg-primary' : 'bg-white/20'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
