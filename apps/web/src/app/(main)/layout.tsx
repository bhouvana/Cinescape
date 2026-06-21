import { Navbar } from '../../components/layout/navbar'
import { Footer } from '../../components/layout/footer'
import { AnimatedMain } from '../../components/layout/animated-main'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AnimatedMain>{children}</AnimatedMain>
      <Footer />
    </div>
  )
}
