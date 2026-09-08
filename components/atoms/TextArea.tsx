'use client'

import * as React from "react"

import { cn } from "@/lib/utils"

const base =
  "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

/**
 * Chrome-free variant, for a textarea that is the surface it sits on (the body
 * of a sticky note). This exists so callers stop trying to cancel the base
 * styles with a long override string. The previous call site used Tailwind v3
 * leading-bang syntax (!border-0) plus the outright invalid
 * !focus-visible:ring-0, none of which compiled on Tailwind v4, so the border,
 * shadow and ring all stayed.
 */
const seamlessBase =
  "placeholder:text-stone-600 flex field-sizing-content w-full border-0 bg-transparent p-0 text-base shadow-none outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  seamless?: boolean
}

function Textarea({ className, seamless = false, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(seamless ? seamlessBase : base, className)}
      {...props}
    />
  )
}

export { Textarea }
