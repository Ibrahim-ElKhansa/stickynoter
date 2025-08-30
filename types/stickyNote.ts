export type StickyNoteColor = 'yellow' | 'orange' | 'blue' | 'green' | 'pink' | 'purple'

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

export interface CreateStickyNoteInput {
  title: string
  content: string
  settings: StickyNoteSettings
  position_x: number
  position_y: number
  width: number
  height: number
  z_index: number
}

export interface UpdateStickyNoteInput {
  id: string
  title?: string
  content?: string
  settings?: StickyNoteSettings
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
