'use client'

import * as React from 'react'
import { Undo2, X } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { useStickyNotes } from '@/lib/context/StickyNoteContext'

/**
 * Single-level undo for the most recent deletion.
 *
 * Deleting a note is permanent and used to sit behind a button labelled
 * "Close", with no confirmation and no way back. Rather than adding a
 * confirmation dialog to every deletion, the action stays instant and this
 * gives it a short window to be reversed.
 */
export function UndoDeleteToast() {
  const { lastDeleted, undoDelete, dismissUndo } = useStickyNotes()

  if (!lastDeleted) return null

  const label = lastDeleted.title.trim() || 'Untitled note'

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-red-800/50 bg-stone-900/95 px-4 py-2.5 shadow-xl backdrop-blur-sm"
    >
      <span className="max-w-60 truncate text-sm text-white/90">
        Deleted &ldquo;{label}&rdquo;
      </span>
      <Button variant="secondary" size="sm" onClick={() => void undoDelete()}>
        <Undo2 aria-hidden="true" />
        Undo
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={dismissUndo}>
        <X aria-hidden="true" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  )
}
