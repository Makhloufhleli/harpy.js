/**
 * Harpy i18n package entrypoint
 * 
 * This file exports the NestJS-based i18n module for backward compatibility.
 * For the Bun runtime version, import from '@harpy-js/i18n/runtime'
 */

// NestJS-based exports (legacy)
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
