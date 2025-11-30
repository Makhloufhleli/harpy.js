import { Module, Global, DynamicModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { I18nService } from './i18n.service';
import { I18nInterceptor } from './i18n.interceptor';
import { I18nHelper } from './i18n.helper';
import { I18nSwitcherController } from './i18n-switcher.controller';
import { I18nModuleOptions, I18N_MODULE_OPTIONS } from './i18n-module.options';

@Global()
@Module({})
export class I18nModule {
  /**
   * Register I18n module with configuration
   * @param options Configuration options for i18n
   */
  static forRoot(options: I18nModuleOptions): DynamicModule {
    // Set defaults
    const moduleOptions: Required<I18nModuleOptions> = {
      defaultLocale: options.defaultLocale || 'en',
      locales: options.locales || ['en'],
      urlPattern: options.urlPattern || 'query',
      translationsPath: options.translationsPath || './dictionaries',
      cookieName: options.cookieName || 'locale',
      queryParam: options.queryParam || 'lang',
    };

    return {
      module: I18nModule,
      controllers: [I18nSwitcherController],
      providers: [
        {
          provide: I18N_MODULE_OPTIONS,
          useValue: moduleOptions,
        },
        I18nService,
        I18nHelper,
        {
          provide: APP_INTERCEPTOR,
          useClass: I18nInterceptor,
        },
      ],
      exports: [I18nService, I18nHelper, I18N_MODULE_OPTIONS],
    };
  }
}
