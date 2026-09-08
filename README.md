# 🎯 StickyNoter

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green)](https://supabase.com/)

Digital sticky notes on an infinite pan-and-zoom canvas. Create, colour, drag and resize
notes; everything is saved automatically to your Supabase account.

Live site: <https://stickynoter.org>

## Features

- **Infinite canvas** with pan, wheel zoom and two-finger pinch zoom
- **Drag and resize** notes, correctly at any zoom level, with mouse, touch or pen
- **Nine note colours**, chosen from an accessible radiogroup on each note
- **Automatic saving** with a debounced batch upsert, a hard maximum wait, retry with
  exponential backoff, and an honest status indicator that says when a save has failed
- **Survives tab close**: pending edits are flushed on `visibilitychange` and `pagehide`
- **Undo** for the most recent deletion
- **Keyboard operable**: arrow keys pan the canvas, `+` / `-` zoom, `0` resets the view,
  and each note exposes width and height sliders
- **Works signed out**, keeping notes in the browser only; they are adopted into your
  account the first time you sign in

Notes are per-user and are not shared or synchronised in real time between devices. A
second tab open on the same account will overwrite the first on its next save.

## Technology

- **Frontend**: Next.js 15.5 App Router, React 19, TypeScript (`strict`, plus
  `noUncheckedIndexedAccess`)
- **Styling**: Tailwind CSS v4, CSS-first configuration (no `tailwind.config.ts`)
- **Backend**: Supabase (Postgres, Auth). All data access is client-side with the anon
  key, so **row level security is the only authorization boundary** (see Security)
- **Icons**: Lucide React
- **State**: React Context
- **Deployment**: Vercel

## Getting started

### Prerequisites

- Node.js 18.17 or later
- A Supabase project

### Installation

```bash
git clone https://github.com/Ibrahim-ElKhansa/stickynoter.git
cd stickynoter
npm install
```

### Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional, and recommended for preview deployments so canonical URLs, the sitemap and
Open Graph tags reference the right host rather than production:

```env
NEXT_PUBLIC_SITE_URL=https://your-preview-host.example
```

Both Supabase variables are required. Without them the app still renders and runs as a
local-only scratchpad: notes live in the browser and nothing is persisted.

### Database

Apply `supabase/migrations/20260908000000_sticky_notes.sql`, either with the Supabase CLI:

```bash
supabase db push
```

or by pasting its contents into the Supabase SQL editor. The file is idempotent, so it is
safe to re-run, and it will add the missing columns to a table created from an older
version of this schema.

### Run it

```bash
npm run dev        # development server on http://localhost:3000
npm run build      # production build
npm run lint       # ESLint, zero warnings tolerated
npm run typecheck  # tsc --noEmit
```

## Security

**Read this before deploying.** Every read and write is issued from the browser using the
Supabase anon key, which is public by design. Nothing in this app authorizes anything
server-side. The `.eq('user_id', ...)` filters in the client are query predicates, not
access control: without row level security, anyone can read and write the entire
`sticky_notes` table.

The migration enables RLS and creates four policies (`select`, `insert`, `update`,
`delete`), all scoped to `user_id = (select auth.uid())` and granted only to the
`authenticated` role. All four are required, not just `select`: saving uses
`INSERT ... ON CONFLICT DO UPDATE`, and PostgREST evaluates the update policy on the
conflict branch.

Verify it took effect:

```sql
-- expect: t
select relrowsecurity from pg_class where relname = 'sticky_notes';

-- expect: 4 rows
select policyname, cmd from pg_policies where tablename = 'sticky_notes';
```

Then, from a signed-out browser console, a `select` against `sticky_notes` must return
zero rows rather than the table.

### Authentication configuration

In the Supabase dashboard, under Authentication → URL Configuration:

- **Site URL**: your production origin, for example `https://stickynoter.org`
- **Additional Redirect URLs**:
  - `https://stickynoter.org/auth/callback`
  - `http://localhost:3000/auth/callback` for local development
  - any preview origins you use

Under Authentication → Providers → Google, the authorized redirect URI must be your
**Supabase** callback (`https://<your-project-ref>.supabase.co/auth/v1/callback`), not
your website URL.

## Usage

| Action | How |
| --- | --- |
| Create a note | "Add Note" in the navbar. It appears near the centre of your current view |
| Move a note | Drag it anywhere except its title, body, buttons or resize handles |
| Resize a note | Drag the right, bottom or bottom-right handle, or focus a handle and use the arrow keys |
| Change colour | Click the settings icon on the note, then pick a swatch. Arrow keys navigate, Escape closes |
| Delete a note | The trash icon. An Undo chip appears for a few seconds afterwards |
| Pan the canvas | Drag the background, or focus the canvas and use the arrow keys |
| Zoom | Wheel, trackpad pinch, two-finger pinch on touch, or `+` / `-` / `0` when the canvas has focus |

## Project structure

```
stickynoter/
├── app/
│   ├── auth/callback/route.ts     # OAuth code exchange
│   ├── error.tsx                  # Route error boundary
│   ├── global-error.tsx           # Catches throws in the root layout itself
│   ├── globals.css                # Tailwind v4 entry, design tokens (@theme)
│   ├── layout.tsx                 # Providers, metadata, viewport, JSON-LD
│   ├── opengraph-image.tsx        # Generated OG card
│   ├── page.tsx                   # The canvas page
│   ├── robots.ts / sitemap.ts     # Generated, driven by lib/site.ts
│   └── NavbarWithStickyNotes.tsx
├── components/                    # atoms / molecules / organisms
├── hooks/
│   ├── useAutoSave.ts             # Debounce with max wait, re-arm and retry
│   └── usePointerGesture.ts       # Shared pointer gesture primitive
├── lib/
│   ├── auth/AuthContext.tsx
│   ├── constants/stickyNotes.ts   # Colours, sizes, z-index bands, clamps
│   ├── context/
│   │   ├── CanvasTransformContext.tsx  # Pan/zoom state, split API and value
│   │   └── StickyNoteContext.tsx       # Notes, dirty tracking, persistence
│   ├── site.ts                    # The one canonical origin
│   ├── supabase/                  # Browser, server and middleware clients
│   └── utils/stickyNoteMappers.ts
├── supabase/migrations/           # Schema and RLS policies
├── types/stickyNote.ts
└── middleware.ts                  # Session cookie refresh only
```

## Customization

- **Note colours, default and limit sizes, zoom range**: `lib/constants/stickyNotes.ts`.
  This is the single source; adding a colour there requires the matching entry in the
  `StickyNoteColor` union in `types/stickyNote.ts` and the `CHECK` constraint in the
  migration.
- **Design tokens** (`background`, `primary`, `ring`, `input`, `destructive` and so on):
  the `@theme` block in `app/globals.css`. Tailwind v4 is configured in CSS, so there is
  deliberately no `tailwind.config.ts`.

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Ibrahim-ElKhansa/stickynoter)

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and, for previews,
`NEXT_PUBLIC_SITE_URL`. Add each deployment origin to the Supabase redirect allowlist.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make sure `npm run lint`, `npm run typecheck` and `npm run build` all pass
4. Open a pull request

## License

This project is private and proprietary. All rights reserved.

## Support

- 🐛 Bug reports: [GitHub Issues](https://github.com/Ibrahim-ElKhansa/stickynoter/issues)
- 💡 Feature requests: [GitHub Discussions](https://github.com/Ibrahim-ElKhansa/stickynoter/discussions)
- 📧 Email: support@stickynoter.org

---

<div align="center">

**Made with ❤️ by [Ibrahim El Khansa](https://ibrahimelkhansa.com)**

</div>
