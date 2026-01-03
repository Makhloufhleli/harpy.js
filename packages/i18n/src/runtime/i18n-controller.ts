/**
 * I18n Controller for Bun runtime
 * Provides API endpoints for locale switching
 */

import { Controller, Get, Post, Body, Req } from '@harpy-js/core/runtime';
import { I18nService } from './i18n-service';
import { serializeCookie } from '@harpy-js/core/runtime';
import type { I18nOptions } from './i18n-options';
import { normalizeI18nOptions, I18N_OPTIONS } from './i18n-options';
import { Inject, Optional } from '@harpy-js/core/runtime';

@Controller('api/i18n')
export class I18nController {
  private options: Required<I18nOptions>;

  constructor(
    private readonly i18nService: I18nService,
    @Inject(I18N_OPTIONS) @Optional() options?: I18nOptions
  ) {
    this.options = normalizeI18nOptions(options || { defaultLocale: 'en', locales: ['en'] });
  }

  /**
   * Switch locale endpoint
   */
  @Post('switch-locale')
  async switchLocale(
    @Body() body: { locale?: string; redirect?: string },
    @Req() request: Request
  ): Promise<Response> {
    const { locale, redirect } = body;

    if (!locale) {
      return new Response(
        JSON.stringify({ success: false, error: 'Locale is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const validatedLocale = this.i18nService.validateLocale(locale);
    
    // Create cookie header
    const cookieHeader = serializeCookie(this.options.cookieName, validatedLocale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false, // Allow client-side access
      sameSite: 'Lax',
    });

    console.log('[I18n] Locale switched to:', validatedLocale);

    return new Response(
      JSON.stringify({
        success: true,
        locale: validatedLocale,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  }

  /**
   * Get i18n client configuration
   */
  @Get('config')
  getConfig(): Response {
    return new Response(
      JSON.stringify(this.i18nService.getClientConfig()),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
