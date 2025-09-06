"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { StickyNote, CreateStickyNoteInput, UpdateStickyNoteInput, StickyNoteColor } from "@/types/stickyNote";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { mapStickyNoteFromDB, mapStickyNoteToDB, mapStickyNoteUpdateToDB } from "@/lib/utils/stickyNoteMappers";
import { useAutoSave } from "@/hooks/useAutoSave";

// Context interface
interface StickyNoteContextType {
  // State
  notes: StickyNote[];
  loading: boolean;
  error: string | null;

  // Actions
  createNote: (input: CreateStickyNoteInput) => Promise<void>;
  updateNote: (input: UpdateStickyNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateNoteColor: (id: string, color: StickyNoteColor) => Promise<void>;
  updateNotePosition: (id: string, x: number, y: number) => Promise<void>;
  updateNoteSize: (id: string, width: number, height: number) => Promise<void>;
  updateNoteContent: (id: string, title?: string, content?: string) => Promise<void>;
  loadNotes: () => Promise<void>;
  clearError: () => void;

  // Auto-save status
  hasPendingChanges: boolean;
  isSaving: boolean;
}

// Create context
const StickyNoteContext = createContext<StickyNoteContextType | undefined>(undefined);

// Provider component
export function StickyNoteProvider({ children }: { children: React.ReactNode }) {
  // Individual useState hooks instead of useReducer
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modifiedNoteIds, setModifiedNoteIds] = useState<Set<string>>(new Set());
  const [lastSaveTime, setLastSaveTime] = useState(0);

  // Use refs to avoid stale closure issues in auto-save timeout
  const notesRef = useRef<StickyNote[]>([]);
  const modifiedNoteIdsRef = useRef<Set<string>>(new Set());

  // Keep refs in sync with state
  React.useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  React.useEffect(() => {
    modifiedNoteIdsRef.current = modifiedNoteIds;
  }, [modifiedNoteIds]);

  const { user } = useAuth();

  // Memoize the Supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), []);

  // Generate a unique ID for new notes
  const generateId = () => crypto.randomUUID();

  // Batch save function for all modified notes
  const saveAllModifiedNotes = useCallback(async () => {
    if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return; // Only save if user is authenticated and Supabase is configured
    }

    // Use refs to get current values (avoid stale closure)
    const currentModifiedNoteIds = modifiedNoteIdsRef.current;
    const currentNotes = notesRef.current;

    if (currentModifiedNoteIds.size === 0) {
      return; // No modified notes to save
    }

    try {
      // Get all modified notes
      const modifiedNotes = currentNotes.filter((note) => currentModifiedNoteIds.has(note.id));

      if (modifiedNotes.length === 0) {
        setModifiedNoteIds(new Set());
        return;
      }

      // Save all modified notes to database
      for (const note of modifiedNotes) {
        const updateData: UpdateStickyNoteInput = {
          id: note.id,
          title: note.title,
          content: note.content,
          settings: note.settings,
          positionX: note.positionX,
          positionY: note.positionY,
          width: note.width,
          height: note.height,
          zIndex: note.zIndex,
        };

        const dbUpdate = mapStickyNoteUpdateToDB(updateData);
        const { error } = await supabase.from("sticky_notes").update(dbUpdate).eq("id", note.id).eq("user_id", user.id);

        if (error) {
          console.error(`Failed to save note ${note.id}:`, error);
        }
      }

      // Clear modified notes and update last save time
      setModifiedNoteIds(new Set());
      setLastSaveTime(Date.now());
    } catch (error) {
      console.error("Failed to save modified notes:", error);
      // Don't dispatch error to avoid disrupting UX for database issues
    }
  }, [user, supabase]);

  // Auto-save hook
  const { scheduleSave, forceSave, hasPendingChanges, isSaving } = useAutoSave({
    onSave: saveAllModifiedNotes,
    delay: 5000,
    enabled: !!user, // Only enable auto-save when authenticated
  });

  // Create a new sticky note
  const createNote = useCallback(
    async (input: CreateStickyNoteInput) => {
      const newNote: StickyNote = {
        id: generateId(),
        userId: user?.id || "anonymous",
        title: input.title || "",
        content: input.content || "",
        settings: {
          backgroundColor: input.settings?.backgroundColor || "yellow",
        },
        positionX: input.position_x,
        positionY: input.position_y,
        width: input.width || 350,
        height: input.height || 300,
        zIndex: input.z_index || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistic create - add to local state immediately for instant UI feedback
      setNotes((prev) => [...prev, newNote]);
      setLoading(false);
      setError(null);
      setModifiedNoteIds((prev) => new Set([...prev, newNote.id]));

      // Save to Supabase database in the background (if user is authenticated)
      if (user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          const dbNote = mapStickyNoteToDB(newNote);
          const { error } = await supabase.from("sticky_notes").insert([dbNote]);

          if (error) {
            console.warn("Failed to save to database:", error);
            // Could potentially remove the note from state here if needed
            // But for now, we'll just log the error since the local create already happened
          }
        } catch (dbError) {
          console.warn("Database not configured or failed to save:", dbError);
          // Local creation already completed, so this is just a background operation
        }
      }
    },
    [user, supabase]
  );

  // Update an existing sticky note
  const updateNote = useCallback(
    async (input: UpdateStickyNoteInput) => {
      const existingNote = notes.find((note) => note.id === input.id);
      if (!existingNote) {
        console.error("Note not found for update:", input.id);
        return;
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
      };

      // Optimistic update - update local state immediately for instant UI feedback
      setNotes((prev) => prev.map((note) => (note.id === input.id ? updatedNote : note)));
      setLoading(false);
      setError(null);
      setModifiedNoteIds((prev) => new Set([...prev, input.id]));

      // Schedule auto-save if user is authenticated
      if (user) {
        scheduleSave(); // Just notify that changes occurred
      }
    },
    [user, notes, scheduleSave]
  );

  // Delete a sticky note
  const deleteNote = useCallback(
    async (id: string) => {
      // Optimistic delete - remove from local state immediately for instant UI feedback
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setLoading(false);
      setError(null);
      setModifiedNoteIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      // Handle database deletion in the background (if user is authenticated)
      if (user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          const { error } = await supabase.from("sticky_notes").delete().eq("id", id).eq("user_id", user.id);

          if (error) {
            console.warn("Failed to delete from database:", error);
            // Could potentially add the note back to state here if needed
            // But for now, we'll just log the error since the local delete already happened
          }
        } catch (dbError) {
          console.warn("Database not configured or failed to delete:", dbError);
          // Local deletion already completed, so this is just a background operation
        }
      }
    },
    [user, supabase]
  );

  // Convenience function to update note color
  const updateNoteColor = useCallback(
    async (id: string, color: StickyNoteColor) => {
      await updateNote({
        id,
        settings: { backgroundColor: color },
      });
    },
    [updateNote]
  );

  // Convenience function to update note position
  const updateNotePosition = useCallback(
    async (id: string, x: number, y: number) => {
      await updateNote({
        id,
        positionX: x,
        positionY: y,
      });
    },
    [updateNote]
  );

  // Convenience function to update note size
  const updateNoteSize = useCallback(
    async (id: string, width: number, height: number) => {
      await updateNote({
        id,
        width,
        height,
      });
    },
    [updateNote]
  );

  // Convenience function to update note content
  const updateNoteContent = useCallback(
    async (id: string, title?: string, content?: string) => {
      await updateNote({
        id,
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      });
    },
    [updateNote]
  );

  // Load notes from database
  const loadNotes = useCallback(async () => {
    if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load from Supabase database
      const { data, error } = await supabase.from("sticky_notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

      if (error) throw error;

      // Convert database format to client format
      const loadedNotes = data ? data.map(mapStickyNoteFromDB) : [];
      setNotes(loadedNotes);
      setLoading(false);
      setError(null);
      setModifiedNoteIds(new Set()); // Clear modified notes when loading fresh data
    } catch (error) {
      console.warn("Failed to load notes from database:", error);
      // Set empty array on error instead of showing error to user
      setNotes([]);
      setLoading(false);
    }
  }, [user, supabase]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load notes when user changes
  useEffect(() => {
    const loadNotesForUser = async () => {
      if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setNotes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Load from Supabase database
        const { data, error } = await supabase.from("sticky_notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

        if (error) throw error;

        // Convert database format to client format
        const loadedNotes = data ? data.map(mapStickyNoteFromDB) : [];
        setNotes(loadedNotes);
        setLoading(false);
        setError(null);
        setModifiedNoteIds(new Set()); // Clear modified notes when loading fresh data
      } catch (error) {
        console.warn("Failed to load notes from database:", error);
        // Set empty array on error instead of showing error to user
        setNotes([]);
        setLoading(false);
      }
    };

    loadNotesForUser();
  }, [user, supabase]); // Depend on user and the memoized supabase client

  // Force save pending changes when user changes or component unmounts
  useEffect(() => {
    return () => {
      if (hasPendingChanges && user) {
        forceSave();
      }
    };
  }, [forceSave, hasPendingChanges, user]);

  const contextValue: StickyNoteContextType = {
    notes,
    loading,
    error,
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
  };

  return <StickyNoteContext.Provider value={contextValue}>{children}</StickyNoteContext.Provider>;
}

// Hook to use the context
export function useStickyNotes() {
  const context = useContext(StickyNoteContext);
  if (context === undefined) {
    throw new Error("useStickyNotes must be used within a StickyNoteProvider");
  }
  return context;
}
