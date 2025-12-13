import { Injectable } from '@nestjs/common';
import { BaseSeoService, SitemapUrl, RobotsConfig } from '@harpy-js/core';

/**
 * Custom SEO Service
 * Extend BaseSeoService to provide your own sitemap URLs and robots.txt configuration
 */
@Injectable()
export class SeoService extends BaseSeoService {
  /**
   * Generate sitemap URLs for your application
   * Override this method to:
   * - Fetch pages from your database
   * - Include dynamic routes (blog posts, products, etc.)
   * - Add multi-language support
   */
  async getSitemapUrls(): Promise<SitemapUrl[]> {
    const now = new Date();

    // Example: Static pages
    const staticPages: SitemapUrl[] = [
      {
        url: this.baseUrl,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${this.baseUrl}/about`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ];

    // TODO: Add dynamic pages from your database
    // Example:
    // const posts = await this.postsService.findAll();
    // const dynamicPages = posts.map(post => ({
    //   url: `${this.baseUrl}/blog/${post.slug}`,
    //   lastModified: post.updatedAt,
    //   changeFrequency: 'weekly' as const,
    //   priority: 0.7,
    // }));

    return staticPages;
  }

  /**
   * Configure robots.txt rules
   * Override this method to customize which paths crawlers can access
   */
  getRobotsConfig(): RobotsConfig {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      sitemap: `${this.baseUrl}/sitemap.xml`,
      host: this.baseUrl,
    };
  }
}
