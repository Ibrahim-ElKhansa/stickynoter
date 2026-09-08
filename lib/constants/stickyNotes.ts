import type { StickyNoteColor } from '@/types/stickyNote'

/**
 * Single source of truth for sticky-note colours, sizes and stacking.
 *
 * Before this module the nine-colour list existed in five places and the
 * default note size in three that disagreed with each other.
 */

export const STICKY_NOTE_COLORS = [
  'yellow',
  'orange',
  'blue',
  'green',
  'pink',
  'purple',
  'red',
  'teal',
  'gray',
] as const satisfies readonly StickyNoteColor[]

export const DEFAULT_STICKY_NOTE_COLOR: StickyNoteColor = 'yellow'

/** Tailwind classes per colour, used for both the note body and its swatch. */
export const STICKY_NOTE_VARIANTS: Record<StickyNoteColor, string> = {
  yellow: 'bg-yellow-300 border-yellow-500 shadow-yellow-500/20',
  orange: 'bg-orange-300 border-orange-500 shadow-orange-500/20',
  blue: 'bg-blue-300 border-blue-500 shadow-blue-500/20',
  green: 'bg-green-300 border-green-500 shadow-green-500/20',
  pink: 'bg-pink-300 border-pink-500 shadow-pink-500/20',
  purple: 'bg-purple-300 border-purple-500 shadow-purple-500/20',
  red: 'bg-red-300 border-red-500 shadow-red-500/20',
  teal: 'bg-teal-300 border-teal-500 shadow-teal-500/20',
  gray: 'bg-gray-300 border-gray-500 shadow-gray-500/20',
}

/** Human-readable colour names, for accessible labels. */
export const STICKY_NOTE_COLOR_LABELS: Record<StickyNoteColor, string> = {
  yellow: 'Yellow',
  orange: 'Orange',
  blue: 'Blue',
  green: 'Green',
  pink: 'Pink',
  purple: 'Purple',
  red: 'Red',
  teal: 'Teal',
  gray: 'Gray',
}

export function isStickyNoteColor(value: unknown): value is StickyNoteColor {
  return (STICKY_NOTE_COLORS as readonly string[]).includes(value as string)
}

export function randomStickyNoteColor(): StickyNoteColor {
  const index = Math.floor(Math.random() * STICKY_NOTE_COLORS.length)
  return STICKY_NOTE_COLORS[index] ?? DEFAULT_STICKY_NOTE_COLOR
}

// Sizes, in canvas pixels. These are mirrored by the CHECK constraint in
// supabase/migrations/20260908000000_sticky_notes.sql, so widen both together.
export const NOTE_DEFAULT_WIDTH = 300
export const NOTE_DEFAULT_HEIGHT = 200
export const NOTE_MIN_WIDTH = 200
export const NOTE_MIN_HEIGHT = 200
export const NOTE_MAX_WIDTH = 800
export const NOTE_MAX_HEIGHT = 800

export function clampNoteWidth(width: number): number {
  return Math.max(NOTE_MIN_WIDTH, Math.min(NOTE_MAX_WIDTH, width))
}

export function clampNoteHeight(height: number): number {
  return Math.max(NOTE_MIN_HEIGHT, Math.min(NOTE_MAX_HEIGHT, height))
}

export function clampNoteSize(size: { width: number; height: number }) {
  return {
    width: clampNoteWidth(size.width),
    height: clampNoteHeight(size.height),
  }
}

// Stacking bands. Note z-indexes are user data and grow from 1 upward, so the
// active-gesture band sits far above anything a user can reach by clicking.
export const Z_NOTE_MIN = 1
export const Z_NOTE_ACTIVE = 100000

/** Zoom limits for the canvas. */
export const CANVAS_MIN_SCALE = 0.2
export const CANVAS_MAX_SCALE = 3
