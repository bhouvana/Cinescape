import Link from 'next/link'
import { Film } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/50 py-12 mt-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Film className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-lg font-black text-white">
                Cine<span className="text-primary">scape</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 max-w-xs">
              Discover and stream your favorite movies and TV shows. A metadata-driven platform powered by TMDB.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Browse</h3>
            <ul className="space-y-2">
              {[
                { href: '/movies', label: 'Movies' },
                { href: '/tv', label: 'TV Shows' },
                { href: '/trending', label: 'Trending' },
                { href: '/search', label: 'Search' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2">
              {[
                { href: '/profile', label: 'Profile' },
                { href: '/watchlist', label: 'Watchlist' },
                { href: '/settings', label: 'Settings' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Info</h3>
            <p className="text-xs text-white/30 leading-relaxed">
              Movie and TV data provided by{' '}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                TMDB
              </a>
              . This product uses the TMDB API but is not endorsed by TMDB.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Cinescape. For entertainment discovery only.
          </p>
          <div className="flex items-center gap-1">
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              alt="TMDB"
              className="h-3 opacity-40"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
