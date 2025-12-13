import { Controller, Get, Header } from '@nestjs/common';
import { BaseSeoService } from './seo.service';

@Controller('robots.txt')
export class RobotsController {
  constructor(private readonly seoService: BaseSeoService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  @Header('Cache-Control', 'public, max-age=86400') // Cache for 24 hours
  getRobots(): string {
    const config = this.seoService.getRobotsConfig();
    return this.seoService.formatRobotsTxt(config);
  }
}
