/**
 * I18n Module - Internationalization for Harpy Framework
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * import { I18nModule } from '@hepta-solutions/harpy-core';
 *
 * @Module({
 *   imports: [
 *     I18nModule.forRoot({
 *       defaultLocale: 'en',
 *       locales: ['en', 'fr', 'es'],
 *       urlPattern: 'query', // or 'header'
 *       translationsPath: '../dictionaries',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

export { I18nModule } from "./i18n.module";
export { I18nService } from "./i18n.service";
export { I18nInterceptor } from "./i18n.interceptor";
export { I18nHelper } from "./i18n.helper";
export { I18nSwitcherController } from "./i18n-switcher.controller";
export { CurrentLocale } from "./locale.decorator";
export { t, tUnsafe } from "./t";
export { I18N_MODULE_OPTIONS } from "./i18n-module.options";
export type { I18nModuleOptions, I18nUrlPattern } from "./i18n-module.options";
export type {
  NestedKeyOf,
  DeepValue,
  ExtractVariables,
  RequiresVariables,
} from "./i18n-types";
