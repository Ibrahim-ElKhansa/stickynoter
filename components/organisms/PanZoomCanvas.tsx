'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'

interface PanCanvasProps {
  children: React.ReactNode
  className?: string
}

export function PanCanvas({ children, className }: PanCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan if clicking on the canvas background (not on sticky notes)
    const target = e.target as HTMLElement
    
    // Check if we're clicking on the canvas container itself or its background
    if (target === e.currentTarget || target.closest('[data-canvas-container]') === target) {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      e.preventDefault()
      
      // Change cursor during pan
      document.body.style.cursor = 'grabbing'
    }
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return

    const deltaX = e.clientX - lastPanPoint.x
    const deltaY = e.clientY - lastPanPoint.y

    const newTransform = {
      x: transform.x + deltaX,
      y: transform.y + deltaY,
      scale: transform.scale
    }

    setTransform(newTransform)
    setLastPanPoint({ x: e.clientX, y: e.clientY })

    // Emit transform change event for viewport center calculation
    window.dispatchEvent(new CustomEvent('canvasTransformChange', { 
      detail: newTransform 
    }))
  }, [isPanning, lastPanPoint, transform])

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)
      document.body.style.cursor = 'default'
    }
  }, [isPanning])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(3, transform.scale * zoomFactor))

    // Calculate zoom point to zoom into mouse position
    const scaleChange = newScale / transform.scale
    const newX = mouseX - (mouseX - transform.x) * scaleChange
    const newY = mouseY - (mouseY - transform.y) * scaleChange

    const newTransform = {
      x: newX,
      y: newY,
      scale: newScale
    }

    setTransform(newTransform)

    // Emit transform change event
    window.dispatchEvent(new CustomEvent('canvasTransformChange', { 
      detail: newTransform 
    }))
  }, [transform])

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = 'default'
      }
    }
  }, [isPanning, handleMouseMove, handleMouseUp])

  // Add wheel event listener with passive: false
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Emit initial transform state
  useEffect(() => {
    // Only emit initial state, not on every transform change
    const initialTransform = { x: 0, y: 0, scale: 1 }
    window.dispatchEvent(new CustomEvent('canvasTransformChange', { 
      detail: initialTransform 
    }))
  }, []) // Only run once on mount

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden cursor-grab ${className}`}
      onMouseDown={handleMouseDown}
      style={{
        backgroundColor: '#1a1a1a', // Dark gray background
        backgroundImage: `radial-gradient(circle, #666666 1px, transparent 1px)`, // Light gray dots
        backgroundSize: `${24 * transform.scale}px ${24 * transform.scale}px`,
        backgroundPosition: `${transform.x % (24 * transform.scale)}px ${transform.y % (24 * transform.scale)}px`,
        userSelect: 'none', // Prevent text selection while dragging
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        data-canvas-container
        style={{
          width: '100vw',
          height: '100vh',
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  )
}
