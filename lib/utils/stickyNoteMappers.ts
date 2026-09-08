import { DEFAULT_STICKY_NOTE_COLOR, isStickyNoteColor } from '@/lib/constants/stickyNotes'
import type {
  StickyNote,
  StickyNoteColor,
  StickyNoteDB,
  StickyNoteUpsertRow,
} from '@/types/stickyNote'

/**
 * `settings` is a jsonb column, so the row shape is a claim rather than a
 * guarantee. Narrow it instead of trusting the declared type.
 */
function toStickyNoteColor(value: unknown): StickyNoteColor {
  return isStickyNoteColor(value) ? value : DEFAULT_STICKY_NOTE_COLOR
}

function toDate(value: string | null | undefined): Date {
  const parsed = value ? new Date(value) : new Date()
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/**
 * Converts a StickyNoteDB (database format) to StickyNote (client format).
 */
export function mapStickyNoteFromDB(dbNote: StickyNoteDB): StickyNote {
  return {
    id: dbNote.id,
    userId: dbNote.user_id,
    title: dbNote.title ?? '',
    content: dbNote.content ?? '',
    settings: {
      backgroundColor: toStickyNoteColor(dbNote.settings?.backgroundColor),
    },
    positionX: toFiniteNumber(dbNote.position_x, 0),
    positionY: toFiniteNumber(dbNote.position_y, 0),
    width: toFiniteNumber(dbNote.width, 300),
    height: toFiniteNumber(dbNote.height, 200),
    zIndex: toFiniteNumber(dbNote.z_index, 1),
    createdAt: toDate(dbNote.created_at),
    updatedAt: toDate(dbNote.updated_at),
  }
}

/**
 * Converts a StickyNote to the row we upsert.
 *
 * Both creates and updates travel this single path. There is deliberately no
 * partial-update mapper: a partial UPDATE that matches zero rows returns 2xx
 * with no error from PostgREST, which is what made a failed insert followed by
 * a lifetime of silent no-op updates undetectable.
 */
export function mapStickyNoteToUpsertRow(note: StickyNote): StickyNoteUpsertRow {
  return {
    id: note.id,
    user_id: note.userId,
    title: note.title,
    content: note.content,
    settings: { backgroundColor: toStickyNoteColor(note.settings?.backgroundColor) },
    position_x: Math.round(note.positionX),
    position_y: Math.round(note.positionY),
    width: Math.round(note.width),
    height: Math.round(note.height),
    z_index: Math.round(note.zIndex),
    updated_at: new Date().toISOString(),
  }
}
