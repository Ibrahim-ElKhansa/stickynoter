import * as React from "react"
import { cn } from "@/lib/utils"
import { useStickyNotes } from "@/lib/context/StickyNoteContext"
import { useAuth } from "@/lib/auth/AuthContext"

type SaveStatusProps = React.HTMLAttributes<HTMLDivElement>

const SaveStatus = React.forwardRef<HTMLDivElement, SaveStatusProps>(
  ({ className, ...props }, ref) => {
    const { hasPendingChanges, isSaving } = useStickyNotes()
    const { user } = useAuth()

    // Don't show status if user is not authenticated
    if (!user) return null

    const getStatusInfo = () => {
      if (isSaving) {
        return {
          text: "Saving...",
          className: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "⏳"
        }
      }
      
      if (hasPendingChanges) {
        return {
          text: "Changes pending",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "✏️"
        }
      }
      
      return {
        text: "All changes saved",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: "✅"
      }
    }

    const status = getStatusInfo()

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-200",
          status.className,
          className
        )}
        {...props}
      >
        <span className="text-xs">{status.icon}</span>
        <span>{status.text}</span>
      </div>
    )
  }
)

SaveStatus.displayName = "SaveStatus"

export { SaveStatus }
