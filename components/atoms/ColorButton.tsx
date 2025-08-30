import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const colorButtonVariants = cva(
  "relative inline-flex items-center justify-center rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
  {
    variants: {
      color: {
        default: "bg-yellow-300 border-yellow-500 hover:border-yellow-600",
        yellow: "bg-yellow-300 border-yellow-500 hover:border-yellow-600",
        blue: "bg-blue-300 border-blue-500 hover:border-blue-600",
        green: "bg-green-300 border-green-500 hover:border-green-600",
        pink: "bg-pink-300 border-pink-500 hover:border-pink-600",
        purple: "bg-purple-300 border-purple-500 hover:border-purple-600",
        orange: "bg-orange-300 border-orange-500 hover:border-orange-600",
      },
      size: {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
      },
    },
    defaultVariants: {
      color: "default",
      size: "md",
    },
  }
)

export interface ColorButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof colorButtonVariants> {
  selected?: boolean
  onSelect?: () => void
}

const ColorButton = React.forwardRef<HTMLButtonElement, ColorButtonProps>(
  ({ className, color, size, selected = false, onSelect, ...props }, ref) => {
    return (
      <button
        className={cn(colorButtonVariants({ color, size, className }))}
        ref={ref}
        onClick={onSelect}
        type="button"
        {...props}
      >
        {selected && (
          <Check className="w-4 h-4 text-gray-800 drop-shadow-sm" strokeWidth={3} />
        )}
      </button>
    )
  }
)

ColorButton.displayName = "ColorButton"

export { ColorButton, colorButtonVariants }
