import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthStore } from '../features/auth'

// Composition root / app shell. The router lives here; global providers
// (theme, query client) and layout chrome will wrap RouterProvider as they arrive.
function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)

  // Try to restore a session from the refresh cookie once on load.
  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <div className="mx-auto flex   max-w-full flex-col border-x border-border text-center">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
