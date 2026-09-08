'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Catches errors thrown in the root layout itself, which app/error.tsx cannot
 * see. That matters here because both context providers live in the layout, so
 * a throw inside AuthProvider or StickyNoteProvider would otherwise render an
 * unstyled framework error page.
 *
 * It replaces the whole document, so it must supply its own html and body.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Fatal application error:', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#450a0a',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          padding: '1rem',
        }}
      >
        <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            StickyNoter could not start
          </h1>
          <p style={{ opacity: 0.85, lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Something failed before the app finished loading. Reloading usually fixes it.
            Any notes already saved to your account are unaffected.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
              Error ID: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  )
}
