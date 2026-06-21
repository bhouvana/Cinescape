'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      richColors
      toastOptions={{
        style: {
          background: 'hsl(240 10% 8%)',
          border: '1px solid hsl(240 4% 16%)',
          color: 'hsl(0 0% 98%)',
        },
      }}
    />
  )
}

export { toast } from 'sonner'
