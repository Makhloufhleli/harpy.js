import { Injectable, Inject, Optional } from '@nestjs/common';
import type { SitemapUrl, RobotsConfig, SeoModuleOptions } from './seo.types';

export const SEO_MODULE_OPTIONS = 'SEO_MODULE_OPTIONS';

@Injectable()
export abstract class BaseSeoService {
  protected readonly baseUrl: string;

  constructor(
    @Optional()
    @Inject(SEO_MODULE_OPTIONS)
    protected readonly options?: SeoModuleOptions,
  ) {
    this.baseUrl = options?.baseUrl || 'http://localhost:3000';
  }

  /**
   * Override this method to provide custom sitemap URLs
   * This can fetch from database, CMS, or any other source
   */
  abstract getSitemapUrls(): Promise<SitemapUrl[]>;

  /**
   * Override this method to provide custom robots.txt configuration
   */
  abstract getRobotsConfig(): RobotsConfig;

  /**
   * Format sitemap URLs to XML string
   */
  formatSitemapXml(urls: SitemapUrl[]): string {
    const urlEntries = urls
      .map((entry) => {
        const lastmod = entry.lastModified
          ? new Date(entry.lastModified).toISOString()
          : new Date().toISOString();

        return `  <url>
    <loc>${this.escapeXml(entry.url)}</loc>
    <lastmod>${lastmod}</lastmod>
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
    ${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ''}
  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  }

  /**
   * Format robots.txt configuration to string
   */
  formatRobotsTxt(config: RobotsConfig): string {
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];

    const rulesText = rules
      .map((rule) => {
        const userAgents = Array.isArray(rule.userAgent)
          ? rule.userAgent
          : [rule.userAgent];
        const allows = rule.allow
          ? Array.isArray(rule.allow)
            ? rule.allow
            : [rule.allow]
          : [];
        const disallows = rule.disallow
          ? Array.isArray(rule.disallow)
            ? rule.disallow
            : [rule.disallow]
          : [];

        let text = userAgents.map((ua) => `User-agent: ${ua}`).join('\n');

        if (allows.length > 0) {
          text += '\n' + allows.map((path) => `Allow: ${path}`).join('\n');
        }

        if (disallows.length > 0) {
          text +=
            '\n' + disallows.map((path) => `Disallow: ${path}`).join('\n');
        }

        if (rule.crawlDelay) {
          text += `\nCrawl-delay: ${rule.crawlDelay}`;
        }

        return text;
      })
      .join('\n\n');

    let result = rulesText;

    if (config.sitemap) {
      const sitemaps = Array.isArray(config.sitemap)
        ? config.sitemap
        : [config.sitemap];
      result += '\n\n' + sitemaps.map((s) => `Sitemap: ${s}`).join('\n');
    }

    if (config.host) {
      result += `\n\nHost: ${config.host}`;
    }

    return result;
  }

  protected escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

/**
 * Default SEO service implementation
 * Users can extend BaseSeoService to provide custom implementations
 */
@Injectable()
export class DefaultSeoService extends BaseSeoService {
  async getSitemapUrls(): Promise<SitemapUrl[]> {
    const now = new Date();

    // Default homepage only
    return [
      {
        url: this.baseUrl,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }

  getRobotsConfig(): RobotsConfig {
    const defaultConfig: RobotsConfig = {
      rules: {
        userAgent: '*',
        allow: '/',
      },
      sitemap: `${this.baseUrl}/sitemap.xml`,
      host: this.baseUrl,
    };

    // Merge with options if provided
    if (this.options?.robotsConfig) {
      return {
        ...defaultConfig,
        ...this.options.robotsConfig,
      };
    }

    return defaultConfig;
  }
}
