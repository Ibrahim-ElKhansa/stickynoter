'use client'

import React from 'react'
import { Navbar } from "@/components/organisms/Navbar"
import { useStickyNotes } from "@/lib/context/StickyNoteContext"
import { usePanCanvas } from "@/hooks/usePanCanvas"
import { StickyNoteColor } from "@/types/stickyNote"

export function NavbarWithStickyNotes() {
  const { createNote } = useStickyNotes()
  const { getViewportCenter } = usePanCanvas()

  const availableColors: StickyNoteColor[] = [
    'yellow', 'orange', 'blue', 'green', 'pink', 'purple', 'red', 'teal', 'gray'
  ]

  const getRandomColor = (): StickyNoteColor => {
    const randomIndex = Math.floor(Math.random() * availableColors.length)
    return availableColors[randomIndex]
  }

  const handleAddNote = async () => {
    
    // Create note at the center of the current viewport with some randomization
    const center = getViewportCenter()
    
    // Add random offset within a range (±100px in both directions)
    const randomOffsetX = (Math.random() - 0.5) * 200
    const randomOffsetY = (Math.random() - 0.5) * 200
    
    // Get a random color for the new note
    const randomColor = getRandomColor()
    
    try {
      await createNote({
        title: '',
        content: '',
        position_x: center.x + randomOffsetX,
        position_y: center.y + randomOffsetY,
        width: 300,
        height: 200,
        z_index: 1,
        settings: { backgroundColor: randomColor }
      })
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  return <Navbar onAddNote={handleAddNote} />
}
