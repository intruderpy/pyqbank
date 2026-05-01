import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/admin-login'],
    },
    sitemap: 'https://pyqbank.vercel.app/sitemap.xml',
  }
}
