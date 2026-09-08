'use client'

import * as React from "react"

import { cn } from "@/lib/utils"

const base =
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/40 aria-invalid:border-destructive"

/** See the note on Textarea's seamless variant. */
const seamlessBase =
  "placeholder:text-stone-600 flex h-auto w-full min-w-0 border-0 bg-transparent px-0 py-1 text-base shadow-none outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

interface InputProps extends React.ComponentProps<"input"> {
  seamless?: boolean
}

function Input({ className, type, seamless = false, ...props }: InputProps) {
  return (
    <input
      type={type ?? "text"}
      data-slot="input"
      className={cn(seamless ? seamlessBase : base, className)}
      {...props}
    />
  )
}

export { Input }
