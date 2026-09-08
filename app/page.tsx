'use client'

import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useStickyNotes } from '@/lib/context/StickyNoteContext'
import { useAuth } from '@/lib/auth/AuthContext'
import { Button } from '@/components/atoms/Button'
import { DraggableStickyNote } from '@/components/organisms/DraggableStickyNote'
import { PanZoomCanvas } from '@/components/organisms/PanZoomCanvas'
import { UndoDeleteToast } from '@/components/molecules/UndoDeleteToast'

export default function Home() {
  const { notes, loading, error, clearError } = useStickyNotes()
  const { authLoading, user } = useAuth()

  const isLoading = authLoading || loading

  return (
    <div className="relative h-full w-full overflow-hidden bg-red-950/90">
      {/* SEO content, hidden visually but available to crawlers. */}
      <div className="sr-only">
        <h1>StickyNoter - Digital Sticky Notes Application</h1>
        <p>
          Create, organize, and manage your ideas with our intuitive digital sticky notes
          app. Features include drag-and-drop functionality, color coding, resizable notes,
          an infinite canvas, and automatic saving. Perfect for brainstorming, project
          planning, mind mapping, and visual organization. Free online sticky note tool for
          productivity.
        </p>
        <h2>Key Features</h2>
        <ul>
          <li>Drag and drop sticky notes on an infinite canvas</li>
          <li>Resize notes to fit your content</li>
          <li>Color-code notes for better organization</li>
          <li>Automatic saving of every change</li>
          <li>Pan and zoom across an unlimited workspace</li>
          <li>User authentication and personal note storage</li>
        </ul>
      </div>

      <PanZoomCanvas className="h-full w-full">
        {isLoading ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mb-4">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-800/30" />
                <div
                  className="absolute top-0 left-1/2 h-12 w-12 -translate-x-1/2 animate-spin rounded-full border-4 border-transparent border-t-red-500 border-r-red-400"
                  style={{ animationDirection: 'reverse', animationDuration: '1s' }}
                />
              </div>
              <p className="text-lg font-medium text-white">Loading your notes...</p>
            </div>
          </div>
        ) : (
          <>
            {/*
              Only shown when the canvas is genuinely empty. A load failure now
              surfaces as the banner below instead of masquerading as "you have
              no notes", which is what happened when a network error wiped
              local state.
            */}
            {notes.length === 0 && !error && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
                <div className="max-w-md rounded-lg border border-red-800/50 bg-red-950/95 p-8 text-center shadow-xl backdrop-blur-sm">
                  <h2 className="mb-4 text-3xl font-bold text-white">
                    Welcome to StickyNoter!
                  </h2>
                  <p className="mb-6 text-lg leading-relaxed text-white/90">
                    Use the &ldquo;Add Note&rdquo; button in the navbar to create your
                    first sticky note
                  </p>
                  <div className="space-y-2 text-sm text-white/80">
                    <p>Drag the background to pan, or pinch to zoom</p>
                    <p>Drag a note to move it, or use its edge handles to resize</p>
                    <p>Click the settings icon on a note to change its colour</p>
                    {!user && (
                      <p className="pt-2 text-amber-200">
                        Sign in to save your notes. Notes you create now are kept in this
                        browser only until you do.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {notes.map((note) => (
              <DraggableStickyNote key={note.id} note={note} />
            ))}
          </>
        )}
      </PanZoomCanvas>

      {error && (
        <div
          role="alert"
          className="absolute top-4 left-1/2 z-50 flex max-w-xl -translate-x-1/2 items-start gap-3 rounded-lg border border-red-700/60 bg-stone-900/95 px-4 py-3 shadow-xl backdrop-blur-sm"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-400" aria-hidden="true" />
          <p className="text-sm text-white/90">{error}</p>
          <Button variant="ghost" size="icon-sm" onClick={clearError} className="shrink-0">
            <X aria-hidden="true" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      )}

      <UndoDeleteToast />
    </div>
  )
}
