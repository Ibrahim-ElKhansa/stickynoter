import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Settings, X } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-red-500/50",
        destructive:
          "bg-red-700 text-white shadow-xs hover:bg-red-800 focus-visible:ring-red-500/50",
        outline:
          "border border-red-700/50 bg-red-950/80 shadow-xs hover:bg-red-900/30 hover:text-red-200 text-red-300 hover:border-red-600",
        secondary:
          "bg-red-900/50 text-red-100 shadow-xs hover:bg-red-800/60",
        ghost:
          "hover:bg-red-900/20 hover:text-red-200 text-red-300",
        link: "text-red-400 underline-offset-4 hover:underline hover:text-red-300",
        close:
          "bg-red-950/60 border border-red-700/30 hover:bg-red-900/30 hover:text-red-200 text-red-400 hover:border-red-600/50",
        "close-ghost":
          "hover:bg-red-900/20 hover:text-red-200 text-red-400",
        settings:
          "bg-red-950/60 border border-red-700/30 hover:bg-red-900/30 hover:text-red-200 text-red-400 hover:border-red-600/50",
        "settings-ghost":
          "hover:bg-red-900/20 hover:text-red-200 text-red-400",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-6",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  // Render icon based on variant
  const renderIcon = () => {
    if (variant === "settings" || variant === "settings-ghost") {
      return <Settings size={12} />
    }
    if (variant === "close" || variant === "close-ghost") {
      return <X size={12} />
    }
    return null
  }

  // Render screen reader text based on variant
  const renderScreenReader = () => {
    if (variant === "settings" || variant === "settings-ghost") {
      return <span className="sr-only">Settings</span>
    }
    if (variant === "close" || variant === "close-ghost") {
      return <span className="sr-only">Close</span>
    }
    return null
  }

  const icon = renderIcon()
  const screenReaderText = renderScreenReader()

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {icon && (
        <>
          {icon}
          {screenReaderText}
        </>
      )}
      {!icon && children}
    </Comp>
  )
}

export { Button, buttonVariants }
