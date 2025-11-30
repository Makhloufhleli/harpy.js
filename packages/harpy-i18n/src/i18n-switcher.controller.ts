import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  HttpStatus,
} from '@nestjs/common';
import { I18nHelper } from './i18n.helper';

@Controller('api/i18n')
export class I18nSwitcherController {
  constructor(private readonly i18nHelper: I18nHelper) {}

  @Post('switch-locale')
  switchLocale(
    @Body('locale') locale: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    if (!locale) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ error: 'Locale is required' });
    }

    const validatedLocale = this.i18nHelper.validateLocale(locale);
    this.i18nHelper.setLocaleCookie(res, validatedLocale);

    const referer = req.headers.referer || req.headers.origin || '/';
    let currentPath = '/';
    let query: Record<string, string> = {};

    try {
      const refererUrl = new URL(referer);
      const requestOrigin = `${req.protocol}://${req.hostname}${req.hostname === 'localhost' && req.port ? ':' + req.port : ''}`;
      
      if (refererUrl.origin !== requestOrigin) {
        currentPath = '/';
      } else {
        currentPath = refererUrl.pathname;
        refererUrl.searchParams.forEach((value, key) => {
          query[key] = value;
        });
      }
    } catch {
      currentPath = '/';
    }

    const redirectUrl = this.i18nHelper.buildLocaleUrl(
      validatedLocale,
      currentPath,
      query,
    );

    return res.send({
      success: true,
      locale: validatedLocale,
      redirectUrl,
    });
  }

  @Get('config')
  getConfig() {
    return this.i18nHelper.getClientConfig();
  }
}
