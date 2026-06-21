'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, Play, BookMarked, Zap, ChevronRight, Star, Film, Tv, Search } from 'lucide-react'
import { moviesApi } from '../../lib/api-client'
import { buildPosterUrl } from '../../lib/utils'

const DEMO_QUERIES = [
  'suspense thriller movies with plot twists',
  'feel-good comedies for a lazy Sunday',
  'dark crime drama series like Breaking Bad',
  'romantic movies that will make me cry',
  'scary horror movies for tonight',
  'epic sci-fi adventures in space',
]

function PosterStrip({
  posters,
  direction = 1,
  speed = 30,
}: {
  posters: string[]
  direction?: 1 | -1
  speed?: number
}) {
  const doubled = [...posters, ...posters]
  return (
    <div className="flex gap-3 overflow-hidden">
      <motion.div
        className="flex gap-3 flex-shrink-0"
        animate={{ x: direction === 1 ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 w-28 sm:w-36 aspect-[2/3] rounded-lg overflow-hidden ring-1 ring-white/10"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="144px"
              unoptimized
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function LandingPage() {
  const [posters, setPosters] = useState<string[][]>([[], [], []])
  const [demoIndex, setDemoIndex] = useState(0)
  const [aiQuery, setAiQuery] = useState('')
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef })
  const posterOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const posterY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  useEffect(() => {
    moviesApi.getTrending('week', 1).then((data) => {
      const urls = data.results
        .slice(0, 30)
        .map((m) => buildPosterUrl(m.poster_path, 'w342'))
        .filter(Boolean) as string[]
      setPosters([
        urls.slice(0, 10),
        urls.slice(10, 20),
        urls.slice(20, 30),
      ])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const id = setInterval(() => setDemoIndex((i) => (i + 1) % DEMO_QUERIES.length), 3000)
    return () => clearInterval(id)
  }, [])

  const features = [
    {
      icon: Film,
      title: 'Millions of titles',
      desc: 'Every movie and TV show imaginable, from new releases to timeless classics.',
    },
    {
      icon: Sparkles,
      title: 'AI-powered discovery',
      desc: 'Just describe what you\'re in the mood for. Our AI finds the perfect match.',
    },
    {
      icon: BookMarked,
      title: 'Your personal watchlist',
      desc: 'Save anything to watch later. Picks up where you left off, every time.',
    },
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ───── HERO ───── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Poster strips — parallax background */}
        <motion.div
          style={{ opacity: posterOpacity, y: posterY }}
          className="absolute inset-0 flex flex-col gap-4 justify-center py-8 pointer-events-none select-none"
        >
          {posters[0] && posters[0].length > 0 && (
            <PosterStrip posters={posters[0]} direction={1} speed={40} />
          )}
          {posters[1] && posters[1].length > 0 && (
            <PosterStrip posters={posters[1]} direction={-1} speed={35} />
          )}
          {posters[2] && posters[2].length > 0 && (
            <PosterStrip posters={posters[2]} direction={1} speed={45} />
          )}
          {/* Gradient overlays to blend edges */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
        </motion.div>

        {/* Dark veil over the posters */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered Discovery
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black text-white mb-6 leading-[1.05]"
          >
            Cinema{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-orange-400">
              without
            </span>
            <br />
            limits.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Discover millions of movies and TV shows. Tell our AI exactly what
            you're in the mood for and get perfect recommendations instantly.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/sign-up"
              className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black bg-primary hover:bg-primary/90 text-white transition-all active:scale-95 shadow-2xl shadow-primary/30"
            >
              <Play className="h-5 w-5 fill-white" />
              Start Watching Free
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              Sign in
              <ChevronRight className="h-5 w-5" />
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-6 text-sm text-white/30"
          >
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> Free forever</span>
            <span>·</span>
            <span>No credit card needed</span>
            <span>·</span>
            <span>500K+ titles</span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* ───── FEATURES ───── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-white mb-4">
              Everything you love about cinema,<br />
              <span className="text-primary">in one place.</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              No subscriptions. No complexity. Just great movies and shows.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── AI DISCOVERY SPOTLIGHT ───── */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
                <Sparkles className="h-3.5 w-3.5" /> AI Discovery
              </div>
              <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                Just tell us
                <br />
                what you feel like
                <br />
                <span className="text-primary">watching.</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-8">
                No more scrolling for hours. Describe your mood in plain language
                and our AI picks the perfect titles — instantly.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-all"
              >
                Try it free <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Demo panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/40">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <div className="h-3 w-3 rounded-full bg-green-500/70" />
                  <span className="ml-2 text-xs text-white/30 font-mono">Cinescape AI</span>
                </div>

                <div className="p-6">
                  {/* AI search input */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                    <motion.span
                      key={demoIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-white/80 text-sm"
                    >
                      {DEMO_QUERIES[demoIndex]}
                    </motion.span>
                  </div>

                  {/* Simulated results */}
                  <div className="space-y-3">
                    <p className="text-xs text-white/30 font-medium uppercase tracking-wider">AI Recommendations</p>
                    {[
                      { title: 'Parasite', year: '2019', rating: '8.5', type: 'Movie' },
                      { title: 'Gone Girl', year: '2014', rating: '8.1', type: 'Movie' },
                      { title: 'Knives Out', year: '2019', rating: '7.9', type: 'Movie' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                      >
                        <div className="h-12 w-8 rounded-md bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                          <Film className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="text-xs text-white/40">{item.year} · {item.type}</p>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-bold">{item.rating}</span>
                        </div>
                        <Play className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors flex-shrink-0" />
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-primary/80 flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      Showing critically acclaimed thrillers with unexpected twists and high audience ratings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500K+', label: 'Movies & Shows', icon: Film },
              { value: '4K', label: 'New this week', icon: Zap },
              { value: '∞', label: 'Free to browse', icon: Search },
              { value: '1', label: 'Click to watch', icon: Play },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl sm:text-5xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── GENRE PILLS ───── */}
      <section className="py-16 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-4">Every genre. Every mood.</h2>
          <p className="text-white/40">Whatever you're feeling, we have it.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {[
            '🎬 Action', '😂 Comedy', '😱 Horror', '💕 Romance',
            '🔍 Mystery', '🚀 Sci-Fi', '👨‍👩‍👧 Family', '📖 Drama',
            '🧩 Thriller', '⚔️ Fantasy', '🎵 Musical', '🌍 Documentary',
            '🕵️ Crime', '🤠 Western', '🧟 Dark', '✨ Animated',
          ].map((genre, i) => (
            <motion.div
              key={genre}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-primary/10 hover:border-primary/30 hover:text-white transition-all cursor-pointer"
            >
              {genre}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── FINAL CTA ───── */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
            Your next favourite<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
              watch is one click away.
            </span>
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Join Cinescape today. It's completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="px-10 py-4 rounded-xl text-lg font-black bg-primary hover:bg-primary/90 text-white transition-all active:scale-95 shadow-2xl shadow-primary/40 w-full sm:w-auto"
            >
              Get Started — It's Free
            </Link>
            <Link
              href="/sign-in"
              className="px-8 py-4 rounded-xl text-base font-semibold text-white/60 hover:text-white transition-colors"
            >
              Already have an account?
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
