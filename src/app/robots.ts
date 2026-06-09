import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://freshmart.co.nz';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',      // Protect administrative portal analytics from scraping
        '/admin/*',
        '/api/',       // Disallow generic internal API endpoints if any
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
