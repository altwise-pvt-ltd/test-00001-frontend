import { motion } from 'framer-motion'
import { LoginForm } from '../components/loginform'

// Inline SVG fractal-noise grain — adds a subtle film texture over the gradients.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      {/* Base wash: accent glow from the top, cooler glow anchoring the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60rem 40rem at 50% -10%, var(--color-accent-bg), transparent 70%), radial-gradient(50rem 40rem at 100% 110%, var(--color-accent-bg), transparent 65%)',
        }}
      />

      {/* Slow-drifting orbs for living depth */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-[-8%] -z-10 h-100 w-100 rounded-full bg-accent/15 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-[-10%] -z-10 h-112 w-md rounded-full bg-accent/10 blur-[130px]"
        animate={{ x: [0, -50, 0], y: [0, -25, 0], scale: [1, 1.18, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Faint grid, masked to a soft patch behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-border) 2px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage:
            'radial-gradient(40rem 30rem at 50% 35%, black, transparent 75%)',
        }}
      />

      {/* Film grain texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px' }}
      />

      {/* Vignette to draw focus to the centered card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(75rem 55rem at 50% 45%, transparent 55%, rgba(0,0,0,0.06))',
        }}
      />

      <LoginForm />
    </main>
  )
}
