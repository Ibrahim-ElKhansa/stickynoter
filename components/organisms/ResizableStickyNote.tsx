'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { StickyNote } from './StickyNote'
import type { StickyNote as StickyNoteType, StickyNoteColor } from '@/types/stickyNote'
import { useStickyNotes } from '@/lib/context/StickyNoteContext'
import { useCanvasTransformApi } from '@/lib/context/CanvasTransformContext'
import { usePointerGesture, type GestureDelta } from '@/hooks/usePointerGesture'
import {
  NOTE_MAX_HEIGHT,
  NOTE_MAX_WIDTH,
  NOTE_MIN_HEIGHT,
  NOTE_MIN_WIDTH,
  clampNoteSize,
} from '@/lib/constants/stickyNotes'

interface ResizableStickyNoteProps {
  note: StickyNoteType
  className?: string
}

/** Quiet period before a keystroke is pushed into the shared note state. */
const TEXT_DEBOUNCE_MS = 500

/** Keyboard resize increment, in canvas pixels. */
const KEYBOARD_RESIZE_STEP = 20

type ResizeDirection = 'right' | 'bottom' | 'bottom-right'

const ResizableStickyNote = React.forwardRef<HTMLDivElement, ResizableStickyNoteProps>(
  ({ note, className }, ref) => {
    const { updateNoteSize, updateNoteContent, updateNoteColor, deleteNote } =
      useStickyNotes()
    const { getTransform } = useCanvasTransformApi()

    const noteElementRef = React.useRef<HTMLDivElement | null>(null)
    const [showSettings, setShowSettings] = React.useState(false)
    const settingsButtonRef = React.useRef<HTMLButtonElement | null>(null)

    // ----- Text, debounced -------------------------------------------------

    const [localTitle, setLocalTitle] = React.useState(note.title)
    const [localContent, setLocalContent] = React.useState(note.content)

    // Latest local values, so a change to one field never dispatches a stale
    // value for the other.
    const localRef = React.useRef({ title: note.title, content: note.content })
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const pendingTextRef = React.useRef<{ title: string; content: string } | null>(null)
    // What we last pushed upstream, so we can recognise the echo coming back.
    const lastSentRef = React.useRef({ title: note.title, content: note.content })

    const dispatchText = React.useCallback(
      (title: string, content: string) => {
        if (title === note.title && content === note.content) return
        lastSentRef.current = { title, content }
        void updateNoteContent(note.id, title, content)
      },
      [note.id, note.title, note.content, updateNoteContent],
    )

    const scheduleTextDispatch = React.useCallback(() => {
      pendingTextRef.current = { ...localRef.current }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        const pending = pendingTextRef.current
        pendingTextRef.current = null
        if (pending) dispatchText(pending.title, pending.content)
      }, TEXT_DEBOUNCE_MS)
    }, [dispatchText])

    // Kept in a ref that is refreshed on every render, so the unmount effect
    // below can have an empty dependency array (and therefore run only on a
    // real unmount) while still calling the latest closure.
    const flushTextRef = React.useRef<() => void>(() => {})
    flushTextRef.current = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      const pending = pendingTextRef.current
      pendingTextRef.current = null
      if (pending) dispatchText(pending.title, pending.content)
    }

    // The previous version cleared this timer on unmount without flushing it,
    // so text typed within 500ms of a note being unmounted was lost before the
    // context ever heard about it.
    React.useEffect(() => {
      return () => flushTextRef.current()
    }, [])

    // Resync from props, ignoring the echo of our own dispatch. Blindly
    // resetting on every prop change clobbered keystrokes that landed while
    // the update was in flight, and made the caret jump.
    React.useEffect(() => {
      if (
        note.title === lastSentRef.current.title &&
        note.content === lastSentRef.current.content
      ) {
        return
      }
      lastSentRef.current = { title: note.title, content: note.content }
      localRef.current = { title: note.title, content: note.content }
      setLocalTitle(note.title)
      setLocalContent(note.content)
    }, [note.title, note.content])

    const handleTitleChange = React.useCallback(
      (title: string) => {
        localRef.current = { ...localRef.current, title }
        setLocalTitle(title)
        scheduleTextDispatch()
      },
      [scheduleTextDispatch],
    )

    const handleContentChange = React.useCallback(
      (content: string) => {
        localRef.current = { ...localRef.current, content }
        setLocalContent(content)
        scheduleTextDispatch()
      },
      [scheduleTextDispatch],
    )

    // ----- Resize ----------------------------------------------------------

    const liveResizeRef = React.useRef({ dw: 0, dh: 0 })
    const directionRef = React.useRef<ResizeDirection>('bottom-right')

    /**
     * Live resize feedback goes through CSS custom properties React never
     * declares; React keeps sole ownership of width and height. See the same
     * pattern in DraggableStickyNote.
     */
    const applyResize = React.useCallback((dw: number, dh: number) => {
      liveResizeRef.current = { dw, dh }
      const element = noteElementRef.current
      if (!element) return
      element.style.setProperty('--resize-dw', `${dw}px`)
      element.style.setProperty('--resize-dh', `${dh}px`)
    }, [])

    React.useLayoutEffect(() => {
      if (liveResizeRef.current.dw !== 0 || liveResizeRef.current.dh !== 0) {
        applyResize(0, 0)
      }
    }, [note.width, note.height, applyResize])

    const sizeFor = React.useCallback(
      (delta: GestureDelta) => {
        // Screen pixels to canvas pixels. The previous version added raw
        // clientX/clientY deltas to canvas-space dimensions, so at zoom 2 the
        // note resized twice as fast as the pointer moved.
        const { scale } = getTransform()
        const direction = directionRef.current
        return clampNoteSize({
          width: note.width + (direction.includes('right') ? delta.dx / scale : 0),
          height: note.height + (direction.includes('bottom') ? delta.dy / scale : 0),
        })
      },
      [getTransform, note.width, note.height],
    )

    const handleResizeStart = React.useCallback((event: React.PointerEvent) => {
      const raw = (event.currentTarget as HTMLElement).dataset.resizeDirection
      directionRef.current = (raw as ResizeDirection | undefined) ?? 'bottom-right'
    }, [])

    const handleResizeMove = React.useCallback(
      (delta: GestureDelta) => {
        const { width, height } = sizeFor(delta)
        // The clamp applies to the total, so the delta we publish is derived
        // from the clamped size rather than clamped itself.
        applyResize(width - note.width, height - note.height)
      },
      [sizeFor, applyResize, note.width, note.height],
    )

    const handleResizeEnd = React.useCallback(
      (delta: GestureDelta, moved: boolean) => {
        if (!moved) {
          applyResize(0, 0)
          return
        }
        const { width, height } = sizeFor(delta)
        if (Math.round(width) === Math.round(note.width) &&
            Math.round(height) === Math.round(note.height)) {
          applyResize(0, 0)
          return
        }
        applyResize(width - note.width, height - note.height)
        void updateNoteSize(note.id, width, height)
      },
      [sizeFor, applyResize, note.id, note.width, note.height, updateNoteSize],
    )

    const resize = usePointerGesture({
      onStart: handleResizeStart,
      onMove: handleResizeMove,
      onEnd: handleResizeEnd,
      stopPropagation: true,
    })

    const nudgeSize = React.useCallback(
      (dw: number, dh: number) => {
        const { width, height } = clampNoteSize({
          width: note.width + dw,
          height: note.height + dh,
        })
        if (width === note.width && height === note.height) return
        void updateNoteSize(note.id, width, height)
      },
      [note.id, note.width, note.height, updateNoteSize],
    )

    const handleWidthKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowRight') nudgeSize(KEYBOARD_RESIZE_STEP, 0)
        else if (event.key === 'ArrowLeft') nudgeSize(-KEYBOARD_RESIZE_STEP, 0)
        else return
        event.preventDefault()
        event.stopPropagation()
      },
      [nudgeSize],
    )

    const handleHeightKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowDown') nudgeSize(0, KEYBOARD_RESIZE_STEP)
        else if (event.key === 'ArrowUp') nudgeSize(0, -KEYBOARD_RESIZE_STEP)
        else return
        event.preventDefault()
        event.stopPropagation()
      },
      [nudgeSize],
    )

    // ----- Settings and deletion ------------------------------------------

    const handleSettingsToggle = React.useCallback(() => {
      setShowSettings((open) => !open)
    }, [])

    const handleSettingsClose = React.useCallback(() => {
      setShowSettings(false)
      settingsButtonRef.current?.focus()
    }, [])

    const handleColorChange = React.useCallback(
      (color: StickyNoteColor) => {
        void updateNoteColor(note.id, color)
        setShowSettings(false)
        settingsButtonRef.current?.focus()
      },
      [note.id, updateNoteColor],
    )

    const handleDeleteClick = React.useCallback(() => {
      // Flushing text into a note being deleted is pointless churn.
      pendingTextRef.current = null
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      void deleteNote(note.id)
    }, [deleteNote, note.id])

    // Touch devices have no hover, so the handles are always visible there.
    const handleVisibility =
      'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100'
    const handleTint = 'bg-stone-900/15 hover:bg-stone-900/30'

    return (
      <div ref={ref} className={cn('relative group', className)}>
        <StickyNote
          ref={noteElementRef}
          className="sticky-note-content"
          noteId={note.id}
          title={localTitle}
          content={localContent}
          variant={note.settings.backgroundColor}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onSettingsClick={handleSettingsToggle}
          onDeleteClick={handleDeleteClick}
          onColorChange={handleColorChange}
          onColorPickerClose={handleSettingsClose}
          settingsButtonRef={settingsButtonRef}
          width={note.width}
          height={note.height}
          showSettings={showSettings}
        />

        {/* Resize handles. Hit areas are 24px and overhang the note edge, and
            the right handle starts below the header so it cannot swallow the
            delete button. */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Note width"
          aria-valuemin={NOTE_MIN_WIDTH}
          aria-valuemax={NOTE_MAX_WIDTH}
          aria-valuenow={Math.round(note.width)}
          aria-valuetext={`${Math.round(note.width)} pixels wide`}
          data-no-drag
          data-resize-direction="right"
          className={cn(
            'absolute top-10 -right-2 bottom-0 w-6 cursor-ew-resize touch-none rounded-r',
            'outline-none focus-visible:ring-2 focus-visible:ring-ring',
            handleVisibility,
            handleTint,
          )}
          onPointerDown={resize.onPointerDown}
          onKeyDown={handleWidthKeyDown}
        />

        <div
          role="slider"
          tabIndex={0}
          aria-label="Note height"
          aria-valuemin={NOTE_MIN_HEIGHT}
          aria-valuemax={NOTE_MAX_HEIGHT}
          aria-valuenow={Math.round(note.height)}
          aria-valuetext={`${Math.round(note.height)} pixels tall`}
          data-no-drag
          data-resize-direction="bottom"
          className={cn(
            'absolute -bottom-2 left-0 right-6 h-6 cursor-ns-resize touch-none rounded-b',
            'outline-none focus-visible:ring-2 focus-visible:ring-ring',
            handleVisibility,
            handleTint,
          )}
          onPointerDown={resize.onPointerDown}
          onKeyDown={handleHeightKeyDown}
        />

        {/* The corner is pointer-only: the two edge sliders already give
            keyboard control of both dimensions. */}
        <div
          aria-hidden="true"
          data-no-drag
          data-resize-direction="bottom-right"
          className={cn(
            'absolute -bottom-2 -right-2 h-6 w-6 cursor-se-resize touch-none rounded-br',
            handleVisibility,
            'bg-stone-900/25 hover:bg-stone-900/40',
          )}
          onPointerDown={resize.onPointerDown}
        />
      </div>
    )
  },
)

ResizableStickyNote.displayName = 'ResizableStickyNote'

export { ResizableStickyNote }
