"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StickyNote,
  CreateStickyNoteInput,
  UpdateStickyNoteInput,
  StickyNoteColor,
  StickyNoteUpsertRow,
} from "@/types/stickyNote";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { upsertNotesKeepalive } from "@/lib/supabase/keepaliveUpsert";
import {
  mapStickyNoteFromDB,
  mapStickyNoteToUpsertRow,
} from "@/lib/utils/stickyNoteMappers";
import { useAutoSave } from "@/hooks/useAutoSave";
import { isSupabaseConfigured } from "@/lib/utils";
import {
  DEFAULT_STICKY_NOTE_COLOR,
  NOTE_DEFAULT_HEIGHT,
  NOTE_DEFAULT_WIDTH,
  Z_NOTE_MIN,
  clampNoteHeight,
  clampNoteWidth,
} from "@/lib/constants/stickyNotes";

/** userId stamped on notes created before sign-in. Never reaches the database. */
const ANONYMOUS_USER_ID = "anonymous";

/** How long an undo of a deletion stays available. */
const UNDO_WINDOW_MS = 8_000;

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
  bringToFront: (id: string) => void;
  loadNotes: () => Promise<void>;
  clearError: () => void;

  // Undo of the most recent deletion
  lastDeleted: StickyNote | null;
  undoDelete: () => Promise<void>;
  dismissUndo: () => void;

  // Auto-save status
  hasPendingChanges: boolean;
  isSaving: boolean;
}

const StickyNoteContext = createContext<StickyNoteContextType | undefined>(undefined);

type LoadStatus = "loading" | "ready";

export function StickyNoteProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const userId = user?.id ?? null;

  // notesRef is the source of truth; notes mirrors it for rendering. Reading
  // through the ref means two updates in the same tick compose instead of
  // clobbering each other, and the saver never sees a stale snapshot.
  const notesRef = useRef<StickyNote[]>([]);
  const [notes, setNotes] = useState<StickyNote[]>([]);

  // The dirty set lives in a ref, not state: nothing renders from it (the UI
  // reads hasPendingChanges from useAutoSave), and a ref has no render-lag
  // window for an already-armed timer to fall into.
  const dirtyIdsRef = useRef<Set<string>>(new Set());

  const [loadStatus, setLoadStatus] = useState<LoadStatus>(
    isSupabaseConfigured ? "loading" : "ready",
  );
  const [dataError, setDataError] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<StickyNote | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Guards against an older in-flight load installing its rows over a newer
  // one, which would show the previous account's notes.
  const loadGenerationRef = useRef(0);

  // Null when Supabase is not configured, so the app renders as a local-only
  // scratchpad instead of throwing during the first commit.
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);

  /** The single write path for notes. Stable identity; never closes over notes. */
  const commitNotes = useCallback((updater: (prev: StickyNote[]) => StickyNote[]) => {
    const next = updater(notesRef.current);
    notesRef.current = next;
    setNotes(next);
  }, []);

  const collectDirtyRows = useCallback(
    (ownerId: string): { attempted: StickyNote[]; rows: StickyNoteUpsertRow[] } => {
      const live = new Map(notesRef.current.map((note) => [note.id, note]));
      const attempted: StickyNote[] = [];
      const rows: StickyNoteUpsertRow[] = [];

      for (const id of dirtyIdsRef.current) {
        const note = live.get(id);
        if (!note) {
          // Deleted while dirty. It can never be saved, so stop tracking it.
          dirtyIdsRef.current.delete(id);
          continue;
        }
        attempted.push(note);
        // Stamp the owner so a note created before sign-in satisfies the RLS
        // WITH CHECK on insert.
        rows.push(mapStickyNoteToUpsertRow({ ...note, userId: ownerId }));
      }

      return { attempted, rows };
    },
    [],
  );

  const persistDirtyNotes = useCallback(async (): Promise<void> => {
    if (!supabase || !userId) return;
    if (dirtyIdsRef.current.size === 0) return;

    const { attempted, rows } = collectDirtyRows(userId);
    if (rows.length === 0) return;

    // The select is load-bearing, not decoration. A PostgREST write that
    // matches zero rows returns 2xx with no error, so reading back the ids that
    // were actually written is the only way to tell "saved" from "silently
    // discarded".
    const { data, error } = await supabase
      .from("sticky_notes")
      .upsert(rows, { onConflict: "id" })
      .select("id");

    if (error) {
      // Leave every attempted id dirty and reject, so useAutoSave retries with
      // backoff and the status chip tells the truth. Never mark a failed note
      // clean.
      throw new Error(`Failed to save ${rows.length} note(s): ${error.message}`);
    }

    const returned: { id: string }[] = data ?? [];
    const savedIds = new Set(returned.map((row) => row.id));
    const live = new Map(notesRef.current.map((note) => [note.id, note]));

    // Set difference against what the database actually confirmed, gated on the
    // note still being object-identical to what we sent. commitNotes always
    // allocates a fresh note object on edit, so object identity is the version
    // token: an edit that landed during the round trip stays dirty.
    for (const note of attempted) {
      if (!savedIds.has(note.id)) continue;
      if (live.get(note.id) === note) dirtyIdsRef.current.delete(note.id);
    }

    // A note deleted while this upsert was in flight has just been resurrected
    // server-side. Re-delete it rather than leaving a zombie until next reload.
    const resurrected = attempted
      .filter((note) => savedIds.has(note.id) && !live.has(note.id))
      .map((note) => note.id);
    if (resurrected.length > 0) {
      await supabase
        .from("sticky_notes")
        .delete()
        .in("id", resurrected)
        .eq("user_id", userId);
    }

    const unwritten = attempted.filter((note) => !savedIds.has(note.id));
    if (unwritten.length > 0) {
      // 2xx but fewer rows written than sent means a row level security policy
      // filtered them. This is the silent-zero-rows failure mode that used to
      // make lost notes undiagnosable, so make it loud.
      throw new Error(
        `Supabase accepted the request but only wrote ${savedIds.size}/${rows.length} rows. ` +
          `Unwritten: ${unwritten.map((note) => note.id).join(", ")}. ` +
          `Check row level security policies on sticky_notes.`,
      );
    }
  }, [supabase, userId, collectDirtyRows]);

  const {
    scheduleSave,
    flush,
    hasPendingChangesNow,
    hasPendingChanges,
    isSaving,
    saveError,
  } = useAutoSave({
    onSave: persistDirtyNotes,
    delay: 1_500,
    maxWait: 5_000,
    enabled: Boolean(userId) && isSupabaseConfigured,
  });

  const markDirty = useCallback(
    (id: string) => {
      if (!userId) return;
      dirtyIdsRef.current.add(id);
      scheduleSave();
    },
    [userId, scheduleSave],
  );

  const nextZIndex = useCallback((): number => {
    return notesRef.current.reduce(
      (max, note) => Math.max(max, note.zIndex + 1),
      Z_NOTE_MIN,
    );
  }, []);

  const createNote = useCallback(
    async (input: CreateStickyNoteInput): Promise<void> => {
      const now = new Date();
      const newNote: StickyNote = {
        id: crypto.randomUUID(),
        userId: userId ?? ANONYMOUS_USER_ID,
        title: input.title ?? "",
        content: input.content ?? "",
        settings: {
          backgroundColor: input.settings?.backgroundColor ?? DEFAULT_STICKY_NOTE_COLOR,
        },
        positionX: input.positionX,
        positionY: input.positionY,
        width: clampNoteWidth(input.width ?? NOTE_DEFAULT_WIDTH),
        height: clampNoteHeight(input.height ?? NOTE_DEFAULT_HEIGHT),
        zIndex: input.zIndex ?? nextZIndex(),
        createdAt: now,
        updatedAt: now,
      };

      // Optimistic create. No load-status write here: that is owned solely by
      // loadNotes, and touching it from a mutation used to cancel an in-flight
      // load's spinner.
      commitNotes((prev) => [...prev, newNote]);

      if (!userId) return; // anonymous: local only, adopted on sign-in

      // There is deliberately no dedicated INSERT. Creates and updates travel
      // the same upsert path, so a create can no longer fail while every later
      // update silently no-ops against a row that does not exist.
      dirtyIdsRef.current.add(newNote.id);
      scheduleSave();
      await flush();
    },
    [userId, commitNotes, nextZIndex, scheduleSave, flush],
  );

  const updateNote = useCallback(
    async (input: UpdateStickyNoteInput): Promise<void> => {
      let found = false;

      // The new value is derived inside the updater, from the freshest base, so
      // two updates in the same tick compose rather than clobber.
      commitNotes((prev) =>
        prev.map((note) => {
          if (note.id !== input.id) return note;
          found = true;
          return {
            ...note,
            title: input.title ?? note.title,
            content: input.content ?? note.content,
            settings: { ...note.settings, ...input.settings },
            positionX: input.positionX ?? note.positionX,
            positionY: input.positionY ?? note.positionY,
            width: input.width ?? note.width,
            height: input.height ?? note.height,
            zIndex: input.zIndex ?? note.zIndex,
            updatedAt: new Date(),
          };
        }),
      );

      if (!found) {
        console.error("Note not found for update:", input.id);
        return;
      }

      markDirty(input.id);
    },
    [commitNotes, markDirty],
  );

  const deleteNote = useCallback(
    async (id: string): Promise<void> => {
      const removed = notesRef.current.find((note) => note.id === id) ?? null;

      commitNotes((prev) => prev.filter((note) => note.id !== id));
      dirtyIdsRef.current.delete(id);

      if (removed) {
        setLastDeleted(removed);
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        undoTimerRef.current = setTimeout(() => setLastDeleted(null), UNDO_WINDOW_MS);
      }

      if (!supabase || !userId) return;

      const { error } = await supabase
        .from("sticky_notes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        // The note is gone from the UI but survives in the database, so it will
        // reappear on the next load. Say so rather than logging into the void.
        console.error("Failed to delete note:", error);
        setDataError(`Could not delete that note: ${error.message}`);
      }
    },
    [commitNotes, supabase, userId],
  );

  const undoDelete = useCallback(async (): Promise<void> => {
    const note = lastDeleted;
    if (!note) return;

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setLastDeleted(null);

    const restored: StickyNote = { ...note, updatedAt: new Date() };
    commitNotes((prev) =>
      prev.some((existing) => existing.id === restored.id) ? prev : [...prev, restored],
    );

    if (!userId) return;
    dirtyIdsRef.current.add(restored.id);
    scheduleSave();
    await flush();
  }, [lastDeleted, commitNotes, userId, scheduleSave, flush]);

  const dismissUndo = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setLastDeleted(null);
  }, []);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const updateNoteColor = useCallback(
    async (id: string, color: StickyNoteColor) => {
      await updateNote({ id, settings: { backgroundColor: color } });
    },
    [updateNote],
  );

  const updateNotePosition = useCallback(
    async (id: string, x: number, y: number) => {
      await updateNote({ id, positionX: x, positionY: y });
    },
    [updateNote],
  );

  const updateNoteSize = useCallback(
    async (id: string, width: number, height: number) => {
      await updateNote({ id, width, height });
    },
    [updateNote],
  );

  const updateNoteContent = useCallback(
    async (id: string, title?: string, content?: string) => {
      await updateNote({
        id,
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      });
    },
    [updateNote],
  );

  /** Raise a note above its siblings. No-op when it is already alone on top. */
  const bringToFront = useCallback(
    (id: string) => {
      const current = notesRef.current;
      const note = current.find((candidate) => candidate.id === id);
      if (!note) return;

      const highest = current.reduce(
        (max, candidate) => Math.max(max, candidate.zIndex),
        Z_NOTE_MIN,
      );
      const alreadyOnTop =
        note.zIndex === highest &&
        current.every((candidate) => candidate.id === id || candidate.zIndex < highest);
      if (alreadyOnTop) return;

      const target = highest + 1;
      commitNotes((prev) =>
        prev.map((candidate) =>
          candidate.id === id
            ? { ...candidate, zIndex: target, updatedAt: new Date() }
            : candidate,
        ),
      );
      markDirty(id);
    },
    [commitNotes, markDirty],
  );

  const loadNotes = useCallback(async (): Promise<void> => {
    const generation = ++loadGenerationRef.current;
    const isCurrent = () => loadGenerationRef.current === generation;

    if (!supabase || !userId) {
      // Signed out, or Supabase not configured. Clearing is deliberate: after a
      // sign-out the notes on screen belong to the previous account.
      commitNotes(() => []);
      dirtyIdsRef.current.clear();
      if (isCurrent()) setLoadStatus("ready");
      return;
    }

    setLoadStatus("loading");
    setDataError(null);

    const { data, error } = await supabase
      .from("sticky_notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    // A newer load, or a sign-out, superseded us. Installing these rows now
    // would show the wrong account's notes.
    if (!isCurrent()) return;

    if (error) {
      // Deliberately does NOT clear the notes. Wiping them on a transient
      // network error made the user's work look deleted, showed the "create
      // your first note" empty state, and let autosave treat the blank canvas
      // as the truth.
      console.error("Failed to load notes:", error);
      setDataError(
        `Could not load your notes: ${error.message}. Nothing has been overwritten.`,
      );
      setLoadStatus("ready");
      return;
    }

    const loaded: StickyNote[] = (data ?? []).map(mapStickyNoteFromDB);

    // Adopt anything created before sign-in rather than discarding it.
    const adopted = notesRef.current
      .filter((note) => note.userId === ANONYMOUS_USER_ID)
      .map((note) => ({ ...note, userId }));

    dirtyIdsRef.current.clear();
    commitNotes(() => [...loaded, ...adopted]);

    if (adopted.length > 0) {
      adopted.forEach((note) => dirtyIdsRef.current.add(note.id));
      scheduleSave();
    }

    setLoadStatus("ready");
  }, [supabase, userId, commitNotes, scheduleSave]);

  // The only unstable dependency of loadNotes is the primitive userId, so a
  // TOKEN_REFRESHED event (which hands out a new User object carrying the same
  // id) no longer triggers a reload that discards unsaved edits.
  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const accessTokenRef = useRef<string | null>(null);
  useEffect(() => {
    accessTokenRef.current = session?.access_token ?? null;
  }, [session]);

  // Flush pending work when the page is hidden or unloaded. visibilitychange
  // fires earlier and far more reliably than beforeunload, especially on
  // mobile, and pagehide covers back/forward cache and app switching.
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;

    const flushOnHide = () => {
      if (dirtyIdsRef.current.size === 0 && !hasPendingChangesNow()) return;
      const token = accessTokenRef.current;
      if (!token) return;
      const { rows } = collectDirtyRows(userId);
      if (rows.length === 0) return;
      upsertNotesKeepalive(rows, token);
      // Deliberately does not clear the dirty set: the response is
      // unobservable. If the page survives (a tab switch), the normal save path
      // writes the same rows again, and the upsert is idempotent.
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushOnHide();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flushOnHide);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flushOnHide);
      flushOnHide(); // provider teardown or sign-out: last chance
    };
  }, [userId, collectDirtyRows, hasPendingChangesNow]);

  const clearError = useCallback(() => setDataError(null), []);

  const error = useMemo(() => {
    if (dataError) return dataError;
    if (saveError) return `Could not save your changes: ${saveError.message}`;
    return null;
  }, [dataError, saveError]);

  const loading = loadStatus === "loading";

  const contextValue = useMemo<StickyNoteContextType>(
    () => ({
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
      bringToFront,
      loadNotes,
      clearError,
      lastDeleted,
      undoDelete,
      dismissUndo,
      hasPendingChanges,
      isSaving,
    }),
    [
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
      bringToFront,
      loadNotes,
      clearError,
      lastDeleted,
      undoDelete,
      dismissUndo,
      hasPendingChanges,
      isSaving,
    ],
  );

  return (
    <StickyNoteContext.Provider value={contextValue}>
      {children}
    </StickyNoteContext.Provider>
  );
}

export function useStickyNotes() {
  const context = useContext(StickyNoteContext);
  if (context === undefined) {
    throw new Error("useStickyNotes must be used within a StickyNoteProvider");
  }
  return context;
}
