import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Supabase configuration, read once.
 *
 * Next inlines `process.env.NEXT_PUBLIC_*` at build time, so these are safe as
 * module-level constants on both the client and the server.
 *
 * Read these rather than reaching for `process.env` at each call site. The
 * previous `hasEnvVars` helper checked a variable name
 * (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`) that existed nowhere else in
 * the project, so it was permanently `undefined` and silently disabled the
 * entire middleware auth layer.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
