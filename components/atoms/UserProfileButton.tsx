'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from './Button'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

export default function UserProfileButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      setLoading(true)
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)

      // Set up auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null)
        }
      )

      return () => {
        authListener.subscription.unsubscribe()
      }
    }

    getUser()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <Button disabled>Loading...</Button>
  }

  if (!user) {
    return null // No need to show anything if not signed in
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm">
        {user.email}
      </div>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  )
}
