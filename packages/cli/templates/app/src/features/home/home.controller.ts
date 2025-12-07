import { JsxRender } from '@harpy-js/core';
import { CurrentLocale } from '@harpy-js/i18n';
import { Controller, Get } from '@nestjs/common';
import HomePage, { type PageProps } from './views/homepage';
import { getDictionary } from '../../i18n/get-dictionary';

@Controller()
export class HomeController {
  @Get()
  @JsxRender(HomePage, {
    meta: {
      title:
        'Harpy.js - Modern Full-Stack NestJS Framework with React SSR (BETA)',
      description:
        'Harpy.js is a next-gen full-stack framework built on NestJS with server-side React rendering, automatic client-side hydration, 1–7ms page loads, and SEO-optimized performance. Build scalable web applications effortlessly. Beta available now.',
      canonical: 'https://www.harpyjs.org/',
      openGraph: {
        title: 'Harpy.js - Modern Full-Stack NestJS Framework with React SSR',
        description:
          'Create high-performance, SEO-friendly full-stack apps with Harpy.js. Powered by NestJS + React SSR, automatic hydration, and ultra-fast rendering. Join the beta today!',
        type: 'website',
        url: 'https://www.harpyjs.org/',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Harpy.js - Full-Stack NestJS + React SSR Framework',
        description:
          'Build blazing-fast, SEO-optimized full-stack apps with Harpy.js. NestJS backend, React SSR, automatic hydration, and 1–7ms render times. Beta release available.',
      },
    },
  })
  async homepage(@CurrentLocale() locale: string): Promise<PageProps> {
    const dict = await getDictionary(locale);

    return {
      dict,
      locale,
    };
  }
}
