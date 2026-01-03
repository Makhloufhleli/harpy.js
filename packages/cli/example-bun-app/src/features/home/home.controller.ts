import { Controller, Get, JsxRender, WithLayout } from '@harpy-js/core/runtime';
import { HomeService } from './home.service';
import HomePage from './views/homepage';
import { Layout } from '../../layouts/layout';
import { CurrentLocale } from '@harpy-js/i18n/runtime';
import { getDictionary } from '../../i18n/dictionaries';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('/')
  @JsxRender(HomePage)
  @WithLayout(Layout)
  async homepage(@CurrentLocale() locale: string): Promise<Record<string, any>> {
    const dict = await getDictionary(locale);
    return {
      message: this.homeService.getWelcomeMessage(),
      locale,
      t: dict,
    };
  }
}
