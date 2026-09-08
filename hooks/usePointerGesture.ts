import { useCallback, useEffect, useRef, useState } from 'react'
import type React from 'react'

export interface GestureDelta {
  /** Movement since the gesture started, in client (screen) pixels. */
  dx: number
  dy: number
  clientX: number
  clientY: number
}

interface UsePointerGestureOptions {
  /** Return false to ignore this pointerdown entirely. */
  shouldStart?: (event: React.PointerEvent) => boolean
  onStart?: (event: React.PointerEvent) => void
  /** Called at most once per animation frame while the pointer moves. */
  onMove?: (delta: GestureDelta) => void
  /** `moved` is false when the pointer never passed the movement threshold. */
  onEnd?: (delta: GestureDelta, moved: boolean) => void
  /** Pixels of travel before the gesture counts as a move. Defaults to 3. */
  threshold?: number
  /** Call stopPropagation on pointerdown, so a handle does not also start a drag. */
  stopPropagation?: boolean
}

interface ActiveGesture {
  pointerId: number
  startX: number
  startY: number
  moved: boolean
  element: HTMLElement | null
}

/**
 * One pointer-event gesture primitive, shared by note dragging and resizing.
 *
 * Pointer events replace the previous mouse-only handlers, which made drag,
 * resize, pan and zoom completely unusable on a touch device.
 *
 * Three things it guarantees that the old code did not:
 *  - setPointerCapture, so the gesture keeps tracking outside the element and
 *    always receives a terminating event rather than getting stuck active.
 *  - a movement threshold, so a plain click is not treated as a zero-distance
 *    drag that still writes a position and marks the note dirty.
 *  - one onMove call per animation frame, and listeners attached once per
 *    gesture rather than re-attached on every move.
 */
export function usePointerGesture(options: UsePointerGestureOptions) {
  const [isActive, setIsActive] = useState(false)

  // All mutable inputs live in refs, so the listener effect depends only on
  // isActive and never tears its listeners down mid-gesture.
  const optionsRef = useRef(options)
  optionsRef.current = options

  const gestureRef = useRef<ActiveGesture>({
    pointerId: -1,
    startX: 0,
    startY: 0,
    moved: false,
    element: null,
  })

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    // Primary button only for mice; touch and pen have no button semantics here.
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (optionsRef.current.shouldStart && !optionsRef.current.shouldStart(event)) return

    const element = event.currentTarget
    element.setPointerCapture(event.pointerId)

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      element,
    }

    setIsActive(true)
    optionsRef.current.onStart?.(event)

    event.preventDefault()
    if (optionsRef.current.stopPropagation) event.stopPropagation()
  }, [])

  useEffect(() => {
    if (!isActive) return

    const gesture = gestureRef.current
    const element = gesture.element
    if (!element) return

    let frame: number | null = null
    let pending: GestureDelta | null = null
    let finished = false

    const deltaFrom = (event: PointerEvent): GestureDelta => ({
      dx: event.clientX - gesture.startX,
      dy: event.clientY - gesture.startY,
      clientX: event.clientX,
      clientY: event.clientY,
    })

    const flush = () => {
      frame = null
      if (!pending) return
      const delta = pending
      pending = null
      optionsRef.current.onMove?.(delta)
    }

    const handleMove = (event: PointerEvent) => {
      if (event.pointerId !== gesture.pointerId) return
      const delta = deltaFrom(event)

      if (!gesture.moved) {
        const threshold = optionsRef.current.threshold ?? 3
        if (Math.hypot(delta.dx, delta.dy) < threshold) return
        gesture.moved = true
      }

      pending = delta
      if (frame === null) frame = requestAnimationFrame(flush)
    }

    const finish = (event: PointerEvent) => {
      if (event.pointerId !== gesture.pointerId) return
      if (finished) return
      finished = true

      if (frame !== null) {
        cancelAnimationFrame(frame)
        frame = null
      }
      // Deliver any frame-pending move before ending, so the final position is
      // never a frame behind the pointer.
      if (pending) {
        const delta = pending
        pending = null
        optionsRef.current.onMove?.(delta)
      }

      setIsActive(false)
      optionsRef.current.onEnd?.(deltaFrom(event), gesture.moved)
    }

    element.addEventListener('pointermove', handleMove)
    element.addEventListener('pointerup', finish)
    element.addEventListener('pointercancel', finish)
    element.addEventListener('lostpointercapture', finish)

    return () => {
      element.removeEventListener('pointermove', handleMove)
      element.removeEventListener('pointerup', finish)
      element.removeEventListener('pointercancel', finish)
      element.removeEventListener('lostpointercapture', finish)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [isActive])

  return { isActive, onPointerDown }
}
