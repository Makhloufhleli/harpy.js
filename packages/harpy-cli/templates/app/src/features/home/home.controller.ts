import { JsxRender, I18nService, CurrentLocale } from '@hepta-solutions/harpy-core';
import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';
import Homepage, { type PageProps } from './views/homepage';
import { getDictionary, type Dictionary } from '../../i18n/get-dictionary';
import { t } from '@hepta-solutions/harpy-core';

@Controller()
export class HomeController {
  constructor(
    private readonly homeService: HomeService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @JsxRender(Homepage, {
    meta: {
      title: 'Welcome to My App',
      description: 'This is the homepage of my awesome app.',
      openGraph: {
        title: 'Welcome to My App',
        description: 'This is the homepage of my awesome app.',
        type: 'website',
        url: 'https://example.com',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Welcome to My App',
        description: 'This is the homepage of my awesome app.',
      },
    },
  })
  async homepage(@CurrentLocale() locale: string): Promise<PageProps> {
    // Get dictionary for type-safe translations
    const dict = await getDictionary(locale);

    return {
      items: this.homeService.getItems(),
      dict,
      locale,
    };
  }
}
