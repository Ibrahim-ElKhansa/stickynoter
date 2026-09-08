'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { StickyNoteHeader } from "@/components/molecules/StickyNoteHeader"
import { ColorPicker } from "@/components/molecules/ColorPicker"
import { Textarea } from "@/components/atoms/TextArea"
import {
  DEFAULT_STICKY_NOTE_COLOR,
  NOTE_DEFAULT_HEIGHT,
  NOTE_DEFAULT_WIDTH,
  STICKY_NOTE_VARIANTS,
} from "@/lib/constants/stickyNotes"
import type { StickyNoteColor } from "@/types/stickyNote"

interface StickyNoteProps extends React.HTMLAttributes<HTMLDivElement> {
  noteId: string
  title?: string
  content?: string
  onTitleChange?: (value: string) => void
  onContentChange?: (value: string) => void
  onSettingsClick?: () => void
  onDeleteClick?: () => void
  onColorChange?: (color: StickyNoteColor) => void
  onColorPickerClose?: () => void
  settingsButtonRef?: React.Ref<HTMLButtonElement>
  titlePlaceholder?: string
  contentPlaceholder?: string
  disabled?: boolean
  variant?: StickyNoteColor
  width?: number
  height?: number
  showSettings?: boolean
}

const StickyNote = React.forwardRef<HTMLDivElement, StickyNoteProps>(
  (
    {
      className,
      noteId,
      title,
      content,
      onTitleChange,
      onContentChange,
      onSettingsClick,
      onDeleteClick,
      onColorChange,
      onColorPickerClose,
      settingsButtonRef,
      titlePlaceholder = "New Note",
      contentPlaceholder = "Click here to edit...",
      disabled = false,
      variant = DEFAULT_STICKY_NOTE_COLOR,
      width = NOTE_DEFAULT_WIDTH,
      height = NOTE_DEFAULT_HEIGHT,
      showSettings = false,
      ...props
    },
    ref,
  ) => {
    const variantClass = STICKY_NOTE_VARIANTS[variant] ?? STICKY_NOTE_VARIANTS.yellow
    const bodyId = `note-body-${noteId}`
    const colorPickerId = `note-colors-${noteId}`

    return (
      <article
        // Spread first so a caller-supplied style cannot clobber the dimensions
        // below, which is what happened when style came first.
        {...props}
        ref={ref}
        aria-label={title ? `Note: ${title}` : "Untitled note"}
        className={cn(
          "relative flex flex-col overflow-hidden rounded-lg border-2 shadow-lg",
          variantClass,
          className,
        )}
        style={{
          // The resize gesture writes --resize-dw / --resize-dh, which React
          // never declares, so a mid-gesture re-render cannot undo it.
          width: `calc(${width}px + var(--resize-dw, 0px))`,
          height: `calc(${height}px + var(--resize-dh, 0px))`,
        }}
      >
        <StickyNoteHeader
          noteId={noteId}
          title={title}
          onTitleChange={onTitleChange}
          onSettingsClick={onSettingsClick}
          onDeleteClick={onDeleteClick}
          settingsButtonRef={settingsButtonRef}
          settingsOpen={showSettings}
          colorPickerId={onColorChange ? colorPickerId : undefined}
          titlePlaceholder={titlePlaceholder}
          disabled={disabled}
        />

        <div className="min-h-0 flex-1 p-3">
          <label htmlFor={bodyId} className="sr-only">
            Note contents
          </label>
          <Textarea
            id={bodyId}
            seamless
            value={content ?? ""}
            onChange={(event) => onContentChange?.(event.target.value)}
            placeholder={contentPlaceholder}
            disabled={disabled}
            data-no-drag
            className="h-full w-full resize-none text-sm text-stone-800"
          />
        </div>

        {/* Covers the whole note, including the header, so nothing underneath
            stays clickable while the picker is open. */}
        {showSettings && onColorChange ? (
          <ColorPicker
            id={colorPickerId}
            className="absolute inset-0 z-10 rounded-lg"
            selectedColor={variant}
            onColorSelect={onColorChange}
            onClose={onColorPickerClose}
          />
        ) : null}
      </article>
    )
  },
)

StickyNote.displayName = "StickyNote"

export { StickyNote }
