'use client'

import React from 'react'
import { useStickyNotes } from '@/lib/context/StickyNoteContext'
import { DraggableStickyNote } from '@/components/organisms/DraggableStickyNote'
import { PanCanvas } from '@/components/organisms/PanZoomCanvas'

export default function Home() {
  const { notes, loading } = useStickyNotes()

  if (loading && notes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-red-950/90">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-red-950/90 overflow-hidden">
      <PanCanvas className="w-full h-full">
        {/* Help text when no notes */}
        {notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 bg-red-950/95 border border-red-800/50 rounded-lg shadow-xl backdrop-blur-sm max-w-md">
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome to StickyNoter!
              </h2>
              <p className="text-white/90 mb-6 text-lg leading-relaxed">
                Use the &ldquo;Add Note&rdquo; button in the navbar to create your first sticky note
              </p>
              <div className="space-y-2 text-white/80 text-sm">
                <p>• Drag to pan around the canvas</p>
                <p>• Drag notes from their headers to move them</p>
                <p>• Hover over notes to see resize handles</p>
                <p>• Click the settings icon to change colors</p>
              </div>
            </div>
          </div>
        )}

        {/* Render all sticky notes */}
        {notes.map((note) => (
          <DraggableStickyNote
            key={note.id}
            note={note}
          />
        ))}
      </PanCanvas>
    </div>
  )
}
