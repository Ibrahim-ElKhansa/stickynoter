'use client'

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-ring aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-red-600 text-white shadow-xs hover:bg-red-700",
        destructive:
          "bg-red-700 text-white shadow-xs hover:bg-red-800",
        outline:
          "border border-red-700/50 bg-red-950/80 shadow-xs hover:bg-red-900/30 hover:text-red-200 text-red-300 hover:border-red-600",
        secondary:
          "bg-red-900/50 text-red-100 shadow-xs hover:bg-red-800/60",
        ghost:
          "hover:bg-red-900/20 hover:text-red-200 text-red-300",
        link: "text-red-400 underline-offset-4 hover:underline hover:text-red-300",
        // Subdued variants for the controls that sit on a coloured note, where
        // the surrounding surface is light rather than the dark app chrome.
        "note-ghost":
          "text-stone-700 hover:bg-stone-900/10 hover:text-stone-900",
        "note-danger-ghost":
          "text-stone-700 hover:bg-red-600/15 hover:text-red-800",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-7 has-[>svg]:px-5",
        icon: "size-9",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * A plain button.
 *
 * Note that the icon comes from the caller. A previous version derived it from
 * the *style* variant (variant "close" rendered an X) and then silently
 * discarded children for those variants, which also broke asChild by handing
 * Radix Slot a two-child fragment.
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      // Default to "button": an unset type inside a form submits it.
      type={asChild ? type : (type ?? "button")}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
