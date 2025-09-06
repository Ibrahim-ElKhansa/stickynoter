import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://stickynoter.org'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/auth/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
