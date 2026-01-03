import { Module, DynamicModule, Type } from '@nestjs/common';
import { RobotsController } from './robots.controller';
import { SitemapController } from './sitemap.controller';
import {
  BaseSeoService,
  DefaultSeoService,
  SEO_MODULE_OPTIONS,
} from './seo.service';
import type { SeoModuleOptions } from './seo.types';

@Module({})
export class SeoModule {
  /**
   * Register the SEO module with default implementation
   */
  static forRoot(options?: SeoModuleOptions): DynamicModule {
    return {
      module: SeoModule,
      controllers: [RobotsController, SitemapController],
      providers: [
        {
          provide: SEO_MODULE_OPTIONS,
          useValue: options || {},
        },
        {
          provide: BaseSeoService,
          useClass: DefaultSeoService,
        },
      ],
      exports: [BaseSeoService],
    };
  }

  /**
   * Register the SEO module with a custom service implementation
   * @param customService Your custom service that extends BaseSeoService
   * @param options Optional configuration options
   */
  static forRootWithService(
    customService: Type<BaseSeoService>,
    options?: SeoModuleOptions,
  ): DynamicModule {
    return {
      module: SeoModule,
      controllers: [RobotsController, SitemapController],
      providers: [
        {
          provide: SEO_MODULE_OPTIONS,
          useValue: options || {},
        },
        {
          provide: BaseSeoService,
          useClass: customService,
        },
      ],
      exports: [BaseSeoService],
    };
  }
}
