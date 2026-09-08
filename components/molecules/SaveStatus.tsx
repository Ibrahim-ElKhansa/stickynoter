'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { useStickyNotes } from "@/lib/context/StickyNoteContext"
import { useAuth } from "@/lib/auth/AuthContext"

type SaveStatusProps = React.HTMLAttributes<HTMLDivElement>

const SaveStatus = React.forwardRef<HTMLDivElement, SaveStatusProps>(
  ({ className, ...props }, ref) => {
    const { hasPendingChanges, isSaving, error } = useStickyNotes()
    const { user } = useAuth()

    if (!user) return null

    // Order matters: the error branch comes first. Without it, "All changes
    // saved" kept showing in exactly the failure cases that matter.
    const status = error
      ? {
          text: "Save failed, retrying",
          className: "bg-red-950/60 text-red-200 border-red-700/50",
        }
      : isSaving
        ? {
            text: "Saving...",
            className: "bg-sky-950/60 text-sky-200 border-sky-700/50",
          }
        : hasPendingChanges
          ? {
              text: "Changes pending",
              className: "bg-amber-950/60 text-amber-200 border-amber-700/50",
            }
          : {
              text: "All changes saved",
              className: "bg-emerald-950/60 text-emerald-200 border-emerald-700/50",
            }

    return (
      <div
        ref={ref}
        // Announced politely, so a screen reader hears save-state changes. The
        // previous version had no live region and used a bare emoji, which was
        // read out as "hourglass not done Saving".
        role="status"
        aria-live="polite"
        title={error ?? undefined}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-200",
          status.className,
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full",
            error
              ? "bg-red-400"
              : isSaving
                ? "animate-pulse bg-sky-400"
                : hasPendingChanges
                  ? "bg-amber-400"
                  : "bg-emerald-400",
          )}
        />
        <span>{status.text}</span>
      </div>
    )
  },
)

SaveStatus.displayName = "SaveStatus"

export { SaveStatus }
