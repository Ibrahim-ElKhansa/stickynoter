'use client'

import React from 'react'
import { Navbar } from '@/components/organisms/Navbar'
import { useStickyNotes } from '@/lib/context/StickyNoteContext'
import { useCanvasTransformApi } from '@/lib/context/CanvasTransformContext'
import {
  NOTE_DEFAULT_HEIGHT,
  NOTE_DEFAULT_WIDTH,
  randomStickyNoteColor,
} from '@/lib/constants/stickyNotes'

/** Half-width of the random scatter applied to a new note, in canvas pixels. */
const SPAWN_JITTER = 200

export function NavbarWithStickyNotes() {
  const { createNote } = useStickyNotes()
  // Only the stable API, so the navbar does not re-render on every pan frame.
  const { getViewportCenter } = useCanvasTransformApi()

  const handleAddNote = React.useCallback(() => {
    // Measured from the canvas element's live rect, so it lands where the user
    // is actually looking regardless of navbar height or how far they panned.
    const center = getViewportCenter()

    void createNote({
      positionX: center.x + (Math.random() - 0.5) * SPAWN_JITTER,
      positionY: center.y + (Math.random() - 0.5) * SPAWN_JITTER,
      width: NOTE_DEFAULT_WIDTH,
      height: NOTE_DEFAULT_HEIGHT,
      settings: { backgroundColor: randomStickyNoteColor() },
    })
  }, [createNote, getViewportCenter])

  return <Navbar onAddNote={handleAddNote} />
}
