import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Only honour x-forwarded-host on Vercel, where the platform sets it and
 * strips any client-supplied value. Trusting it unconditionally would turn
 * this route into an open redirect.
 */
function resolveOrigin(request: NextRequest, requestUrl: URL): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (!forwardedHost || !process.env.VERCEL) return requestUrl.origin
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${forwardedHost}`
}

/** Bounce home with a reason the client can surface. See AuthContext. */
function failure(origin: string, reason: string): NextResponse {
  const response = NextResponse.redirect(
    `${origin}/?auth_error=${encodeURIComponent(reason)}`,
  )
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const origin = resolveOrigin(request, requestUrl)

  // Google or Supabase can hand us an error instead of a code, e.g. when the
  // user declines the consent screen.
  const providerError = requestUrl.searchParams.get('error')
  if (providerError) {
    console.warn(
      '[auth/callback] provider error:',
      providerError,
      requestUrl.searchParams.get('error_description'),
    )
    return failure(origin, providerError)
  }

  const code = requestUrl.searchParams.get('code')
  if (!code) {
    console.warn('[auth/callback] reached with no code and no error param')
    return failure(origin, 'missing_code')
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // An expired or replayed code, or a missing code_verifier cookie. Left
      // unchecked this redirects home looking exactly like a success.
      console.error('[auth/callback] code exchange failed:', error.message)
      return failure(origin, 'exchange_failed')
    }
  } catch (err) {
    console.error('[auth/callback] unexpected error:', err)
    return failure(origin, 'unexpected')
  }

  const response = NextResponse.redirect(`${origin}/`)
  response.headers.set('Cache-Control', 'no-store')
  return response
}
