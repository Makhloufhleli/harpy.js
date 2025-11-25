import { JsxRender, CurrentLocale } from '@hepta-solutions/harpy-core';
import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';
import Homepage, { type PageProps } from './views/homepage';
import { getDictionary, type Dictionary } from '../../i18n/get-dictionary';
import { t } from '@hepta-solutions/harpy-core';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @JsxRender(Homepage, {
    // Dynamic metadata that uses translations
    meta: async (req, data: PageProps) => {
      const dict = data.dict;
      return {
        title: t(dict, 'hero.meta.title'),
        description: t(dict, 'hero.meta.description'),
        openGraph: {
          title: t(dict, 'hero.meta.title'),
          description: t(dict, 'hero.meta.description'),
          type: 'website',
          url: 'https://example.com',
        },
        twitter: {
          card: 'summary_large_image',
          title: t(dict, 'hero.meta.title'),
          description: t(dict, 'hero.meta.description'),
        },
      };
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
