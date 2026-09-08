export type StickyNoteColor =
  | 'yellow'
  | 'orange'
  | 'blue'
  | 'green'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'gray'

export interface StickyNoteSettings {
  backgroundColor: StickyNoteColor
}

// Client-side interface (camelCase)
export interface StickyNote {
  id: string
  userId: string
  title: string
  content: string
  settings: StickyNoteSettings
  positionX: number
  positionY: number
  width: number
  height: number
  zIndex: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Only the position is required: it is the one field with no sensible default.
 * Everything else falls back to the constants in lib/constants/stickyNotes.ts.
 */
export interface CreateStickyNoteInput {
  positionX: number
  positionY: number
  title?: string
  content?: string
  settings?: Partial<StickyNoteSettings>
  width?: number
  height?: number
  zIndex?: number
}

export interface UpdateStickyNoteInput {
  id: string
  title?: string
  content?: string
  settings?: Partial<StickyNoteSettings>
  positionX?: number
  positionY?: number
  width?: number
  height?: number
  zIndex?: number
}

// Database interface (snake_case)
export interface StickyNoteDB {
  id: string
  user_id: string
  title: string
  content: string
  settings: StickyNoteSettings
  position_x: number
  position_y: number
  width: number
  height: number
  z_index: number
  created_at: string
  updated_at: string
}

/**
 * Upsert payload. `created_at` is omitted so the column default owns it on
 * insert and it is never rewritten on update, which keeps the load ordering
 * server-authoritative and immune to client clock skew.
 */
export type StickyNoteUpsertRow = Omit<StickyNoteDB, 'created_at'>
