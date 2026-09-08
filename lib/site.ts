/**
 * The one canonical origin for this deployment.
 *
 * Set NEXT_PUBLIC_SITE_URL on preview deployments so they self-reference
 * instead of pointing every canonical, sitemap entry and OG URL at production.
 */
const FALLBACK_SITE_URL = 'https://stickynoter.org'

function normalize(url: string): string {
  return url.replace(/[/]+$/, '')
}

export const SITE_URL = normalize(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL,
)

export const SITE_NAME = 'StickyNoter'
