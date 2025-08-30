import { StickyNote, StickyNoteDB, UpdateStickyNoteInput } from '@/types/stickyNote'

/**
 * Converts a StickyNoteDB (database format) to StickyNote (client format)
 */
export function mapStickyNoteFromDB(dbNote: StickyNoteDB): StickyNote {
  return {
    id: dbNote.id,
    userId: dbNote.user_id,
    title: dbNote.title,
    content: dbNote.content,
    settings: dbNote.settings,
    positionX: dbNote.position_x,
    positionY: dbNote.position_y,
    width: dbNote.width,
    height: dbNote.height,
    zIndex: dbNote.z_index,
    createdAt: new Date(dbNote.created_at),
    updatedAt: new Date(dbNote.updated_at),
  }
}

/**
 * Converts a StickyNote (client format) to StickyNoteDB (database format)
 */
export function mapStickyNoteToDB(note: StickyNote): StickyNoteDB {
  return {
    id: note.id,
    user_id: note.userId,
    title: note.title,
    content: note.content,
    settings: note.settings,
    position_x: Math.round(note.positionX),
    position_y: Math.round(note.positionY),
    width: Math.round(note.width),
    height: Math.round(note.height),
    z_index: note.zIndex,
    created_at: note.createdAt.toISOString(),
    updated_at: note.updatedAt.toISOString(),
  }
}

/**
 * Converts partial StickyNote updates to database format
 */
export function mapStickyNoteUpdateToDB(
  update: UpdateStickyNoteInput
): Partial<Omit<StickyNoteDB, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {
  const dbUpdate: Partial<Omit<StickyNoteDB, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {}
  
  if (update.title !== undefined) dbUpdate.title = update.title
  if (update.content !== undefined) dbUpdate.content = update.content
  if (update.settings !== undefined) {
    // Ensure settings has backgroundColor if it's being updated
    dbUpdate.settings = {
      backgroundColor: update.settings.backgroundColor || 'default'
    }
  }
  if (update.positionX !== undefined) dbUpdate.position_x = Math.round(update.positionX)
  if (update.positionY !== undefined) dbUpdate.position_y = Math.round(update.positionY)
  if (update.width !== undefined) dbUpdate.width = Math.round(update.width)
  if (update.height !== undefined) dbUpdate.height = Math.round(update.height)
  if (update.zIndex !== undefined) dbUpdate.z_index = update.zIndex
  
  return dbUpdate
}
