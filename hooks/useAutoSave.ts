import { useEffect, useRef, useCallback, useState } from 'react'
import { UpdateStickyNoteInput } from '@/types/stickyNote'

interface UseAutoSaveOptions {
  onSave: (data: UpdateStickyNoteInput) => Promise<void>
  delay?: number
  enabled?: boolean
}

export function useAutoSave({ onSave, delay = 5000, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingChangesRef = useRef<UpdateStickyNoteInput | null>(null)
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
    if (!pendingChangesRef.current || isSavingRef.current) return

    const dataToSave = { ...pendingChangesRef.current }
    pendingChangesRef.current = null
    isSavingRef.current = true
    
    // Update state to trigger re-render
    setSaveState({
      hasPendingChanges: false,
      isSaving: true
    })

    try {
      await onSave(dataToSave)
    } catch (error) {
      console.error('Auto-save failed:', error)
      // If save fails, restore the pending changes so they can be retried
      if (!pendingChangesRef.current) {
        pendingChangesRef.current = dataToSave
      }
    } finally {
      isSavingRef.current = false
      // Update state to trigger re-render
      setSaveState({
        hasPendingChanges: !!pendingChangesRef.current,
        isSaving: false
      })
    }
  }, [onSave, setSaveState])

  // Schedule a save with debouncing
  const scheduleSave = useCallback((data: UpdateStickyNoteInput) => {
    if (!enabled) return

    // Merge with existing pending changes
    pendingChangesRef.current = {
      ...pendingChangesRef.current,
      ...data,
    }
    
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
  }, [enabled, delay, clearAutoSaveTimeout, performSave, setSaveState])

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
