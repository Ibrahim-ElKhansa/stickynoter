import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAutoSaveOptions {
  /** Persists whatever is currently dirty. Allowed (and expected) to reject. */
  onSave: () => Promise<void>
  /** Quiet period after the last change before saving. */
  delay?: number
  /** Hard ceiling: never wait longer than this after the first unsaved change. */
  maxWait?: number
  /** Base delay before retrying a rejected save. Doubles per consecutive failure. */
  retryDelay?: number
  enabled?: boolean
}

interface AutoSaveState {
  hasPendingChanges: boolean
  isSaving: boolean
  saveError: Error | null
}

const MAX_BACKOFF_MS = 60_000

/**
 * Debounced autosave with a maximum wait, self re-arming, and retry on failure.
 *
 * The three properties that matter, each of which was a bug before:
 *
 * 1. maxWait caps the debounce. A fully resettable timer combined with the
 *    500ms text debounce upstream meant a user typing at a normal cadence
 *    (pauses shorter than the delay) reset the timer every time and never
 *    saved at all.
 * 2. The finally block re-arms whenever work is still pending. Previously a
 *    save that outlasted the delay caused the next timer to hit the in-flight
 *    guard, return, and leave the change stranded as pending forever.
 * 3. onSave may reject, and a rejection re-marks the work pending and retries
 *    with backoff, instead of the failure being swallowed while the note was
 *    marked clean.
 */
export function useAutoSave({
  onSave,
  delay = 1_500,
  maxWait = 5_000,
  retryDelay = 4_000,
  enabled = true,
}: UseAutoSaveOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef(false)
  const firstDirtyAtRef = useRef<number | null>(null)
  const inFlightRef = useRef<Promise<void> | null>(null)
  const failureCountRef = useRef(0)
  const mountedRef = useRef(true)

  // Held in refs so scheduleSave/flush keep stable identities even though
  // onSave (which closes over the signed-in user) does not. That is what stops
  // an identity cascade through every note-mutating callback downstream.
  const onSaveRef = useRef(onSave)
  const enabledRef = useRef(enabled)

  const [state, setState] = useState<AutoSaveState>({
    hasPendingChanges: false,
    isSaving: false,
    saveError: null,
  })

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const publish = useCallback((patch: Partial<AutoSaveState>) => {
    if (!mountedRef.current) return
    setState((prev) => {
      const next = { ...prev, ...patch }
      if (
        next.hasPendingChanges === prev.hasPendingChanges &&
        next.isSaving === prev.isSaving &&
        next.saveError === prev.saveError
      ) {
        return prev
      }
      return next
    })
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // arm() and runSave() are mutually recursive; break the cycle with a ref.
  const armRef = useRef<(ms: number) => void>(() => {})

  const runSave = useCallback(async (): Promise<void> => {
    clearTimer()

    // Already saving. Do not drop the change on the floor: the finally block
    // below re-arms once the in-flight save settles.
    if (inFlightRef.current !== null) return
    if (!pendingRef.current || !enabledRef.current) return

    // Claim the current dirty epoch. onSave is contractually required to clear
    // only what it actually persisted, so an edit landing mid-flight re-sets
    // pendingRef via scheduleSave and is picked up by the re-arm.
    pendingRef.current = false
    firstDirtyAtRef.current = null
    publish({ hasPendingChanges: false, isSaving: true })

    const attempt = onSaveRef.current()
    inFlightRef.current = attempt

    try {
      await attempt
      failureCountRef.current = 0
      publish({ saveError: null })
    } catch (err) {
      failureCountRef.current += 1
      pendingRef.current = true
      firstDirtyAtRef.current = firstDirtyAtRef.current ?? Date.now()
      publish({ saveError: err instanceof Error ? err : new Error(String(err)) })
    } finally {
      inFlightRef.current = null
      publish({ isSaving: false, hasPendingChanges: pendingRef.current })

      // Nothing is ever left pending-but-unscheduled.
      if (pendingRef.current && enabledRef.current) {
        const wait =
          failureCountRef.current > 0
            ? Math.min(retryDelay * 2 ** (failureCountRef.current - 1), MAX_BACKOFF_MS)
            : delay
        armRef.current(wait)
      }
    }
  }, [clearTimer, delay, retryDelay, publish])

  const arm = useCallback(
    (ms: number) => {
      clearTimer()
      timerRef.current = setTimeout(() => {
        void runSave()
      }, ms)
    },
    [clearTimer, runSave],
  )

  useEffect(() => {
    armRef.current = arm
  }, [arm])

  const scheduleSave = useCallback(() => {
    if (!enabledRef.current) return

    pendingRef.current = true
    firstDirtyAtRef.current = firstDirtyAtRef.current ?? Date.now()
    publish({ hasPendingChanges: true })

    // Trailing-edge debounce, capped by maxWait so a steady stream of edits
    // cannot defer the save indefinitely.
    const elapsed = Date.now() - firstDirtyAtRef.current
    arm(Math.max(0, Math.min(delay, maxWait - elapsed)))
  }, [arm, delay, maxWait, publish])

  /** Save now. Resolves once nothing is left in flight. Never rejects. */
  const flush = useCallback(async (): Promise<void> => {
    clearTimer()
    if (inFlightRef.current !== null) {
      await inFlightRef.current.catch(() => {})
    }
    if (pendingRef.current) await runSave()
  }, [clearTimer, runSave])

  /** Synchronous read, for unload handlers where React state is too stale. */
  const hasPendingChangesNow = useCallback(() => pendingRef.current, [])

  useEffect(() => () => clearTimer(), [clearTimer])

  return {
    scheduleSave,
    flush,
    hasPendingChangesNow,
    hasPendingChanges: state.hasPendingChanges,
    isSaving: state.isSaving,
    saveError: state.saveError,
  }
}
