import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Only watchlist/profile/settings require auth — everything else is publicly browsable
const isProtectedRoute = createRouteMatcher([
  '/watchlist(.*)',
  '/profile(.*)',
  '/settings(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
