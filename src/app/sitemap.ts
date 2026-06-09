import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://freshmart.co.nz';
  
  // Core application pages
  const staticPages = [
    '',
    '/auth/login',
    '/auth/signup',
    '/checkout',
    '/order-success',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.6,
  }));

  try {
    // Dynamic product pages
    const products = getProducts();
    const productPages = products.map(prod => ({
      url: `${baseUrl}/product/${prod.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...productPages];
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return staticPages;
  }
}
