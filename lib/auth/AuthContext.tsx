'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/utils'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  authLoading: boolean
  authError: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [authError, setAuthError] = useState<string | null>(null)

  // Null when Supabase is not configured, so the app still renders instead of
  // throwing during the first commit.
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), [])

  useEffect(() => {
    if (!supabase) return
    let cancelled = false

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (cancelled) return
        if (error) {
          setAuthError(error.message)
          setSession(null)
          return
        }
        setSession(data.session)
      } catch (err) {
        if (cancelled) return
        setAuthError(messageOf(err, 'Could not restore your session'))
        setSession(null)
      } finally {
        // Unconditional. A rejection here used to latch authLoading at true
        // forever, which left the app on a permanent spinner with a disabled
        // sign-in button and no error anywhere.
        if (!cancelled) setAuthLoading(false)
      }
    }

    void restoreSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
      setAuthError(null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase])

  // Surface why a sign-in bounced. See app/auth/callback/route.ts.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const callbackError = params.get('auth_error')
    if (!callbackError) return

    setAuthError(`Sign-in failed (${callbackError}). Please try again.`)
    params.delete('auth_error')
    const query = params.toString()
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}`,
    )
  }, [])

  const signIn = useCallback(async () => {
    if (!supabase) {
      setAuthError('Sign-in is unavailable: Supabase is not configured.')
      return
    }
    setAuthError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) setAuthError(error.message)
    } catch (err) {
      setAuthError(messageOf(err, 'Could not start sign-in'))
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    if (!supabase) return
    setAuthError(null)
    try {
      // 'local' signs out this browser only. The default 'global' revokes the
      // session on every device the user is signed in on.
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) setAuthError(error.message)
    } catch (err) {
      setAuthError(messageOf(err, 'Could not sign out'))
    }
  }, [supabase])

  const clearAuthError = useCallback(() => setAuthError(null), [])

  const user = useMemo(() => session?.user ?? null, [session])

  const value = useMemo<AuthContextType>(
    () => ({ user, session, authLoading, authError, signIn, signOut, clearAuthError }),
    [user, session, authLoading, authError, signIn, signOut, clearAuthError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
