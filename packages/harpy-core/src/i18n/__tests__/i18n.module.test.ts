import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule } from '../i18n.module';
import { I18nService } from '../i18n.service';
import { I18nHelper } from '../i18n.helper';
import { I18nSwitcherController } from '../i18n-switcher.controller';
import { I18N_MODULE_OPTIONS } from '../i18n-module.options';

describe('I18nModule', () => {
  it('should be defined', () => {
    expect(I18nModule).toBeDefined();
  });

  describe('forRoot', () => {
    it('should create a dynamic module with default options', async () => {
      const module = I18nModule.forRoot({
        defaultLocale: 'en',
        locales: ['en', 'fr'],
      });

      expect(module.module).toBe(I18nModule);
      expect(module.controllers).toContain(I18nSwitcherController);
      expect(module.providers).toBeDefined();
      expect(module.exports).toBeDefined();
    });

    it('should provide I18nService', async () => {
      const testModule: TestingModule = await Test.createTestingModule({
        imports: [
          I18nModule.forRoot({
            defaultLocale: 'en',
            locales: ['en', 'fr'],
          }),
        ],
      }).compile();

      const service = await testModule.resolve<I18nService>(I18nService);
      expect(service).toBeDefined();
    });

    it('should provide I18nHelper', async () => {
      const testModule: TestingModule = await Test.createTestingModule({
        imports: [
          I18nModule.forRoot({
            defaultLocale: 'en',
            locales: ['en', 'fr'],
          }),
        ],
      }).compile();

      const helper = testModule.get<I18nHelper>(I18nHelper);
      expect(helper).toBeDefined();
    });

    it('should apply default values for missing options', async () => {
      const module = I18nModule.forRoot({
        defaultLocale: 'en',
        locales: ['en'],
      });

      const optionsProvider = module.providers?.find(
        (p: any) => p.provide === I18N_MODULE_OPTIONS,
      ) as any;

      expect(optionsProvider.useValue).toEqual({
        defaultLocale: 'en',
        locales: ['en'],
        urlPattern: 'query',
        translationsPath: './dictionaries',
        cookieName: 'locale',
        queryParam: 'lang',
      });
    });

    it('should preserve custom options', async () => {
      const module = I18nModule.forRoot({
        defaultLocale: 'fr',
        locales: ['fr', 'en', 'es'],
        urlPattern: 'header',
        translationsPath: '../locales',
        cookieName: 'user_locale',
        queryParam: 'language',
      });

      const optionsProvider = module.providers?.find(
        (p: any) => p.provide === I18N_MODULE_OPTIONS,
      ) as any;

      expect(optionsProvider.useValue).toEqual({
        defaultLocale: 'fr',
        locales: ['fr', 'en', 'es'],
        urlPattern: 'header',
        translationsPath: '../locales',
        cookieName: 'user_locale',
        queryParam: 'language',
      });
    });
  });
});
