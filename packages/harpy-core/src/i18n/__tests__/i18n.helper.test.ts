import { Test, TestingModule } from '@nestjs/testing';
import { I18nHelper } from '../i18n.helper';
import { I18N_MODULE_OPTIONS } from '../i18n-module.options';
import type { I18nModuleOptions } from '../i18n-module.options';

describe('I18nHelper', () => {
  let helper: I18nHelper;
  const mockOptions: I18nModuleOptions = {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'es'],
    urlPattern: 'query',
    translationsPath: './dictionaries',
    cookieName: 'locale',
    queryParam: 'lang',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        I18nHelper,
        {
          provide: I18N_MODULE_OPTIONS,
          useValue: mockOptions,
        },
      ],
    }).compile();

    helper = module.get<I18nHelper>(I18nHelper);
  });

  describe('buildLocaleUrl', () => {
    describe('query pattern', () => {
      it('should build URL with query parameter', () => {
        const url = helper.buildLocaleUrl('fr', '/home');
        expect(url).toBe('/home?lang=fr');
      });

      it('should preserve existing query parameters', () => {
        const url = helper.buildLocaleUrl('fr', '/home', { page: '2' });
        expect(url).toContain('lang=fr');
        expect(url).toContain('page=2');
      });

      it('should replace existing lang parameter', () => {
        const url = helper.buildLocaleUrl('fr', '/home', { lang: 'en' });
        expect(url).toBe('/home?lang=fr');
      });
    });

    describe('header pattern', () => {
      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            I18nHelper,
            {
              provide: I18N_MODULE_OPTIONS,
              useValue: { ...mockOptions, urlPattern: 'header' },
            },
          ],
        }).compile();

        helper = module.get<I18nHelper>(I18nHelper);
      });

      it('should return path without query for header pattern', () => {
        const url = helper.buildLocaleUrl('fr', '/home');
        expect(url).toBe('/home');
      });

      it('should preserve existing query parameters', () => {
        const url = helper.buildLocaleUrl('fr', '/home', { page: '2' });
        expect(url).toBe('/home?page=2');
      });
    });
  });

  describe('setLocaleCookie', () => {
    it('should set cookie with correct name and value', () => {
      const mockRes = {
        setCookie: jest.fn(),
      };

      helper.setLocaleCookie(mockRes, 'fr');

      expect(mockRes.setCookie).toHaveBeenCalledWith(
        'locale',
        'fr',
        expect.objectContaining({
          path: '/',
          maxAge: 365 * 24 * 60 * 60,
          httpOnly: false,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('validateLocale', () => {
    it('should return valid locale', () => {
      expect(helper.validateLocale('fr')).toBe('fr');
      expect(helper.validateLocale('es')).toBe('es');
    });

    it('should return default locale for invalid locale', () => {
      expect(helper.validateLocale('de')).toBe('en');
      expect(helper.validateLocale('invalid')).toBe('en');
    });

    it('should return default locale for empty string', () => {
      expect(helper.validateLocale('')).toBe('en');
    });
  });

  describe('getClientConfig', () => {
    it('should return client configuration', () => {
      const config = helper.getClientConfig();

      expect(config).toEqual({
        locales: ['en', 'fr', 'es'],
        defaultLocale: 'en',
        urlPattern: 'query',
        queryParam: 'lang',
      });
    });
  });
});
