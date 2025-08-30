import * as React from "react"
import { cn } from "@/lib/utils"
import { ColorButton } from "@/components/atoms/ColorButton"
import { StickyNoteColor } from "@/types/stickyNote"

const colorOptions: { value: StickyNoteColor; label: string }[] = [
  { value: "yellow", label: "Yellow" },
  { value: "orange", label: "Orange" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
]

interface ColorPickerProps {
  selectedColor: StickyNoteColor
  onColorSelect: (color: StickyNoteColor) => void
  className?: string
}

const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ selectedColor, onColorSelect, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center space-y-4 p-6", className)}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose Color</h3>
        
        <div className="grid grid-cols-3 gap-3">
          {colorOptions.map((colorOption) => (
            <ColorButton
              key={colorOption.value}
              color={colorOption.value}
              size="lg"
              selected={selectedColor === colorOption.value}
              onSelect={() => onColorSelect(colorOption.value)}
              aria-label={`Select ${colorOption.label} color`}
            />
          ))}
        </div>
        
        <p className="text-sm text-gray-600 text-center mt-4">
          Click a color to change your note&apos;s appearance
        </p>
      </div>
    )
  }
)

ColorPicker.displayName = "ColorPicker"

export { ColorPicker }
