'use client'

import React from 'react'
import { useStickyNotes } from '@/lib/context/StickyNoteContext'
import { useAuth } from '@/lib/auth/AuthContext'
import { DraggableStickyNote } from '@/components/organisms/DraggableStickyNote'
import { PanCanvas } from '@/components/organisms/PanZoomCanvas'

export default function Home() {
  const { notes, loading } = useStickyNotes()
  const { authLoading } = useAuth()

  // Show loading if either auth or notes are loading
  const isLoading = authLoading || loading

  return (
    <div className="w-full h-full bg-red-950/90 overflow-hidden">
      {/* SEO Content - Hidden but accessible to search engines */}
      <div className="sr-only">
        <h1>StickyNoter - Digital Sticky Notes Application</h1>
        <p>
          Create, organize, and manage your ideas with our intuitive digital sticky notes app. 
          Features include drag-and-drop functionality, color coding, resizable notes, infinite canvas, 
          and real-time synchronization. Perfect for brainstorming, project planning, mind mapping, 
          and visual organization. Free online sticky note tool for productivity and collaboration.
        </p>
        <h2>Key Features</h2>
        <ul>
          <li>Drag and drop sticky notes on infinite canvas</li>
          <li>Resize notes to fit your content</li>
          <li>Color-code notes for better organization</li>
          <li>Auto-save functionality with real-time sync</li>
          <li>Pan and zoom across unlimited workspace</li>
          <li>User authentication and personal note storage</li>
        </ul>
      </div>
      
      <PanCanvas className="w-full h-full">
        {/* Loading spinner */}
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="relative mb-4">
                {/* Outer ring */}
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-800/30 mx-auto"></div>
                {/* Inner spinning element */}
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-red-500 border-r-red-400 absolute top-0 left-1/2 transform -translate-x-1/2" 
                     style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="text-white text-lg font-medium">Loading your notes...</p>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </PanCanvas>
    </div>
  )
}
