'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { StickyNote } from "./StickyNote"
import { StickyNote as StickyNoteType } from "@/types/stickyNote"
import { StickyNoteColor } from "@/types/stickyNote"
import { useStickyNotes } from "@/lib/context/StickyNoteContext"

interface ResizableStickyNoteProps {
  note: StickyNoteType
  className?: string
}

const ResizableStickyNote = React.forwardRef<HTMLDivElement, ResizableStickyNoteProps>(
  ({ note, className }, ref) => {
    const { updateNoteSize, updateNoteContent, updateNoteColor, deleteNote } = useStickyNotes()
    const [isResizing, setIsResizing] = React.useState(false)
    const [resizeDirection, setResizeDirection] = React.useState<string>('')
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 })
    const [startSize, setStartSize] = React.useState({ width: 0, height: 0 })
    const [showSettings, setShowSettings] = React.useState(false)

    // Local state for debounced text input
    const [localTitle, setLocalTitle] = React.useState(note.title)
    const [localContent, setLocalContent] = React.useState(note.content)
    const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    // Update local state when note prop changes (from external updates)
    React.useEffect(() => {
      setLocalTitle(note.title)
      setLocalContent(note.content)
    }, [note.title, note.content])

    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
      e.preventDefault()
      e.stopPropagation()
      
      setIsResizing(true)
      setResizeDirection(direction)
      setStartPos({ x: e.clientX, y: e.clientY })
      setStartSize({ width: note.width, height: note.height })
    }

    const handleResizeMove = React.useCallback((e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - startPos.x
      const deltaY = e.clientY - startPos.y

      let newWidth = startSize.width
      let newHeight = startSize.height

      // Apply constraints
      const minWidth = 200
      const minHeight = 200
      const maxWidth = 800
      const maxHeight = 800

      if (resizeDirection.includes('right')) {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.width + deltaX))
      }
      if (resizeDirection.includes('left')) {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.width - deltaX))
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.height + deltaY))
      }
      if (resizeDirection.includes('top')) {
        newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.height - deltaY))
      }

      // Update size in real-time
      const noteElement = document.querySelector(`[data-note-id="${note.id}"]`) as HTMLElement
      if (noteElement) {
        const stickyNoteElement = noteElement.querySelector('.sticky-note-content') as HTMLElement
        if (stickyNoteElement) {
          stickyNoteElement.style.width = `${newWidth}px`
          stickyNoteElement.style.height = `${newHeight}px`
        }
      }
    }, [isResizing, resizeDirection, startPos, startSize, note.id])

    const handleResizeEnd = React.useCallback((e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - startPos.x
      const deltaY = e.clientY - startPos.y

      let newWidth = startSize.width
      let newHeight = startSize.height

      // Apply constraints
      const minWidth = 200
      const minHeight = 200
      const maxWidth = 800
      const maxHeight = 800

      if (resizeDirection.includes('right')) {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.width + deltaX))
      }
      if (resizeDirection.includes('left')) {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.width - deltaX))
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.height + deltaY))
      }
      if (resizeDirection.includes('top')) {
        newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.height - deltaY))
      }

      setIsResizing(false)
      setResizeDirection('')
      
      // Call the resize callback with final dimensions
      if (newWidth !== note.width || newHeight !== note.height) {
        updateNoteSize(note.id, newWidth, newHeight)
      }
    }, [isResizing, resizeDirection, startPos, startSize, note.id, note.width, note.height, updateNoteSize])

    const handleSettingsToggle = () => {
      setShowSettings(!showSettings)
    }

    const handleColorChange = (color: StickyNoteColor) => {
      updateNoteColor(note.id, color)
      setShowSettings(false) // Close settings after color selection
    }

    // Debounced text update function
    const debouncedUpdateContent = React.useCallback((title: string, content: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        // Only update if the values have actually changed
        if (title !== note.title || content !== note.content) {
          updateNoteContent(note.id, title, content)
        }
      }, 500) // 500ms debounce delay
    }, [note.id, note.title, note.content, updateNoteContent])

    const handleTitleChange = (title: string) => {
      setLocalTitle(title)
      debouncedUpdateContent(title, localContent)
    }

    const handleContentChange = (content: string) => {
      setLocalContent(content)
      debouncedUpdateContent(localTitle, content)
    }

    const handleCloseClick = () => {
      deleteNote(note.id)
    }

    React.useEffect(() => {
      if (isResizing) {
        document.addEventListener('mousemove', handleResizeMove)
        document.addEventListener('mouseup', handleResizeEnd)
        return () => {
          document.removeEventListener('mousemove', handleResizeMove)
          document.removeEventListener('mouseup', handleResizeEnd)
        }
      }
    }, [isResizing, handleResizeMove, handleResizeEnd])

    // Cleanup debounce timeout on unmount
    React.useEffect(() => {
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current)
        }
      }
    }, [])

    return (
      <div ref={ref} className={cn("relative group", className)}>
        <StickyNote
          className="sticky-note-content"
          title={localTitle}
          content={localContent}
          variant={note.settings.backgroundColor}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onSettingsClick={handleSettingsToggle}
          onCloseClick={handleCloseClick}
          onColorChange={handleColorChange}
          width={note.width}
          height={note.height}
          showSettings={showSettings}
        />

        {/* Resize handles */}
        {/* Right handle */}
        <div
          className="absolute top-0 right-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 hover:bg-red-500/40"
          onMouseDown={(e) => handleResizeStart(e, 'right')}
        />

        {/* Bottom handle */}
        <div
          className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 hover:bg-red-500/40"
          onMouseDown={(e) => handleResizeStart(e, 'bottom')}
        />

        {/* Bottom-right corner handle */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/40 hover:bg-red-600/60"
          onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
        />
      </div>
    )
  }
)

ResizableStickyNote.displayName = "ResizableStickyNote"

export { ResizableStickyNote }
