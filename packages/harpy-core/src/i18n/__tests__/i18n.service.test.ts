import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from '../i18n.service';
import { I18N_MODULE_OPTIONS } from '../i18n-module.options';
import type { I18nModuleOptions } from '../i18n-module.options';
import { REQUEST } from '@nestjs/core';

describe('I18nService', () => {
  let service: I18nService;
  const mockOptions: I18nModuleOptions = {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    urlPattern: 'query',
    translationsPath: './dictionaries',
    cookieName: 'locale',
    queryParam: 'lang',
  };

  const mockRequest = {
    locale: 'en',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        I18nService,
        {
          provide: I18N_MODULE_OPTIONS,
          useValue: mockOptions,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = await module.resolve<I18nService>(I18nService);
  });

  describe('getLocale', () => {
    it('should return locale from request', () => {
      expect(service.getLocale()).toBe('en');
    });

    it('should return default locale when request locale is not set', async () => {
      const requestWithoutLocale = {};
      const module = await Test.createTestingModule({
        providers: [
          I18nService,
          {
            provide: I18N_MODULE_OPTIONS,
            useValue: mockOptions,
          },
          {
            provide: REQUEST,
            useValue: requestWithoutLocale,
          },
        ],
      }).compile();

      const serviceInstance = await module.resolve<I18nService>(I18nService);
      expect(serviceInstance.getLocale()).toBe('en');
    });
  });

  describe('getDict', () => {
    it('should return empty object when no dictionary loader registered', async () => {
      const dict = await service.getDict();
      expect(dict).toEqual({});
    });

    it('should call registered dictionary loader', async () => {
      const mockDict = { hello: 'Hello', goodbye: 'Goodbye' };
      const mockLoader = jest.fn().mockResolvedValue(mockDict);

      service.registerDictionaryLoader(mockLoader);

      const dict = await service.getDict();

      expect(mockLoader).toHaveBeenCalledWith('en');
      expect(dict).toEqual(mockDict);
    });

    it('should cache dictionary after first load', async () => {
      const mockDict = { hello: 'Hello' };
      const mockLoader = jest.fn().mockResolvedValue(mockDict);

      service.registerDictionaryLoader(mockLoader);

      await service.getDict();
      await service.getDict();

      expect(mockLoader).toHaveBeenCalledTimes(1);
    });
  });

  describe('translate', () => {
    beforeEach(() => {
      const mockDict = {
        welcome: 'Welcome',
        greeting: 'Hello {{name}}!',
        nested: {
          key: 'Nested value',
        },
      };
      service.registerDictionaryLoader(jest.fn().mockResolvedValue(mockDict));
    });

    it('should translate simple key', async () => {
      const result = await service.translate('welcome');
      expect(result).toBe('Welcome');
    });

    it('should translate with variables', async () => {
      const result = await service.translate('greeting', { name: 'John' });
      expect(result).toBe('Hello John!');
    });

    it('should translate nested key', async () => {
      const result = await service.translate('nested.key');
      expect(result).toBe('Nested value');
    });

    it('should return empty string for non-existent key', async () => {
      const result = await service.translate('nonexistent');
      expect(result).toBe('');
    });
  });
});
