'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { StickyNote, CreateStickyNoteInput, UpdateStickyNoteInput, StickyNoteColor } from '@/types/stickyNote'
import { useAuth } from '@/lib/auth/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { mapStickyNoteFromDB, mapStickyNoteToDB, mapStickyNoteUpdateToDB } from '@/lib/utils/stickyNoteMappers'
import { useAutoSave } from '@/hooks/useAutoSave'

// Action types for the reducer
type StickyNoteAction =
  | { type: 'SET_NOTES'; payload: StickyNote[] }
  | { type: 'ADD_NOTE'; payload: StickyNote }
  | { type: 'UPDATE_NOTE'; payload: StickyNote }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// State interface
interface StickyNoteState {
  notes: StickyNote[]
  loading: boolean
  error: string | null
}

// Context interface
interface StickyNoteContextType {
  // State
  notes: StickyNote[]
  loading: boolean
  error: string | null
  
  // Actions
  createNote: (input: CreateStickyNoteInput) => Promise<void>
  updateNote: (input: UpdateStickyNoteInput) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  updateNoteColor: (id: string, color: StickyNoteColor) => Promise<void>
  updateNotePosition: (id: string, x: number, y: number) => Promise<void>
  updateNoteSize: (id: string, width: number, height: number) => Promise<void>
  updateNoteContent: (id: string, title?: string, content?: string) => Promise<void>
  loadNotes: () => Promise<void>
  clearError: () => void
  
  // Auto-save status
  hasPendingChanges: boolean
  isSaving: boolean
}

// Initial state
const initialState: StickyNoteState = {
  notes: [],
  loading: true,
  error: null,
}

// Reducer function
function stickyNoteReducer(state: StickyNoteState, action: StickyNoteAction): StickyNoteState {
  
  switch (action.type) {
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.payload,
        loading: false,
        error: null,
      }
    case 'ADD_NOTE':
      const newState = {
        ...state,
        notes: [...state.notes, action.payload],
        loading: false,
        error: null,
      }
      return newState
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note => 
          note.id === action.payload.id ? action.payload : note
        ),
        loading: false,
        error: null,
      }
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
        loading: false,
        error: null,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }
    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

// Create context
const StickyNoteContext = createContext<StickyNoteContextType | undefined>(undefined)

// Provider component
export function StickyNoteProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(stickyNoteReducer, initialState)
  const { user } = useAuth()
  const supabase = createClient()

  // Generate a unique ID for new notes
  const generateId = () => crypto.randomUUID()

  // Auto-save function for database updates
  const saveToDatabase = useCallback(async (updateData: UpdateStickyNoteInput) => {
    if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return // Only save if user is authenticated and Supabase is configured
    }
    
    try {
      const dbUpdate = mapStickyNoteUpdateToDB(updateData)
      const { error } = await supabase
        .from('sticky_notes')
        .update(dbUpdate)
        .eq('id', updateData.id)
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Failed to save to database:', error)
      // Don't dispatch error to avoid disrupting UX for database issues
    }
  }, [user, supabase])

  // Auto-save hook
  const { scheduleSave, forceSave, hasPendingChanges, isSaving } = useAutoSave({
    onSave: saveToDatabase,
    delay: 5000,
    enabled: !!user, // Only enable auto-save when authenticated
  })

  // Create a new sticky note
  const createNote = useCallback(async (input: CreateStickyNoteInput) => {
    const newNote: StickyNote = {
      id: generateId(),
      userId: user?.id || 'anonymous',
      title: input.title || '',
      content: input.content || '',
      settings: {
        backgroundColor: input.settings?.backgroundColor || 'yellow',
      },
      positionX: input.position_x,
      positionY: input.position_y,
      width: input.width || 350,
      height: input.height || 300,
      zIndex: input.z_index || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Optimistic create - add to local state immediately for instant UI feedback
    dispatch({ type: 'ADD_NOTE', payload: newNote })

    // Save to Supabase database in the background (if user is authenticated)
    if (user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const dbNote = mapStickyNoteToDB(newNote)
        const { error } = await supabase
          .from('sticky_notes')
          .insert([dbNote])

        if (error) {
          console.warn('Failed to save to database:', error)
          // Could potentially remove the note from state here if needed
          // But for now, we'll just log the error since the local create already happened
        }
      } catch (dbError) {
        console.warn('Database not configured or failed to save:', dbError)
        // Local creation already completed, so this is just a background operation
      }
    }
  }, [user, supabase])

  // Update an existing sticky note
  const updateNote = useCallback(async (input: UpdateStickyNoteInput) => {
    const existingNote = state.notes.find(note => note.id === input.id)
    if (!existingNote) {
      console.error('Note not found for update:', input.id)
      return
    }

    const updatedNote: StickyNote = {
      ...existingNote,
      title: input.title ?? existingNote.title,
      content: input.content ?? existingNote.content,
      settings: {
        ...existingNote.settings,
        ...input.settings,
      },
      positionX: input.positionX ?? existingNote.positionX,
      positionY: input.positionY ?? existingNote.positionY,
      width: input.width ?? existingNote.width,
      height: input.height ?? existingNote.height,
      zIndex: input.zIndex ?? existingNote.zIndex,
      updatedAt: new Date(),
    }

    // Optimistic update - update local state immediately for instant UI feedback
    dispatch({ type: 'UPDATE_NOTE', payload: updatedNote })

    // Schedule auto-save to database if user is authenticated
    if (user) {
      scheduleSave(input)
    }
  }, [user, state.notes, scheduleSave])

  // Delete a sticky note
  const deleteNote = useCallback(async (id: string) => {
    // Optimistic delete - remove from local state immediately for instant UI feedback
    dispatch({ type: 'DELETE_NOTE', payload: id })

    // Handle database deletion in the background (if user is authenticated)
    if (user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { error } = await supabase
          .from('sticky_notes')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) {
          console.warn('Failed to delete from database:', error)
          // Could potentially add the note back to state here if needed
          // But for now, we'll just log the error since the local delete already happened
        }
      } catch (dbError) {
        console.warn('Database not configured or failed to delete:', dbError)
        // Local deletion already completed, so this is just a background operation
      }
    }
  }, [user, supabase])

  // Convenience function to update note color
  const updateNoteColor = useCallback(async (id: string, color: StickyNoteColor) => {
    await updateNote({ 
      id, 
      settings: { backgroundColor: color } 
    })
  }, [updateNote])

  // Convenience function to update note position
  const updateNotePosition = useCallback(async (id: string, x: number, y: number) => {
    await updateNote({ 
      id, 
      positionX: x, 
      positionY: y 
    })
  }, [updateNote])

  // Convenience function to update note size
  const updateNoteSize = useCallback(async (id: string, width: number, height: number) => {
    await updateNote({ 
      id, 
      width, 
      height 
    })
  }, [updateNote])

  // Convenience function to update note content
  const updateNoteContent = useCallback(async (id: string, title?: string, content?: string) => {
    await updateNote({ 
      id, 
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content })
    })
  }, [updateNote])

  // Load notes from database
  const loadNotes = useCallback(async () => {
    if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      dispatch({ type: 'SET_NOTES', payload: [] })
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Load from Supabase database
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Convert database format to client format
      const notes = data ? data.map(mapStickyNoteFromDB) : []
      dispatch({ type: 'SET_NOTES', payload: notes })
    } catch (error) {
      console.warn('Failed to load notes from database:', error)
      // Set empty array on error instead of showing error to user
      dispatch({ type: 'SET_NOTES', payload: [] })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [user, supabase])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }, [])

  // Load notes when user changes
  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // Force save pending changes when user changes or component unmounts
  useEffect(() => {
    return () => {
      if (hasPendingChanges && user) {
        forceSave()
      }
    }
  }, [forceSave, hasPendingChanges, user])

  const contextValue: StickyNoteContextType = {
    notes: state.notes,
    loading: state.loading,
    error: state.error,
    createNote,
    updateNote,
    deleteNote,
    updateNoteColor,
    updateNotePosition,
    updateNoteSize,
    updateNoteContent,
    loadNotes,
    clearError,
    hasPendingChanges,
    isSaving,
  }

  return (
    <StickyNoteContext.Provider value={contextValue}>
      {children}
    </StickyNoteContext.Provider>
  )
}

// Hook to use the context
export function useStickyNotes() {
  const context = useContext(StickyNoteContext)
  if (context === undefined) {
    throw new Error('useStickyNotes must be used within a StickyNoteProvider')
  }
  return context
}
