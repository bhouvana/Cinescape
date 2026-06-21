import { SignUp } from '@clerk/nextjs'
import { Film } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple-900/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(229,9,20,0.15),transparent_70%)]" />

      <div className="relative z-10 mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
            <Film className="h-5 w-5 text-white" />
          </div>
          <span className="text-3xl font-black text-white tracking-tight">
            Cine<span className="text-primary">scape</span>
          </span>
        </Link>
        <p className="text-sm text-white/40">Cinema without limits</p>
      </div>

      <div className="relative z-10">
        <SignUp
          appearance={{
            variables: {
              colorPrimary: '#e50914',
              colorBackground: '#0a0a0a',
              colorText: '#ffffff',
              colorTextSecondary: 'rgba(255,255,255,0.5)',
              colorInputBackground: 'rgba(255,255,255,0.05)',
              colorInputText: '#ffffff',
              borderRadius: '12px',
            },
            elements: {
              card: 'shadow-2xl bg-black/50 backdrop-blur-xl border border-white/10',
              headerTitle: 'text-white font-black',
              headerSubtitle: 'text-white/40',
              formButtonPrimary: 'bg-primary hover:bg-primary/90',
              socialButtonsBlockButton: 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white',
              socialButtonsBlockButtonText: 'text-white font-medium',
            },
          }}
        />
      </div>
    </div>
  )
}
