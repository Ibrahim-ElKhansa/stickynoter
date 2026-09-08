import { supabaseAnonKey, supabaseUrl } from '@/lib/utils'
import type { StickyNoteUpsertRow } from '@/types/stickyNote'

/** Browsers cap total keepalive request bodies at 64 KiB. Stay well under. */
const KEEPALIVE_BODY_LIMIT = 60_000

/**
 * Fire-and-forget upsert that survives page unload.
 *
 * navigator.sendBeacon cannot be used here: PostgREST needs an
 * Authorization: Bearer <jwt> header and will not read a user JWT from the
 * query string, so a beacon would arrive as the anon role and be rejected by
 * row level security. fetch(keepalive) can set headers and is not cancelled
 * when the document goes away.
 */
export function upsertNotesKeepalive(
  rows: readonly StickyNoteUpsertRow[],
  accessToken: string,
): void {
  if (!supabaseUrl || !supabaseAnonKey || rows.length === 0) return

  const url = `${supabaseUrl}/rest/v1/sticky_notes?on_conflict=id`
  const headers: Record<string, string> = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal',
  }

  const send = (batch: StickyNoteUpsertRow[]) => {
    if (batch.length === 0) return
    void fetch(url, {
      method: 'POST',
      keepalive: true,
      headers,
      body: JSON.stringify(batch),
    }).catch(() => {
      // The page is going away. There is nothing useful to do with a failure,
      // and the dirty set is deliberately left intact so the normal save path
      // retries if the page turns out to survive.
    })
  }

  // Chunk so no single keepalive body exceeds the browser cap.
  let batch: StickyNoteUpsertRow[] = []
  for (const row of rows) {
    batch.push(row)
    if (batch.length > 1 && JSON.stringify(batch).length > KEEPALIVE_BODY_LIMIT) {
      batch.pop()
      send(batch)
      batch = [row]
    }
  }
  send(batch)
}
