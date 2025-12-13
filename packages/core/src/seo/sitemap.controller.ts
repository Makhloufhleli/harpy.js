import { Controller, Get, Header } from '@nestjs/common';
import { BaseSeoService } from './seo.service';

@Controller('sitemap.xml')
export class SitemapController {
  constructor(private readonly seoService: BaseSeoService) {}

  @Get()
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600, s-maxage=3600') // Cache for 1 hour
  async getSitemap(): Promise<string> {
    const urls = await this.seoService.getSitemapUrls();
    return this.seoService.formatSitemapXml(urls);
  }
}
