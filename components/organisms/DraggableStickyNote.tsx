'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { StickyNote as StickyNoteType } from '@/types/stickyNote'
import { ResizableStickyNote } from '@/components/organisms/ResizableStickyNote'
import { useStickyNotes } from '@/lib/context/StickyNoteContext'
import { useCanvasTransformApi } from '@/lib/context/CanvasTransformContext'
import { usePointerGesture, type GestureDelta } from '@/hooks/usePointerGesture'
import { Z_NOTE_ACTIVE } from '@/lib/constants/stickyNotes'

interface DraggableStickyNoteProps {
  note: StickyNoteType
  className?: string
}

const DraggableStickyNote = React.forwardRef<HTMLDivElement, DraggableStickyNoteProps>(
  ({ note, className }, ref) => {
    const { updateNotePosition, bringToFront } = useStickyNotes()
    const { getTransform } = useCanvasTransformApi()

    const wrapperRef = React.useRef<HTMLDivElement | null>(null)
    const liveOffsetRef = React.useRef({ x: 0, y: 0 })

    /**
     * Live drag feedback goes through a CSS custom property React never
     * declares, while React keeps sole ownership of left and top. React's style
     * diffing only removes keys it previously wrote, so a re-render mid-drag is
     * structurally incapable of snapping the note back to where it started.
     * The previous code wrote style.left/top directly, which React reasserted
     * on every unrelated re-render.
     */
    const applyOffset = React.useCallback((x: number, y: number) => {
      liveOffsetRef.current = { x, y }
      const element = wrapperRef.current
      if (!element) return
      element.style.setProperty('--drag-x', `${x}px`)
      element.style.setProperty('--drag-y', `${y}px`)
    }, [])

    // Once React's declared left/top catches up, zero the visual offset. A
    // layout effect runs in the same frame as the commit, so there is no flash.
    React.useLayoutEffect(() => {
      if (liveOffsetRef.current.x !== 0 || liveOffsetRef.current.y !== 0) {
        applyOffset(0, 0)
      }
    }, [note.positionX, note.positionY, applyOffset])

    const shouldStartDrag = React.useCallback((event: React.PointerEvent) => {
      // Inputs, buttons, the colour picker and the resize handles opt out via
      // data-no-drag. Previously only INPUT and TEXTAREA were excluded, so the
      // settings and delete buttons both started a drag.
      const target = event.target as HTMLElement
      return target.closest('[data-no-drag]') === null
    }, [])

    const handleStart = React.useCallback(() => {
      bringToFront(note.id)
    }, [bringToFront, note.id])

    const handleMove = React.useCallback(
      (delta: GestureDelta) => {
        // Screen pixels to canvas pixels. Without dividing by the scale the
        // note drifts away from the cursor at any zoom other than 1.
        const { scale } = getTransform()
        applyOffset(delta.dx / scale, delta.dy / scale)
      },
      [getTransform, applyOffset],
    )

    const handleEnd = React.useCallback(
      (delta: GestureDelta, moved: boolean) => {
        if (!moved) {
          // A plain click. Writing a position here used to mark the note dirty
          // on every click.
          applyOffset(0, 0)
          return
        }

        const { scale } = getTransform()
        const finalX = note.positionX + delta.dx / scale
        const finalY = note.positionY + delta.dy / scale

        applyOffset(delta.dx / scale, delta.dy / scale)

        if (Math.round(finalX) === Math.round(note.positionX) &&
            Math.round(finalY) === Math.round(note.positionY)) {
          // No change to commit, so the layout effect would never fire.
          applyOffset(0, 0)
          return
        }

        void updateNotePosition(note.id, finalX, finalY)
      },
      [getTransform, applyOffset, note.id, note.positionX, note.positionY, updateNotePosition],
    )

    const drag = usePointerGesture({
      shouldStart: shouldStartDrag,
      onStart: handleStart,
      onMove: handleMove,
      onEnd: handleEnd,
    })

    const setRefs = React.useCallback(
      (element: HTMLDivElement | null) => {
        wrapperRef.current = element
        if (typeof ref === 'function') ref(element)
        else if (ref) ref.current = element
      },
      [ref],
    )

    return (
      <div
        ref={setRefs}
        data-note-id={note.id}
        className={cn(
          'absolute transition-shadow duration-200',
          drag.isActive ? 'cursor-grabbing shadow-lg' : 'cursor-grab',
          className,
        )}
        style={{
          left: `${note.positionX}px`,
          top: `${note.positionY}px`,
          // translate3d promotes the note to its own compositor layer, so a
          // drag costs no layout and no React renders.
          transform: 'translate3d(var(--drag-x, 0px), var(--drag-y, 0px), 0)',
          zIndex: drag.isActive ? Z_NOTE_ACTIVE : note.zIndex,
        }}
        onPointerDown={drag.onPointerDown}
        onFocusCapture={handleStart}
      >
        <ResizableStickyNote note={note} className="pointer-events-auto select-text" />
      </div>
    )
  },
)

DraggableStickyNote.displayName = 'DraggableStickyNote'

export { DraggableStickyNote }
