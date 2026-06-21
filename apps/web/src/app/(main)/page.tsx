import { auth } from '@clerk/nextjs/server'
import { Suspense } from 'react'
import { HeroSection } from '../../components/hero/hero-section'
import { HomeRows } from '../../components/home/home-rows'
import { HeroSkeleton } from '../../components/skeletons/media-card-skeleton'
import { LandingPage } from '../../components/landing/landing-page'

export default async function HomePage() {
  const { userId } = await auth()

  if (!userId) {
    return <LandingPage />
  }

  return (
    <div className="relative -mt-16">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>
      <div className="relative z-10 -mt-8 pb-20 space-y-12">
        <Suspense fallback={null}>
          <HomeRows />
        </Suspense>
      </div>
    </div>
  )
}
