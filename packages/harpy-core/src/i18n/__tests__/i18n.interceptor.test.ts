import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { I18nInterceptor } from '../i18n.interceptor';
import { I18N_MODULE_OPTIONS } from '../i18n-module.options';
import type { I18nModuleOptions } from '../i18n-module.options';
import { of } from 'rxjs';

describe('I18nInterceptor', () => {
  let interceptor: I18nInterceptor;
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
        I18nInterceptor,
        {
          provide: I18N_MODULE_OPTIONS,
          useValue: mockOptions,
        },
      ],
    }).compile();

    interceptor = module.get<I18nInterceptor>(I18nInterceptor);
  });

  const createMockContext = (request: any, response?: any): ExecutionContext => {
    const mockResponse = response || {
      header: jest.fn(),
    };
    
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => mockResponse,
        getNext: jest.fn(),
      }),
    } as any;
  };

  const createMockCallHandler = (): CallHandler => {
    return {
      handle: () => of({}),
    } as any;
  };

  describe('Query pattern locale detection', () => {
    it('should extract locale from query parameter', (done) => {
      const mockRequest: any = {
        query: { lang: 'fr' },
        headers: {},
      };
      const context = createMockContext(mockRequest);
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe(() => {
        expect(mockRequest.locale).toBe('fr');
        done();
      });
    });

    it('should ignore invalid query locale', (done) => {
      const mockRequest: any = {
        query: { lang: 'invalid' },
        headers: {},
      };
      const context = createMockContext(mockRequest);
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe(() => {
        expect(mockRequest.locale).toBe('en');
        done();
      });
    });
  });

  describe('Cookie locale detection', () => {
    it('should extract locale from cookie', (done) => {
      const mockRequest: any = {
        query: {},
        headers: {
          cookie: 'locale=fr; other=value',
        },
      };
      const context = createMockContext(mockRequest);
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe(() => {
        expect(mockRequest.locale).toBe('fr');
        done();
      });
    });

    it('should ignore invalid cookie locale', (done) => {
      const mockRequest: any = {
        query: {},
        headers: {
          cookie: 'locale=invalid',
        },
      };
      const context = createMockContext(mockRequest);
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe(() => {
        expect(mockRequest.locale).toBe('en');
        done();
      });
    });
  });

  describe('Header locale detection', () => {
    it('should extract locale from x-lang header when using header pattern', (done) => {
      // Create interceptor with header pattern
      const headerInterceptor = new I18nInterceptor({
        ...mockOptions,
        urlPattern: 'header',
      });
      
      const mockRequest: any = {
        query: {},
        headers: {
          'x-lang': 'fr',
        },
      };
      const context = createMockContext(mockRequest);
      const next = createMockCallHandler();

      headerInterceptor.intercept(context, next).subscribe(() => {
        expect(mockRequest.locale).toBe('fr');
        done();
      });
    });

    it('should extract locale from accept-language header as fallback', (done) => {
      const mockRequest: any = {
        query: {},
        headers: {
          'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8',
        },
      };
      const context = createMockContext(mockRequest);
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe(() => {
        expect(mockRequest.locale).toBe('fr');
        done();
      });
    });
  });

  describe('Locale priority', () => {
    it('should prioritize query over cookie', (done) => {
      const mockRequest: any = {
        query: { lang: 'es' },
        headers: {
          cookie: 'locale=fr',
        },
      };
      const context = createMockContext(mockRequest);
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe(() => {
        expect(mockRequest.locale).toBe('es');
        done();
      });
    });

    it('should prioritize cookie over accept-language header', (done) => {
      const mockRequest: any = {
        query: {},
        headers: {
          cookie: 'locale=fr',
          'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
        },
      };
      const context = createMockContext(mockRequest);
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe(() => {
        expect(mockRequest.locale).toBe('fr');
        done();
      });
    });

    it('should fall back to default locale when nothing matches', (done) => {
      const mockRequest: any = {
        query: {},
        headers: {},
      };
      const context = createMockContext(mockRequest);
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe(() => {
        expect(mockRequest.locale).toBe('en');
        done();
      });
    });

    it('should set cookie when locale is found in URL', (done) => {
      const mockResponse = {
        header: jest.fn(),
      };
      const mockRequest: any = {
        query: { lang: 'fr' },
        headers: {},
      };
      const context = createMockContext(mockRequest, mockResponse);
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe(() => {
        expect(mockRequest.locale).toBe('fr');
        expect(mockResponse.header).toHaveBeenCalledWith(
          'Set-Cookie',
          expect.stringContaining('locale=fr'),
        );
        done();
      });
    });
  });
});
