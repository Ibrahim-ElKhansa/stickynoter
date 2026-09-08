'use client'

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  STICKY_NOTE_COLORS,
  STICKY_NOTE_COLOR_LABELS,
  STICKY_NOTE_VARIANTS,
} from "@/lib/constants/stickyNotes"
import type { StickyNoteColor } from "@/types/stickyNote"

interface ColorPickerProps {
  selectedColor: StickyNoteColor
  onColorSelect: (color: StickyNoteColor) => void
  /** Called on Escape. Wire this to restore focus to whatever opened the picker. */
  onClose?: () => void
  className?: string
  id?: string
}

/**
 * The single colour picker in the app.
 *
 * It is a real radiogroup: roving tabindex, arrow-key navigation, aria-checked
 * on each option and Escape to dismiss. The previous inline version conveyed
 * selection with a visual ring only, so assistive technology could not tell
 * which colour was active.
 */
const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ selectedColor, onColorSelect, onClose, className, id }, ref) => {
    const selectedIndex = Math.max(0, STICKY_NOTE_COLORS.indexOf(selectedColor))
    const [focusIndex, setFocusIndex] = React.useState(selectedIndex)
    const buttonsRef = React.useRef<(HTMLButtonElement | null)[]>([])
    const headingId = React.useId()

    // Move focus into the group so Escape and the arrow keys work immediately.
    React.useEffect(() => {
      buttonsRef.current[selectedIndex]?.focus()
      // Intentionally only on mount: re-focusing on every selection change
      // would fight the caller, which closes the picker after a choice.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const focusAt = React.useCallback((index: number) => {
      const wrapped = (index + STICKY_NOTE_COLORS.length) % STICKY_NOTE_COLORS.length
      setFocusIndex(wrapped)
      buttonsRef.current[wrapped]?.focus()
    }, [])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case "Escape":
          onClose?.()
          break
        case "ArrowRight":
        case "ArrowDown":
          focusAt(focusIndex + 1)
          break
        case "ArrowLeft":
        case "ArrowUp":
          focusAt(focusIndex - 1)
          break
        case "Home":
          focusAt(0)
          break
        case "End":
          focusAt(STICKY_NOTE_COLORS.length - 1)
          break
        default:
          return
      }
      event.preventDefault()
      event.stopPropagation()
    }

    return (
      <div
        ref={ref}
        id={id}
        data-no-drag
        className={cn(
          "flex flex-col items-center justify-center gap-3 bg-white/95 p-4 backdrop-blur-sm",
          className,
        )}
        onKeyDown={handleKeyDown}
      >
        <h3 id={headingId} className="text-sm font-medium text-stone-800">
          Choose colour
        </h3>

        <div
          role="radiogroup"
          aria-labelledby={headingId}
          className="grid grid-cols-3 gap-2"
        >
          {STICKY_NOTE_COLORS.map((color, index) => {
            const isSelected = color === selectedColor
            return (
              <button
                key={color}
                ref={(element) => {
                  buttonsRef.current[index] = element
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={STICKY_NOTE_COLOR_LABELS[color]}
                tabIndex={index === focusIndex ? 0 : -1}
                onClick={() => onColorSelect(color)}
                onFocus={() => setFocusIndex(index)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 transition-transform",
                  "cursor-pointer hover:scale-110",
                  "outline-none focus-visible:ring-2 focus-visible:ring-stone-700 focus-visible:ring-offset-2",
                  STICKY_NOTE_VARIANTS[color],
                  isSelected && "ring-2 ring-stone-700 ring-offset-1",
                )}
              >
                {isSelected ? (
                  <Check className="size-4 text-stone-800" aria-hidden="true" />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    )
  },
)

ColorPicker.displayName = "ColorPicker"

export { ColorPicker }
