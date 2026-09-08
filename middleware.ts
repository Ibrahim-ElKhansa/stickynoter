import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and generated metadata.
     * The txt/xml/json/webmanifest/ico exclusions keep crawler hits on
     * /robots.txt, /sitemap.xml and /manifest.json from paying for a Supabase
     * round trip.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|webmanifest)$).*)',
  ],
}
