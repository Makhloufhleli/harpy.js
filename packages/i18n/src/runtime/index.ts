/**
 * Bun runtime i18n module exports
 */

// Options and configuration
export { I18N_OPTIONS, normalizeI18nOptions } from './i18n-options';
export type { I18nOptions, I18nUrlPattern } from './i18n-options';

// Service
export { I18nService } from './i18n-service';
export type { I18nContext } from './i18n-service';

// Middleware
export { 
  createI18nMiddleware, 
  detectLocale, 
  getLocaleFromRequest,
  getI18nContextFromRequest,
} from './i18n-middleware';
export type { I18nRequest, I18nMiddlewareResult } from './i18n-middleware';

// Module
export { I18nModule, createI18nModule } from './i18n-module';
export type { I18nModuleConfig } from './i18n-module';

// Decorators
export {
  CurrentLocale,
  CurrentDictionary,
  getLocaleParams,
  getDictionaryParams,
  getI18nContext,
  setI18nContext,
  I18N_CONTEXT,
} from './i18n-decorators';
export type { I18nRequestContext } from './i18n-decorators';

// Controller
export { I18nController } from './i18n-controller';

// Helper
export { I18nHelper, createI18nHelper } from './i18n-helper';

// Translation functions
export { t, tUnsafe, createTranslator } from './translate';
