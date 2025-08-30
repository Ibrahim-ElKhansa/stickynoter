import * as React from "react"
import { cn } from "@/lib/utils"
import { StickyNote as StickyNoteType } from "@/types/stickyNote"
import { ResizableStickyNote } from "@/components/organisms/ResizableStickyNote"
import { useStickyNotes } from "@/lib/context/StickyNoteContext"
import { usePanCanvas } from "@/hooks/usePanCanvas"

interface DraggableStickyNoteProps {
  note: StickyNoteType
  className?: string
}

const DraggableStickyNote = React.forwardRef<HTMLDivElement, DraggableStickyNoteProps>(
  ({ note, className }, ref) => {
    const { updateNotePosition } = useStickyNotes()
    const { transform } = usePanCanvas()
    const [isDragging, setIsDragging] = React.useState(false)
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })

    const handleMouseDown = (e: React.MouseEvent) => {
      // Only allow dragging from the header area (not from textarea/input)
      const target = e.target as HTMLElement
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.closest('textarea') || target.closest('input')) {
        return
      }
      
      setIsDragging(true)
      
      // Calculate offset in canvas coordinates (scaled)
      const rect = e.currentTarget.getBoundingClientRect()
      const offsetX = (e.clientX - rect.left) / transform.scale
      const offsetY = (e.clientY - rect.top) / transform.scale
      
      setDragOffset({
        x: offsetX,
        y: offsetY
      })
      e.preventDefault()
    }

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
      if (!isDragging) return

      // Get the viewport canvas container (not the transformed one)
      const viewportContainer = document.querySelector('.relative.w-full.h-full.overflow-hidden') as HTMLElement
      if (!viewportContainer) return

      const containerRect = viewportContainer.getBoundingClientRect()
      
      // Calculate position relative to viewport, then convert to canvas coordinates
      const viewportX = e.clientX - containerRect.left
      const viewportY = e.clientY - containerRect.top
      
      // Convert viewport coordinates to canvas coordinates accounting for transform and scale
      const canvasX = (viewportX - transform.x) / transform.scale - dragOffset.x
      const canvasY = (viewportY - transform.y) / transform.scale - dragOffset.y

      // Update position in real-time (optimistic update)
      const noteElement = document.querySelector(`[data-note-id="${note.id}"]`) as HTMLElement
      if (noteElement) {
        noteElement.style.left = `${canvasX}px`
        noteElement.style.top = `${canvasY}px`
      }
    }, [isDragging, dragOffset, note.id, transform])

    const handleMouseUp = React.useCallback(async (e: MouseEvent) => {
      if (!isDragging) return

      setIsDragging(false)

      // Get the viewport canvas container (not the transformed one)
      const viewportContainer = document.querySelector('.relative.w-full.h-full.overflow-hidden') as HTMLElement
      if (!viewportContainer) return

      const containerRect = viewportContainer.getBoundingClientRect()
      
      // Calculate position relative to viewport, then convert to canvas coordinates
      const viewportX = e.clientX - containerRect.left
      const viewportY = e.clientY - containerRect.top
      
      // Convert viewport coordinates to canvas coordinates accounting for transform and scale
      const finalX = (viewportX - transform.x) / transform.scale - dragOffset.x
      const finalY = (viewportY - transform.y) / transform.scale - dragOffset.y

      // Save final position to database
      await updateNotePosition(note.id, finalX, finalY)
    }, [isDragging, dragOffset, note.id, updateNotePosition, transform])

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp])

    return (
      <div
        ref={ref}
        data-note-id={note.id}
        className={cn(
          "absolute cursor-move transition-shadow duration-200 z-10 opacity-100",
          isDragging && "shadow-lg z-50",
          className
        )}
        style={{
          left: `${note.positionX}px`,
          top: `${note.positionY}px`,
          zIndex: isDragging ? 1000 : Math.max(note.zIndex, 10),
          visibility: 'visible',
          display: 'block',
        }}
        onMouseDown={handleMouseDown}
      >
        <ResizableStickyNote
          note={note}
          className="pointer-events-auto select-text opacity-100 visible"
        />
      </div>
    )
  }
)

DraggableStickyNote.displayName = "DraggableStickyNote"

export { DraggableStickyNote }
