'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({
  error,
  reset,
}: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="h-full overflow-y-auto bg-red-950/90 flex items-center justify-center px-4 py-8">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          {/* Error Icon */}
          <div className="mx-auto w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6">
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Something went wrong!</h1>
          {/*
            Deliberately narrower than the previous claim that "your sticky
            notes are safe". Notes already saved to your account are safe;
            edits made in the last second or two may not have been written yet.
          */}
          <p className="text-xl text-white/80 mb-8">
            Notes already saved to your account are safe. Very recent edits may not have
            been written yet.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 mr-4"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="bg-red-800 hover:bg-red-900 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go Home
          </button>
        </div>
        
        <div className="mt-8 text-white/60 text-sm">
          <p>If this problem persists, please contact support.</p>
          {/* digest is only set for server-side errors; rendering it
              unconditionally showed a bare "Error ID:" with nothing after it. */}
          {error.digest ? <p className="mt-2">Error ID: {error.digest}</p> : null}
        </div>
      </div>
    </div>
  )
}
