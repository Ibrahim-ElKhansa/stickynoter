import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "../utils";

/**
 * Rotates the Supabase session cookies on every request.
 *
 * This deliberately does NOT gate the response on whether a user is signed in.
 * Every route in this app is public: the homepage renders for anonymous
 * visitors and is the app's only page, sign-in is an OAuth button in the
 * navbar, and there is no login route to redirect to. An auth gate here would
 * 302 anonymous requests for /robots.txt, /sitemap.xml and /manifest.json.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  try {
    // With Fluid compute, don't put this client in a global variable. Always
    // create a new one on each request.
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // Do not run code between createServerClient and getClaims(). Touching the
    // session is what lets @supabase/ssr rotate an expiring refresh token and
    // write the new cookies onto supabaseResponse. Remove this call and users
    // get randomly logged out.
    const { error } = await supabase.auth.getClaims();
    if (error) {
      console.warn("[middleware] session refresh failed:", error.message);
    }
  } catch (err) {
    // Never turn an auth hiccup into a 500 on a public, indexed page.
    console.error("[middleware] unexpected error refreshing session:", err);
  }

  // IMPORTANT: return supabaseResponse as it is. It carries the rotated session
  // cookies. Building a fresh NextResponse here would discard them, and if the
  // refresh token was already consumed server-side that logs the user out.
  return supabaseResponse;
}
