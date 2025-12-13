import { Module } from '@nestjs/common';
import { I18nModule } from '@harpy-js/i18n';
import { SeoModule } from '@harpy-js/core';
import { HomeModule } from './features/home/home.module';
import { i18nConfig } from './i18n/i18n.config';
import { SeoService } from './seo.service';

@Module({
  imports: [
    // Configure I18n module (from separate package)
    I18nModule.forRoot(i18nConfig),
    // Configure SEO module with custom service
    // Edit seo.service.ts to customize sitemap URLs and robots.txt
    SeoModule.forRootWithService(SeoService, {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    }),
    HomeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
