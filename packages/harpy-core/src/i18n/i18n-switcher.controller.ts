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

/**
 * API Controller for handling locale switching
 *
 * Provides a proper API endpoint for changing locales
 */
@Controller('api/i18n')
export class I18nSwitcherController {
  constructor(private readonly i18nHelper: I18nHelper) {}

  /**
   * API endpoint to switch locale
   *
   * @example
   * ```typescript
   * fetch('/api/i18n/switch-locale', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ locale: 'fr' })
   * });
   * ```
   */
  @Post('switch-locale')
  switchLocale(
    @Body('locale') locale: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    // Validate locale
    if (!locale) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ error: 'Locale is required' });
    }

    // Validate and normalize locale
    const validatedLocale = this.i18nHelper.validateLocale(locale);

    // Set cookie
    this.i18nHelper.setLocaleCookie(res, validatedLocale);

    // Get the referer (where the user came from) or default to homepage
    const referer = req.headers.referer || req.headers.origin || '/';
    let currentPath = '/';
    let query: Record<string, string> = {};

    try {
      const refererUrl = new URL(referer);
      // Security check: validate it's from the same origin to prevent open redirect
      const requestOrigin = `${req.protocol}://${req.hostname}${req.hostname === 'localhost' && req.port ? ':' + req.port : ''}`;
      
      if (refererUrl.origin !== requestOrigin) {
        // External origin - use root path for security
        currentPath = '/';
      } else {
        currentPath = refererUrl.pathname;
        // Parse query params from referer
        refererUrl.searchParams.forEach((value, key) => {
          query[key] = value;
        });
      }
    } catch {
      // If referer is not a valid URL, use root path
      currentPath = '/';
    }

    // Build redirect URL based on the page the user was on
    const redirectUrl = this.i18nHelper.buildLocaleUrl(
      validatedLocale,
      currentPath,
      query,
    );

    // Return the URL for client-side navigation
    return res.send({
      success: true,
      locale: validatedLocale,
      redirectUrl,
    });
  }

  /**
   * Get i18n configuration for client-side usage
   */
  @Get('config')
  getConfig() {
    return this.i18nHelper.getClientConfig();
  }
}
