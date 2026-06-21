import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding WatchBlitz database...')

  // Create admin user (development only)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@watchblitz.dev' },
    update: {},
    create: {
      clerkId: 'dev_admin_clerk_id',
      email: 'admin@watchblitz.dev',
      username: 'admin',
      displayName: 'WatchBlitz Admin',
      role: UserRole.ADMIN,
      profile: {
        create: {
          bio: 'Platform administrator',
          language: 'en',
          favoriteGenres: [28, 12, 878], // Action, Adventure, Sci-Fi
        },
      },
      settings: {
        create: {
          theme: 'DARK',
          accentColor: 'e50914',
          autoPlay: true,
          autoPlayNext: true,
        },
      },
    },
  })

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@watchblitz.dev' },
    update: {},
    create: {
      clerkId: 'dev_demo_clerk_id',
      email: 'demo@watchblitz.dev',
      username: 'demo_user',
      displayName: 'Demo User',
      profile: {
        create: {
          bio: 'Movie enthusiast and binge-watcher',
          language: 'en',
          favoriteGenres: [18, 53, 9648], // Drama, Thriller, Mystery
        },
      },
      settings: {
        create: {
          theme: 'DARK',
          accentColor: 'e50914',
        },
      },
    },
  })

  // Create demo watchlist
  await prisma.watchlist.upsert({
    where: { id: 'demo-watchlist-1' },
    update: {},
    create: {
      id: 'demo-watchlist-1',
      userId: demoUser.id,
      name: 'My Watchlist',
      description: 'Movies and shows I want to watch',
      isPinned: true,
      isPublic: false,
    },
  })

  // Create favorites watchlist
  await prisma.watchlist.upsert({
    where: { id: 'demo-watchlist-2' },
    update: {},
    create: {
      id: 'demo-watchlist-2',
      userId: demoUser.id,
      name: 'All-Time Favorites',
      description: 'The best of the best',
      isPinned: true,
      isPublic: true,
    },
  })

  console.log('✅ Database seeded successfully')
  console.log(`   - Admin: ${adminUser.email}`)
  console.log(`   - Demo:  ${demoUser.email}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
