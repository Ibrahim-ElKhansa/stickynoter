import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/lib/utils'

/**
 * Public health check, called by the homelab four times a day.
 *
 * It is also the database keep-alive. Supabase's free plan pauses a project
 * after a week without activity, and signed-out visitors never reach the
 * database, so normal traffic does not count. The read below runs as a
 * signed-out caller: row level security returns no rows, but the query still
 * reaches Postgres.
 *
 * Never returns note content, user details or env values.
 */
export const dynamic = 'force-dynamic'

type Status = 'ok' | 'warn' | 'down'

interface Check {
  name: string
  status: Status
  detail: string
  ms: number
}

const DB_TIMEOUT_MS = 10_000

async function checkDatabase(): Promise<Check> {
  const started = Date.now()
  const result = (status: Status, detail: string): Check => ({
    name: 'database',
    status,
    detail,
    ms: Date.now() - started,
  })

  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    return result('down', 'Supabase is not configured')
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error } = await supabase
      .from('sticky_notes')
      .select('id')
      .limit(1)
      .abortSignal(AbortSignal.timeout(DB_TIMEOUT_MS))

    if (error) return result('down', `database query failed (${error.code || 'no code'})`)
    return result('ok', 'database answered')
  } catch {
    return result('down', 'database unreachable')
  }
}

export async function GET() {
  const checks = [await checkDatabase()]
  const status: Status = checks.some((c) => c.status === 'down')
    ? 'down'
    : checks.some((c) => c.status === 'warn')
      ? 'warn'
      : 'ok'

  return NextResponse.json(
    { status, checks, checkedAt: new Date().toISOString() },
    {
      status: status === 'down' ? 503 : 200,
      // A short CDN cache so repeated calls from strangers don't each hit the
      // database. The homelab's retry comes two minutes later, always fresh.
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    },
  )
}
