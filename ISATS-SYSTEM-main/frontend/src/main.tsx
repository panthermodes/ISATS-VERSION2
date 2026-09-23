import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { getPage } from './routes/pageRegistry'

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-primary-900">
      <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

// ─── Django SPA mode (react_base.html) ───────────────────
const djangoRoot = document.getElementById('react-root')
if (djangoRoot) {
  const pageName = djangoRoot.dataset.page ?? ''
  let pageProps: Record<string, unknown> = {}
  try {
    pageProps = JSON.parse(djangoRoot.dataset.props ?? '{}')
  } catch { /* ignore */ }

  const PageComponent = getPage(pageName)

  createRoot(djangoRoot).render(
    <React.StrictMode>
      <Providers>
        <Suspense fallback={<PageLoader />}>
          {PageComponent ? (
            <PageComponent {...pageProps} />
          ) : (
            <div className="flex items-center justify-center min-h-screen text-muted">
              <p>Page "{pageName}" not found.</p>
            </div>
          )}
        </Suspense>
      </Providers>
    </React.StrictMode>
  )
}

// ─── Vite standalone dev mode ─────────────────────────────
const devRoot = document.getElementById('root')
if (devRoot && !djangoRoot) {
  createRoot(devRoot).render(
    <React.StrictMode>
      <Providers>
        <App />
      </Providers>
    </React.StrictMode>
  )
}
