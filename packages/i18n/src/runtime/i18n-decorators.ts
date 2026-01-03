/**
 * I18n Decorators for Bun runtime
 * Parameter decorators for extracting i18n context
 */

import 'reflect-metadata';

const PARAM_METADATA = {
  PARAMS: 'harpy:params',
} as const;

interface ParamMetadata {
  index: number;
  type: string;
  data?: string;
  factory?: (ctx: any) => any;
}

const LOCALE_METADATA_KEY = Symbol('locale_param');
const DICTIONARY_METADATA_KEY = Symbol('dictionary_param');

/**
 * Parameter decorator to inject the current locale
 * 
 * @example
 * ```typescript
 * @Get('/')
 * index(@CurrentLocale() locale: string) {
 *   return { locale };
 * }
 * ```
 */
export function CurrentLocale(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey === undefined) return;

    const existingParams: ParamMetadata[] =
      Reflect.getMetadata(PARAM_METADATA.PARAMS, target, propertyKey) || [];

    existingParams.push({
      index: parameterIndex,
      type: 'custom',
      data: 'locale',
      factory: (ctx: any) => {
        // Try to get locale from request.locale (set by i18n middleware)
        return (ctx.request as any).locale || 'en';
      },
    });

    Reflect.defineMetadata(PARAM_METADATA.PARAMS, existingParams, target, propertyKey);
  };
}

/**
 * Get the parameter indices decorated with @CurrentLocale
 */
export function getLocaleParams(target: any, propertyKey: string | symbol): number[] {
  return Reflect.getMetadata(LOCALE_METADATA_KEY, target, propertyKey) || [];
}

/**
 * Parameter decorator to inject the current dictionary
 * 
 * @example
 * ```typescript
 * @Get('/')
 * index(@CurrentDictionary() dict: Record<string, any>) {
 *   return { title: dict.home.title };
 * }
 * ```
 */
export function CurrentDictionary(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey === undefined) return;

    const existingParams: ParamMetadata[] =
      Reflect.getMetadata(PARAM_METADATA.PARAMS, target, propertyKey) || [];

    existingParams.push({
      index: parameterIndex,
      type: 'custom',
      data: 'dictionary',
      factory: async (ctx: any) => {
        // Try to get dict from request.i18nContext
        const i18nCtx = (ctx.request as any).i18nContext;
        return i18nCtx?.dict || {};
      },
    });

    Reflect.defineMetadata(PARAM_METADATA.PARAMS, existingParams, target, propertyKey);
  };
}

/**
 * Get the parameter indices decorated with @CurrentDictionary
 */
export function getDictionaryParams(target: any, propertyKey: string | symbol): number[] {
  return Reflect.getMetadata(DICTIONARY_METADATA_KEY, target, propertyKey) || [];
}

/**
 * I18n context that can be attached to requests
 */
export interface I18nRequestContext {
  locale: string;
  dict: Record<string, any>;
}

/**
 * Symbol for storing i18n context on request
 */
export const I18N_CONTEXT = Symbol('i18n_context');

/**
 * Get i18n context from request
 */
export function getI18nContext(request: any): I18nRequestContext | undefined {
  return request[I18N_CONTEXT];
}

/**
 * Set i18n context on request
 */
export function setI18nContext(request: any, context: I18nRequestContext): void {
  request[I18N_CONTEXT] = context;
}
