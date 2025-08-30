'use client'

import React from 'react'
import { Navbar } from "@/components/organisms/Navbar"
import { useStickyNotes } from "@/lib/context/StickyNoteContext"
import { usePanCanvas } from "@/hooks/usePanCanvas"

export function NavbarWithStickyNotes() {
  const { createNote } = useStickyNotes()
  const { getViewportCenter } = usePanCanvas()

  const handleAddNote = async () => {
    
    // Create note at the center of the current viewport
    const center = getViewportCenter()
    
    try {
      await createNote({
        title: 'New Note',
        content: 'Click here to edit...',
        position_x: center.x,
        position_y: center.y,
        width: 300,
        height: 200,
        z_index: 1,
        settings: { backgroundColor: 'yellow' }
      })
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  return <Navbar onAddNote={handleAddNote} />
}
