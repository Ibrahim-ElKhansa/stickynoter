import { useEffect, useRef, useCallback, useState } from 'react'

interface UseAutoSaveOptions {
  onSave: () => Promise<void>
  delay?: number
  enabled?: boolean
}

export function useAutoSave({ onSave, delay = 5000, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasPendingChangesRef = useRef(false)
  const isSavingRef = useRef(false)
  
  // State to trigger re-renders
  const [saveState, setSaveState] = useState({
    hasPendingChanges: false,
    isSaving: false
  })

  // Clear existing timeout
  const clearAutoSaveTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Save function that handles the actual save operation
  const performSave = useCallback(async () => {
    if (!hasPendingChangesRef.current || isSavingRef.current) return

    hasPendingChangesRef.current = false
    isSavingRef.current = true
    
    // Update state to trigger re-render
    setSaveState({
      hasPendingChanges: false,
      isSaving: true
    })

    try {
      await onSave()
    } catch (error) {
      console.error('Auto-save failed:', error)
      // If save fails, mark that we still have pending changes
      hasPendingChangesRef.current = true
    } finally {
      isSavingRef.current = false
      // Update state to trigger re-render
      setSaveState({
        hasPendingChanges: hasPendingChangesRef.current,
        isSaving: false
      })
    }
  }, [onSave])

  // Schedule a save with debouncing - simplified to just mark that changes occurred
  const scheduleSave = useCallback(() => {
    if (!enabled) return

    // Mark that we have pending changes
    hasPendingChangesRef.current = true
    
    // Update state to trigger re-render
    setSaveState({
      hasPendingChanges: true,
      isSaving: false
    })

    // Clear existing timeout and set a new one
    clearAutoSaveTimeout()
    timeoutRef.current = setTimeout(() => {
      performSave()
    }, delay)
  }, [enabled, delay, clearAutoSaveTimeout, performSave])

  // Force immediate save (useful for manual save or before component unmount)
  const forceSave = useCallback(async () => {
    clearAutoSaveTimeout()
    await performSave()
  }, [clearAutoSaveTimeout, performSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoSaveTimeout()
    }
  }, [clearAutoSaveTimeout])

  return {
    scheduleSave,
    forceSave,
    hasPendingChanges: saveState.hasPendingChanges,
    isSaving: saveState.isSaving,
  }
}
