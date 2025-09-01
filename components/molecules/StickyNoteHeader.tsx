import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/atoms/TextInput"
import { Button } from "@/components/atoms/Button"

interface StickyNoteHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  onTitleChange?: (value: string) => void
  onSettingsClick?: () => void
  onCloseClick?: () => void
  titlePlaceholder?: string
  disabled?: boolean
}

const StickyNoteHeader = React.forwardRef<HTMLDivElement, StickyNoteHeaderProps>(
  ({
    className,
    title,
    onTitleChange,
    onSettingsClick,
    onCloseClick,
    titlePlaceholder = "New Note",
    disabled = false,
    ...props
  }, ref) => {
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onTitleChange?.(e.target.value)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 px-3 border-b bg-background/50",
          className
        )}
        {...props}
      >
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder={titlePlaceholder}
          disabled={disabled}
          className="flex-1 min-w-0 !border-0 !border-none bg-transparent px-0 py-1 h-auto text-sm font-medium !focus-visible:ring-0 !focus-visible:border-0 !ring-0 !shadow-none placeholder:text-gray-600 text-gray-900"
        />
        
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="settings-ghost"
            size="icon"
            onClick={onSettingsClick}
            disabled={disabled}
          />
          <Button
            variant="close-ghost"
            size="icon"
            onClick={onCloseClick}
            disabled={disabled}
          />
        </div>
      </div>
    )
  }
)

StickyNoteHeader.displayName = "StickyNoteHeader"

export { StickyNoteHeader }
