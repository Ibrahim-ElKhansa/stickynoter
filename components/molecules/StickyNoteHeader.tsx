'use client'

import * as React from "react"
import { Settings, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/atoms/TextInput"
import { Button } from "@/components/atoms/Button"

interface StickyNoteHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Used to build stable ids so the title input has a real label. */
  noteId: string
  title?: string
  onTitleChange?: (value: string) => void
  onSettingsClick?: () => void
  onDeleteClick?: () => void
  settingsButtonRef?: React.Ref<HTMLButtonElement>
  settingsOpen?: boolean
  colorPickerId?: string
  titlePlaceholder?: string
  disabled?: boolean
}

const StickyNoteHeader = React.forwardRef<HTMLDivElement, StickyNoteHeaderProps>(
  (
    {
      className,
      noteId,
      title,
      onTitleChange,
      onSettingsClick,
      onDeleteClick,
      settingsButtonRef,
      settingsOpen = false,
      colorPickerId,
      titlePlaceholder = "New Note",
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const titleId = `note-title-${noteId}`

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onTitleChange?.(event.target.value)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-10 shrink-0 items-center gap-1 border-b border-stone-900/15 px-3",
          className,
        )}
        {...props}
      >
        {/* A real label, not a placeholder standing in for one. */}
        <label htmlFor={titleId} className="sr-only">
          Note title
        </label>
        <Input
          id={titleId}
          seamless
          value={title ?? ""}
          onChange={handleTitleChange}
          placeholder={titlePlaceholder}
          disabled={disabled}
          data-no-drag
          className="min-w-0 flex-1 text-sm font-medium text-stone-900"
        />

        <div className="flex shrink-0 items-center gap-0.5" data-no-drag>
          <Button
            ref={settingsButtonRef}
            variant="note-ghost"
            size="icon-sm"
            onClick={onSettingsClick}
            disabled={disabled}
            aria-expanded={settingsOpen}
            aria-controls={colorPickerId}
          >
            <Settings aria-hidden="true" />
            <span className="sr-only">Change colour</span>
          </Button>
          {/* Labelled Delete, not Close. This permanently removes the note;
              calling it Close mislabelled a destructive action. */}
          <Button
            variant="note-danger-ghost"
            size="icon-sm"
            onClick={onDeleteClick}
            disabled={disabled}
          >
            <Trash2 aria-hidden="true" />
            <span className="sr-only">Delete note</span>
          </Button>
        </div>
      </div>
    )
  },
)

StickyNoteHeader.displayName = "StickyNoteHeader"

export { StickyNoteHeader }
