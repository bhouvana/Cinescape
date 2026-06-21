<img width="1400" src="https://capsule-render.vercel.app/api?type=waving&color=3b9eff&height=200&section=header&text=Cinescape&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=Cinema%20without%20limits&descAlignY=58&descSize=22" />

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://framer.com/motion)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com)
[![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge)](https://groq.com)

**A premium movie and TV discovery platform built with a modern full-stack monorepo.**  
Discover what to watch next — powered by TMDB, AI-enhanced search, and a sleek cinematic UI.

[Live Demo](#) · [Report Bug](https://github.com/bhouvana/Cinescape/issues) · [Request Feature](https://github.com/bhouvana/Cinescape/issues)

</div>

---

## What is Cinescape?

Cinescape is a full-featured streaming discovery app. It lets users find movies and TV shows they'll love — through curated trending lists, genre exploration, natural-language AI search ("movies like Interstellar but more hopeful"), personal watchlists, and an embedded watch experience. Built as a production-quality monorepo with a separate API backend, shared types, and a Next.js 15 frontend.

---

## Features

| Category | Feature |
|---|---|
| **Discovery** | Cinematic fullscreen hero, trending lists, genre tab strips |
| **Browse** | Paginated Movies & TV pages with 19+ genre filters and sort modes |
| **AI Search** | Natural-language discovery powered by Groq LLM → TMDB |
| **Search** | Instant title search with keyboard shortcut `Cmd/Ctrl+K` |
| **Watchlist** | Add/remove titles, grid & list views, real-time sync |
| **Details** | Full movie/TV pages — cast, ratings, trailer link, runtime |
| **Watch** | Embedded player via VidKing with episode browser for TV |
| **Auth** | Google & Apple sign-in via Clerk, session management |
| **UX** | Smooth Framer Motion page transitions, skeleton loaders |

---

## Tech Stack

### Frontend (`apps/web`)

| Tool | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org) | React framework with App Router, server components |
| [React 19](https://react.dev) | UI library |
| [TypeScript](https://typescriptlang.org) | End-to-end type safety |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling with CSS custom properties |
| [Framer Motion](https://framer.com/motion) | Page transitions and component animations |
| [TanStack Query v5](https://tanstack.com/query) | Server state, caching, pagination |
| [Zustand](https://zustand-demo.pmnd.rs) | Lightweight UI state (modals, mobile menu) |
| [Clerk](https://clerk.com) | Authentication — Google & Apple |
| [Sonner](https://sonner.emilkowal.ski) | Toast notifications |

### Backend (`apps/api`)

| Tool | Purpose |
|---|---|
| [Express.js](https://expressjs.com) | HTTP server and API routing |
| [Prisma](https://prisma.io) | ORM with full type safety |
| [PostgreSQL](https://postgresql.org) | Primary database |
| [Redis](https://redis.io) | Caching layer (via ioredis) |
| [Groq API](https://groq.com) | LLM inference for AI discovery (Llama 3) |
| [TMDB API](https://tmdb.org) | Movie and TV metadata |
| [Clerk Backend SDK](https://clerk.com) | JWT verification and user sync |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | API rate limiting |
| [Winston](https://github.com/winstonjs/winston) | Structured logging |
| [Helmet](https://helmetjs.github.io) | Security headers |

### Monorepo (`packages/`)

| Package | Contents |
|---|---|
| `@watchblitz/types` | Shared TypeScript types (TMDB, API responses) |
| `@watchblitz/database` | Prisma client and schema |
| `@watchblitz/config` | Shared ESLint, TypeScript configs |
| `@watchblitz/utils` | Shared utility functions |

Managed by [Turborepo](https://turbo.build) with npm workspaces.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  Next.js 15 App Router (SSR + Client Components) │
│  Clerk Auth · TanStack Query · Framer Motion     │
└──────────────────────┬──────────────────────────┘
                       │ REST  (HTTP)
┌──────────────────────▼──────────────────────────┐
│              Express API  (port 4001)            │
│  /api/v1/movies  /tv  /search  /watchlists       │
│  /ai/search  /trending  /watch-history           │
│  Rate limiting · Clerk JWT verification          │
└────────────┬────────────────────┬────────────────┘
             │                    │
┌────────────▼──────┐  ┌─────────▼──────────────┐
│  PostgreSQL        │  │  Redis Cache            │
│  Users, Watchlists │  │  TMDB response cache    │
│  Watch history     │  │  Session data           │
└───────────────────┘  └─────────────────────────┘
             │
┌────────────▼──────────────────────────────────┐
│  External Services                             │
│  TMDB API · Groq (Llama 3) · Clerk · VidKing  │
└────────────────────────────────────────────────┘
```

---

## Project Structure

```
cinescape/
├── apps/
│   ├── web/                     # Next.js 15 frontend
│   │   └── src/
│   │       ├── app/             # App Router pages
│   │       │   ├── (main)/      # Authed layout: home, movies, tv, etc.
│   │       │   └── (auth)/      # Sign-in / sign-up
│   │       ├── components/      # UI components
│   │       │   ├── layout/      # Navbar, Footer, AnimatedMain
│   │       │   ├── media/       # MediaCard, WatchlistButton
│   │       │   ├── search/      # SearchModal, AIModal
│   │       │   └── ui/          # Pagination, Toaster, etc.
│   │       ├── hooks/           # useWatchlist
│   │       ├── lib/             # api-client, utils
│   │       └── store/           # Zustand UI store
│   │
│   └── api/                     # Express backend
│       └── src/
│           ├── routes/v1/       # movies, tv, watchlists, ai, search…
│           ├── services/tmdb/   # TMDB API client
│           ├── middleware/      # auth, rate-limit, error-handler
│           └── lib/             # prisma, redis, logger
│
└── packages/
    ├── types/                   # Shared TypeScript types
    ├── database/                # Prisma schema + migrations
    ├── config/                  # Shared ESLint/TS config
    └── utils/                   # Shared utilities
```

---

## Local Development

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- PostgreSQL (or Docker)
- Redis (or Docker)
- TMDB API key — [get one free](https://www.themoviedb.org/settings/api)
- Clerk account — [clerk.com](https://clerk.com)
- Groq API key — [console.groq.com](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/bhouvana/Cinescape.git
cd Cinescape
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

**`apps/api/.env`**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cinescape

# Redis
REDIS_URL=redis://localhost:6379

# TMDB
TMDB_API_KEY=your_tmdb_api_key
TMDB_READ_ACCESS_TOKEN=your_tmdb_read_token

# Clerk
CLERK_SECRET_KEY=sk_test_...

# Groq AI
GROQ_API_KEY=gsk_...

# Server
PORT=4001
CORS_ORIGINS=http://localhost:3002
NODE_ENV=development
```

**`apps/web/.env.local`**
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:4001

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 4. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start both apps

```bash
npm run dev
```

This runs both `apps/web` (port 3002) and `apps/api` (port 4001) in parallel via Turborepo.

---

## Deployment on Render

Cinescape is designed for [Render](https://render.com). The repo includes a `render.yaml` blueprint — connect the GitHub repo in the Render dashboard and it will provision everything automatically.

### Services created by `render.yaml`

| Service | Type | Details |
|---|---|---|
| `cinescape-api` | Web Service (Node) | Express API |
| `cinescape-web` | Web Service (Node) | Next.js frontend |
| `cinescape-db` | PostgreSQL | Managed database |
| `cinescape-redis` | Redis | Managed cache |

### Manual deployment steps

1. **Fork / push** this repo to [github.com/bhouvana/Cinescape](https://github.com/bhouvana/Cinescape)

2. **Create a Render account** at [render.com](https://render.com)

3. **New → Blueprint** → connect the repo → Render reads `render.yaml` automatically

4. **Set secret environment variables** in Render dashboard (values not in `render.yaml`):
   - `TMDB_API_KEY`
   - `TMDB_READ_ACCESS_TOKEN`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `GROQ_API_KEY`
   - `JWT_SECRET`

5. **Trigger a deploy** — Render will build, migrate the database, and start both services.

6. **Update Clerk** — add your Render domain to the allowed origins in the [Clerk dashboard](https://dashboard.clerk.com).

---

## Environment Variables Reference

### API (`apps/api`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `TMDB_API_KEY` | Yes | TMDB API key |
| `TMDB_READ_ACCESS_TOKEN` | Yes | TMDB read access token (v4) |
| `CLERK_SECRET_KEY` | Yes | Clerk backend secret key |
| `GROQ_API_KEY` | Yes | Groq API key for AI search |
| `JWT_SECRET` | Yes | Secret for JWT signing (≥32 chars) |
| `PORT` | No | Server port (default: `4000`) |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `NODE_ENV` | No | `development` or `production` |

### Web (`apps/web`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Full URL of the Express API |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | Default: `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | Default: `/sign-up` |

---

## API Endpoints

```
GET  /api/v1/movies/trending
GET  /api/v1/movies/popular
GET  /api/v1/movies/top-rated
GET  /api/v1/movies/discover
GET  /api/v1/movies/:id
GET  /api/v1/tv/trending
GET  /api/v1/tv/popular
GET  /api/v1/tv/discover
GET  /api/v1/tv/:id
GET  /api/v1/search?q=&type=multi|movie|tv
POST /api/v1/ai/search          { query: string }

# Auth required:
GET  /api/v1/watchlists
POST /api/v1/watchlists
GET  /api/v1/watchlists/:id/items
POST /api/v1/watchlists/:id/items
DEL  /api/v1/watchlists/:id/items/:itemId
GET  /api/v1/user/me
```

---

## Scripts

```bash
npm run dev          # Start all apps in development mode
npm run build        # Build all apps for production
npm run lint         # Lint all packages
npm run type-check   # TypeScript check across the monorepo
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio (database GUI)
```

---

## License

MIT © [Bhouvana](https://github.com/bhouvana)

---

<div align="center">
  <sub>Built with Next.js 15 · Powered by TMDB · AI by Groq</sub>
</div>
