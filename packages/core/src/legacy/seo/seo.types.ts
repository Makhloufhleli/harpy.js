export interface SitemapUrl {
  url: string;
  lastModified?: Date | string;
  changeFrequency?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
}

export interface RobotsConfig {
  rules:
    | {
        userAgent: string | string[];
        allow?: string | string[];
        disallow?: string | string[];
        crawlDelay?: number;
      }
    | Array<{
        userAgent: string | string[];
        allow?: string | string[];
        disallow?: string | string[];
        crawlDelay?: number;
      }>;
  sitemap?: string | string[];
  host?: string;
}

export interface SeoModuleOptions {
  baseUrl: string;
  robotsConfig?: Partial<RobotsConfig>;
  sitemapGenerator?: () => Promise<SitemapUrl[]>;
}
