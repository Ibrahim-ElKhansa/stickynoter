import * as React from "react"
import { cn } from "@/lib/utils"
import { StickyNoteHeader } from "@/components/molecules/StickyNoteHeader"
import { Textarea } from "@/components/atoms/TextArea"
import { StickyNoteColor } from "@/types/stickyNote"

interface StickyNoteProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  content?: string
  onTitleChange?: (value: string) => void
  onContentChange?: (value: string) => void
  onSettingsClick?: () => void
  onCloseClick?: () => void
  onColorChange?: (color: StickyNoteColor) => void
  titlePlaceholder?: string
  contentPlaceholder?: string
  disabled?: boolean
  variant?: StickyNoteColor
  width?: number
  height?: number
  showSettings?: boolean
}

const stickyNoteVariants = {
  yellow: "bg-yellow-300 border-yellow-500 shadow-yellow-500/20",
  orange: "bg-orange-300 border-orange-500 shadow-orange-500/20",
  blue: "bg-blue-300 border-blue-500 shadow-blue-500/20",
  green: "bg-green-300 border-green-500 shadow-green-500/20",
  pink: "bg-pink-300 border-pink-500 shadow-pink-500/20",
  purple: "bg-purple-300 border-purple-500 shadow-purple-500/20",
}

const StickyNote = React.forwardRef<HTMLDivElement, StickyNoteProps>(
  ({
    className,
    title,
    content,
    onTitleChange,
    onContentChange,
    onSettingsClick,
    onCloseClick,
    onColorChange,
    titlePlaceholder = "New Note",
    contentPlaceholder = "Click here to edit...",
    disabled = false,
    variant = "yellow",
    width = 300,
    height = 200,
    showSettings = false,
    ...props
  }, ref) => {
    const variantClass = stickyNoteVariants[variant] || stickyNoteVariants.yellow

    return (
      <div
        ref={ref}
        className={cn(
          "relative border-2 rounded-lg shadow-lg",
          "flex flex-col",
          variantClass,
          className
        )}
        style={{ width: `${width}px`, height: `${height}px` }}
        {...props}
      >
        {/* Header */}
        <StickyNoteHeader
          title={title}
          onTitleChange={onTitleChange}
          onSettingsClick={onSettingsClick}
          onCloseClick={onCloseClick}
          titlePlaceholder={titlePlaceholder}
          disabled={disabled}
        />

        {/* Content Area */}
        <div className="flex-1 p-3 relative">
          {/* Show settings overlay when settings is active */}
          {showSettings && onColorChange ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-b-lg">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-800 mb-3">Choose Color</h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(stickyNoteVariants).map(([color]) => (
                    <button
                      key={color}
                      onClick={() => onColorChange(color as StickyNoteColor)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform",
                        stickyNoteVariants[color as StickyNoteColor],
                        variant === color ? "ring-2 ring-gray-600 ring-offset-1" : "border-gray-300"
                      )}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => onContentChange?.(e.target.value)}
              placeholder={contentPlaceholder}
              disabled={disabled}
              className="w-full h-full resize-none !border-0 !border-none bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none !focus-visible:ring-0 !focus-visible:border-0 !ring-0 !shadow-none text-sm p-0"
            />
          )}
        </div>
      </div>
    )
  }
)

StickyNote.displayName = "StickyNote"

export { StickyNote }
