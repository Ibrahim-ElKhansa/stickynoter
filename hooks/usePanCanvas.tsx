'use client'

import { useState, useEffect, useCallback } from 'react'

export function usePanCanvas() {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isInitialized, setIsInitialized] = useState(false)

  // Function to get the current viewport center in canvas coordinates
  const getViewportCenter = useCallback(() => {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight - 64 // Subtract navbar height

    // Calculate center in viewport coordinates
    const viewportCenterX = viewportWidth / 2
    const viewportCenterY = viewportHeight / 2 + 64 // Add navbar offset back

    // Convert to canvas coordinates accounting for transform and scale
    const canvasCenterX = (viewportCenterX - transform.x) / transform.scale
    const canvasCenterY = (viewportCenterY - transform.y) / transform.scale

    return { x: canvasCenterX, y: canvasCenterY }
  }, [transform])

  // Listen for transform changes from the canvas
  useEffect(() => {
    const handleTransformChange = (event: CustomEvent) => {
      setTransform(event.detail)
      if (!isInitialized) {
        setIsInitialized(true)
      }
    }

    // Initialize with current canvas transform if available
    const initializeTransform = () => {
      const canvasContainer = document.querySelector('[data-canvas-container]') as HTMLElement
      if (canvasContainer) {
        const style = getComputedStyle(canvasContainer)
        const matrix = style.transform
        if (matrix && matrix !== 'none') {
          const values = matrix.match(/matrix.*\((.+)\)/)?.[1].split(', ')
          if (values && values.length >= 6) {
            const initialTransform = {
              x: parseFloat(values[4]) || 0,
              y: parseFloat(values[5]) || 0,
              scale: parseFloat(values[0]) || 1
            }
            setTransform(initialTransform)
            setIsInitialized(true)
          }
        } else {
          // No transform applied yet, set to initial state
          setTransform({ x: 0, y: 0, scale: 1 })
          setIsInitialized(true)
        }
      }
    }

    // Try to initialize immediately
    initializeTransform()

    // If not initialized, try again after a short delay
    if (!isInitialized) {
      const timeout = setTimeout(initializeTransform, 100)
      return () => clearTimeout(timeout)
    }

    window.addEventListener('canvasTransformChange', handleTransformChange as EventListener)
    
    return () => {
      window.removeEventListener('canvasTransformChange', handleTransformChange as EventListener)
    }
  }, [isInitialized])

  return {
    getViewportCenter,
    transform,
    isInitialized
  }
}
