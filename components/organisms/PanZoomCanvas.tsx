'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  useCanvasTransform,
  useCanvasTransformApi,
} from '@/lib/context/CanvasTransformContext'

interface PanZoomCanvasProps {
  children: React.ReactNode
  className?: string
}

const GRID_PITCH = 24
const KEYBOARD_PAN_STEP = 80
const KEYBOARD_ZOOM_STEP = 1.2
const WHEEL_ZOOM_IN = 1.1
const WHEEL_ZOOM_OUT = 0.9

type GestureMode = 'none' | 'pan' | 'pinch'

interface GestureState {
  mode: GestureMode
  /** Active pointers, keyed by pointerId, in client coordinates. */
  pointers: Map<number, { x: number; y: number }>
  lastPoint: { x: number; y: number }
  lastDistance: number
}

function midpointOf(points: { x: number; y: number }[]) {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
  return { x: sum.x / points.length, y: sum.y / points.length }
}

function distanceOf(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function PanZoomCanvas({ children, className = '' }: PanZoomCanvasProps) {
  const { viewportRef, panBy, zoomBy, resetTransform, setTransform } =
    useCanvasTransformApi()
  const transform = useCanvasTransform()

  const [isPanning, setIsPanning] = React.useState(false)
  const gestureRef = useRef<GestureState>({
    mode: 'none',
    pointers: new Map(),
    lastPoint: { x: 0, y: 0 },
    lastDistance: 0,
  })

  /**
   * A pan may only start on the background, never on a note. The two elements
   * that count as background are the viewport itself and the transformed
   * container; anything deeper belongs to a note.
   */
  const isBackground = useCallback((event: React.PointerEvent) => {
    const target = event.target as HTMLElement
    return target === event.currentTarget || target.hasAttribute('data-canvas-container')
  }, [])

  const endGesture = useCallback((pointerId: number) => {
    const gesture = gestureRef.current
    gesture.pointers.delete(pointerId)

    if (gesture.pointers.size === 0) {
      gesture.mode = 'none'
      setIsPanning(false)
      return
    }

    if (gesture.pointers.size === 1) {
      // Dropped from a pinch back to a single-finger pan. Re-seat the anchor so
      // the canvas does not jump by the distance between the two fingers.
      const remaining = [...gesture.pointers.values()][0]
      if (remaining) {
        gesture.mode = 'pan'
        gesture.lastPoint = remaining
      }
    }
  }, [])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const gesture = gestureRef.current

      // A second finger upgrades an in-progress pan to a pinch, even if it
      // landed on a note.
      if (gesture.pointers.size === 0 && !isBackground(event)) return

      gesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      // Capture so the gesture keeps tracking outside the element and always
      // delivers a pointerup, which is what stops a stuck pan.
      event.currentTarget.setPointerCapture(event.pointerId)

      const points = [...gesture.pointers.values()]
      if (points.length === 1) {
        gesture.mode = 'pan'
        gesture.lastPoint = points[0] ?? { x: 0, y: 0 }
        setIsPanning(true)
      } else if (points.length >= 2) {
        gesture.mode = 'pinch'
        gesture.lastPoint = midpointOf(points)
        gesture.lastDistance = distanceOf(points[0]!, points[1]!)
      }

      event.preventDefault()
    },
    [isBackground],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const gesture = gestureRef.current
      if (gesture.mode === 'none') return
      if (!gesture.pointers.has(event.pointerId)) return

      gesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      const points = [...gesture.pointers.values()]

      if (gesture.mode === 'pan' && points.length === 1) {
        const point = points[0]!
        panBy(point.x - gesture.lastPoint.x, point.y - gesture.lastPoint.y)
        gesture.lastPoint = point
        return
      }

      if (points.length >= 2) {
        const a = points[0]!
        const b = points[1]!
        const mid = midpointOf([a, b])
        const distance = distanceOf(a, b)

        // Pan by how far the midpoint moved, then zoom about the new midpoint.
        panBy(mid.x - gesture.lastPoint.x, mid.y - gesture.lastPoint.y)
        if (gesture.lastDistance > 0 && distance > 0) {
          zoomBy(distance / gesture.lastDistance, mid.x, mid.y)
        }

        gesture.lastPoint = mid
        gesture.lastDistance = distance
      }
    },
    [panBy, zoomBy],
  )

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      endGesture(event.pointerId)
    },
    [endGesture],
  )

  // Wheel needs a non-passive native listener so preventDefault can stop the
  // page from scrolling or the browser from zooming.
  useEffect(() => {
    const container = viewportRef.current
    if (!container) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (event.ctrlKey) {
        // Trackpad pinch arrives as a ctrl-wheel. Scale it down so it is not
        // wildly faster than a mouse wheel.
        const factor = Math.exp(-event.deltaY / 200)
        zoomBy(factor, event.clientX, event.clientY)
        return
      }
      zoomBy(event.deltaY > 0 ? WHEEL_ZOOM_OUT : WHEEL_ZOOM_IN, event.clientX, event.clientY)
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [viewportRef, zoomBy])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Only handle keys aimed at the canvas itself, never ones bubbling out of
      // a note's title or body.
      if (event.target !== event.currentTarget) return

      const rect = viewportRef.current?.getBoundingClientRect()
      const centreX = rect ? rect.left + rect.width / 2 : 0
      const centreY = rect ? rect.top + rect.height / 2 : 0

      switch (event.key) {
        case 'ArrowLeft':
          panBy(KEYBOARD_PAN_STEP, 0)
          break
        case 'ArrowRight':
          panBy(-KEYBOARD_PAN_STEP, 0)
          break
        case 'ArrowUp':
          panBy(0, KEYBOARD_PAN_STEP)
          break
        case 'ArrowDown':
          panBy(0, -KEYBOARD_PAN_STEP)
          break
        case '+':
        case '=':
          zoomBy(KEYBOARD_ZOOM_STEP, centreX, centreY)
          break
        case '-':
        case '_':
          zoomBy(1 / KEYBOARD_ZOOM_STEP, centreX, centreY)
          break
        case '0':
          resetTransform()
          break
        default:
          return
      }

      event.preventDefault()
    },
    [panBy, zoomBy, resetTransform, viewportRef],
  )

  // Keep the transform sane across a viewport resize or an orientation change.
  useEffect(() => {
    const onResize = () => setTransform((prev) => ({ ...prev }))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setTransform])

  const gridSize = GRID_PITCH * transform.scale

  return (
    <div
      ref={viewportRef}
      id="sticky-canvas"
      data-canvas-viewport
      role="group"
      aria-label="Sticky note canvas. Drag to pan. Arrow keys pan, plus and minus zoom, zero resets the view."
      tabIndex={0}
      className={cn(
        'relative h-full w-full overflow-hidden outline-none',
        'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
        isPanning ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
      onKeyDown={handleKeyDown}
      style={{
        backgroundColor: '#1a1a1a',
        backgroundImage: 'radial-gradient(circle, #666666 1px, transparent 1px)',
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${transform.x % gridSize}px ${transform.y % gridSize}px`,
        userSelect: 'none',
      }}
    >
      <div
        className="absolute top-0 left-0 h-full w-full origin-top-left"
        data-canvas-container
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  )
}
